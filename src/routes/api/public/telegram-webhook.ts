import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/telegram-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const botToken = process.env['TELEGRAM_BOT_TOKEN'];
        const allowedUserId = process.env['TELEGRAM_ALLOWED_USER_ID'];

        console.log(`[Webhook] Initialization. BotToken present: ${!!botToken}, AllowedUserID present: ${!!allowedUserId}`);
        console.log(`[Webhook] AllowedUserID value: "${allowedUserId}"`);

        if (!botToken || !allowedUserId) {
          console.error('Missing environment variables: TELEGRAM_BOT_TOKEN or TELEGRAM_ALLOWED_USER_ID');
          return new Response('Configuration Error', { status: 500 });
        }

        try {
          const body = await request.json();
          console.log('Received Telegram update:', JSON.stringify(body));

          const from = body.message?.from || body.callback_query?.from;
          const chatId = from?.id?.toString();
          const text = body.message?.text;
          const callbackData = body.callback_query?.data;

          if (!chatId) return new Response('OK');

          // 1. Authorization check
          console.log(`[Webhook] Comparing: incoming chatId "${chatId}" (type: ${typeof chatId}) vs allowedUserId "${allowedUserId}" (type: ${typeof allowedUserId})`);
          
          if (chatId !== allowedUserId) {
            console.warn(`[Webhook] Access denied for chatId: ${chatId}`);
            await sendTelegramMessage(botToken, chatId, 'Acesso negado. Este bot é privado.');
            return new Response('Unauthorized', { status: 200 }); // Still return 200 to Telegram
          }

          // 2. Handle Commands and Callbacks
          const input = (callbackData || text || '') as string;

          if (input === '/start') {
            await sendStartMenu(botToken, chatId);
          } else if (input === '/resumo' || input === 'RESUMO') {
            await handleResumo(botToken, chatId);
          } else if (input === '/iniciar' || input === 'INICIAR JORNADA') {
            await handleIniciarJornada(botToken, chatId);
          } else if (input === '/encerrar' || input === 'ENCERRAR JORNADA') {
            await handleEncerrarJornada(botToken, chatId);
          } else if (input === '/fechar' || input === 'FECHAR DIA') {
            await handleFecharDia(botToken, chatId);
          } else if (input === '/cancelar') {
            await sendTelegramMessage(botToken, chatId, 'Operação cancelada.', getMainKeyboard());
          } else if (input && /^\d+([.,]\d+)?$/.test(input)) {
            // Handle numeric input for odometer, deliveries, or earnings
            await handleNumericInput(botToken, chatId, input);
          } else {
            await sendTelegramMessage(botToken, chatId, 'Comando não reconhecido. Use o menu abaixo.', getMainKeyboard());
          }

          return new Response('OK');
        } catch (error) {
          console.error('Error processing Telegram webhook:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
    },
  },
});

// --- Helper Functions ---

async function sendTelegramMessage(token: string, chatId: string, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup: replyMarkup,
      parse_mode: 'HTML',
    }),
  });
}

function getMainKeyboard() {
  return {
    keyboard: [
      [{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }],
      [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }],
    ],
    resize_keyboard: true,
  };
}

async function sendStartMenu(token: string, chatId: string) {
  await sendTelegramMessage(
    token,
    chatId,
    'Olá! Eu sou o assistente do projeto <b>Diária</b>.\n\nUse os botões abaixo para registrar sua atividade.',
    getMainKeyboard()
  );
}

// --- Business Logic Handlers ---

async function handleIniciarJornada(token: string, chatId: string) {
  const today = new Date().toISOString().split('T')[0]!;

  // Check for active session
  const { data: activeSession } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('status', 'active')
    .maybeSingle();

  if (activeSession) {
    await sendTelegramMessage(token, chatId, 'Existe uma jornada em andamento. Encerre-a antes de iniciar uma nova.');
    return;
  }

  // Get or create work_day
  let { data: workDay } = await supabaseAdmin
    .from('work_days')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (!workDay) {
    const { data: newWorkDay, error } = await supabaseAdmin
      .from('work_days')
      .insert({ date: today, status: 'in_progress' })
      .select()
      .single();
    
    if (error) {
      await sendTelegramMessage(token, chatId, 'Erro ao criar o dia de trabalho.');
      return;
    }
    workDay = newWorkDay;
  }

  if (workDay && workDay.status === 'completed') {
    await sendTelegramMessage(token, chatId, 'Este dia já foi fechado. Não é possível iniciar novas jornadas.');
    return;
  }

  if (workDay && workDay.odometer_start === null) {
    await sendTelegramMessage(token, chatId, 'Qual é o odômetro atual da bike?');
  } else if (workDay) {
    // Start session directly if odometer is already recorded
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({ work_day_id: workDay.id, status: 'active', start_time: new Date().toISOString() });

    if (sessionError) {
      await sendTelegramMessage(token, chatId, 'Erro ao iniciar a jornada.');
      return;
    }

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await sendTelegramMessage(token, chatId, `Jornada iniciada às ${now}.\nOdômetro inicial: ${workDay.odometer_start} km.`);
  }
}

async function handleEncerrarJornada(token: string, chatId: string) {
  const { data: activeSession, error: sessionFetchError } = await supabaseAdmin
    .from('sessions')
    .select('*, work_days(*)')
    .eq('status', 'active')
    .maybeSingle();

  if (!activeSession || sessionFetchError) {
    await sendTelegramMessage(token, chatId, 'Não há nenhuma jornada ativa para encerrar.');
    return;
  }

  const endTime = new Date();
  const startTime = new Date(activeSession.start_time);
  const durationMs = endTime.getTime() - startTime.getTime();
  
  const { error: updateError } = await supabaseAdmin
    .from('sessions')
    .update({ 
      status: 'completed', 
      end_time: endTime.toISOString() 
    })
    .eq('id', activeSession.id);

  if (updateError) {
    await sendTelegramMessage(token, chatId, 'Erro ao encerrar a jornada.');
    return;
  }

  // Calculate total time for the day
  const { data: allSessions } = await supabaseAdmin
    .from('sessions')
    .select('start_time, end_time')
    .eq('work_day_id', activeSession.work_day_id)
    .eq('status', 'completed');

  let totalDurationMs = 0;
  allSessions?.forEach(s => {
    if (s.start_time && s.end_time) {
      totalDurationMs += new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
    }
  });

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, '0')}min`;
  };

  await sendTelegramMessage(
    token, 
    chatId, 
    `Jornada encerrada.\nEsta jornada: ${formatDuration(durationMs)}\nTotal hoje: ${formatDuration(totalDurationMs)}`
  );
}

async function handleFecharDia(token: string, chatId: string) {
  const today = new Date().toISOString().split('T')[0]!;

  const { data: activeSession } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('status', 'active')
    .maybeSingle();

  if (activeSession) {
    await sendTelegramMessage(token, chatId, 'Você ainda tem uma jornada ativa. Encerre-a antes de fechar o dia.');
    return;
  }

  const { data: workDay } = await supabaseAdmin
    .from('work_days')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (!workDay) {
    await sendTelegramMessage(token, chatId, 'Nenhuma atividade registrada para hoje.');
    return;
  }

  if (workDay.status === 'completed') {
    await sendTelegramMessage(token, chatId, 'O dia de hoje já está fechado.');
    return;
  }

  await sendTelegramMessage(token, chatId, 'Qual é o odômetro final?');
}

async function handleNumericInput(token: string, chatId: string, input: string) {
  const value = parseFloat(input.replace(',', '.'));
  const today = new Date().toISOString().split('T')[0]!;

  const { data: workDay } = await supabaseAdmin
    .from('work_days')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (!workDay || workDay.status === 'completed') return;

  // Flow 1: odometer_start
  if (workDay.odometer_start === null) {
    const { error } = await supabaseAdmin
      .from('work_days')
      .update({ odometer_start: Math.round(value) })
      .eq('id', workDay.id);

    if (error) {
      await sendTelegramMessage(token, chatId, 'Erro ao salvar o odômetro inicial.');
      return;
    }

    // After saving odometer, start the first session
    await supabaseAdmin
      .from('sessions')
      .insert({ work_day_id: workDay.id, status: 'active', start_time: new Date().toISOString() });

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await sendTelegramMessage(token, chatId, `Odômetro inicial salvo: ${Math.round(value)} km.\nJornada iniciada às ${now}.`);
    return;
  }

  // Flow 2: odometer_end
  if (workDay.odometer_end === null) {
     const { error } = await supabaseAdmin
      .from('work_days')
      .update({ odometer_end: Math.round(value) })
      .eq('id', workDay.id);

    if (error) {
      await sendTelegramMessage(token, chatId, 'Erro ao salvar o odômetro final.');
      return;
    }

    await sendTelegramMessage(token, chatId, 'Quantas entregas você fez hoje?');
    return;
  }

  // Flow 3: total_deliveries
  if (workDay.total_deliveries === 0 || workDay.total_deliveries === null) {
     const { error } = await supabaseAdmin
      .from('work_days')
      .update({ total_deliveries: Math.round(value) })
      .eq('id', workDay.id);

    if (error) {
      await sendTelegramMessage(token, chatId, 'Erro ao salvar a quantidade de entregas.');
      return;
    }

    await sendTelegramMessage(token, chatId, 'Quanto você ganhou hoje?');
    return;
  }

  // Flow 4: total_earned
  if (workDay.total_earned === 0 || workDay.total_earned === null || workDay.total_earned === 0.00) {
     const { error } = await supabaseAdmin
      .from('work_days')
      .update({ 
        total_earned: value,
        status: 'completed'
      })
      .eq('id', workDay.id);

    if (error) {
      await sendTelegramMessage(token, chatId, 'Erro ao salvar os ganhos.');
      return;
    }

    await sendTelegramMessage(token, chatId, `Dia fechado com sucesso!\n\nUse /resumo para ver os indicadores.`, getMainKeyboard());
    return;
  }
}

async function handleResumo(token: string, chatId: string) {
  const today = new Date().toISOString().split('T')[0]!;

  const { data: workDay } = await supabaseAdmin
    .from('work_days')
    .select('*, sessions(*)')
    .eq('date', today)
    .maybeSingle();

  if (!workDay) {
    await sendTelegramMessage(token, chatId, 'Nenhuma atividade registrada hoje.');
    return;
  }

  let totalDurationMs = 0;
  workDay.sessions?.forEach((s: any) => {
    const start = new Date(s.start_time).getTime();
    const end = s.end_time ? new Date(s.end_time).getTime() : new Date().getTime();
    totalDurationMs += (end - start);
  });

  const hours = totalDurationMs / (1000 * 60 * 60);
  const km = (workDay.odometer_end && workDay.odometer_start) ? (workDay.odometer_end - workDay.odometer_start) : 0;
  
  const earnings = Number(workDay.total_earned) || 0;
  const deliveries = workDay.total_deliveries || 0;

  const rh = hours > 0 ? (earnings / hours).toFixed(2) : '0.00';
  const rkm = km > 0 ? (earnings / km).toFixed(2) : '0.00';
  const rentrega = deliveries > 0 ? (earnings / deliveries).toFixed(2) : '0.00';

  const formatDuration = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h${m.toString().padStart(2, '0')}min`;
  };

  let msg = `<b>Resumo de Hoje (${workDay.date})</b>\n\n`;
  msg += `Ganhos: R$ ${earnings.toFixed(2)}\n`;
  msg += `Km rodados: ${km} km\n`;
  msg += `Tempo total: ${formatDuration(totalDurationMs)}\n`;
  msg += `Entregas: ${deliveries}\n\n`;
  msg += `<b>Indicadores:</b>\n`;
  msg += `R$/hora: R$ ${rh}\n`;
  msg += `R$/km: R$ ${rkm}\n`;
  msg += `R$/entrega: R$ ${rentrega}`;

  if (workDay.status !== 'completed') {
    msg += `\n\n<i>* O dia ainda não foi fechado.</i>`;
  }

  await sendTelegramMessage(token, chatId, msg, getMainKeyboard());
}
