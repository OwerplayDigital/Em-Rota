import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/telegram-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Log basic info
        console.log('[Webhook] POST received at /api/public/telegram-webhook');
        
        const botToken = process.env['TELEGRAM_BOT_TOKEN'];
        const allowedUserId = process.env['TELEGRAM_ALLOWED_USER_ID'];

        if (!botToken || !allowedUserId) {
          console.error('[Webhook] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ALLOWED_USER_ID');
          return new Response('Config Error', { status: 500 });
        }

        try {
          const body = await request.json();
          console.log('[Webhook] Update Body:', JSON.stringify(body));

          const from = body.message?.from || body.callback_query?.from;
          const chatId = from?.id?.toString();
          const text = body.message?.text;
          const callbackData = body.callback_query?.data;

          if (!chatId) return new Response('OK', { status: 200 });

          // 1. Authorization check
          console.log(`[Webhook] User check: ${chatId} vs ${allowedUserId}`);
          if (chatId !== allowedUserId) {
            console.warn(`[Webhook] Unauthorized user: ${chatId}`);
            await sendTelegramMessage(botToken, chatId, 'Acesso negado.');
            return new Response('Unauthorized', { status: 200 });
          }

          // 2. Handle Commands
          const input = (callbackData || text || '') as string;
          console.log(`[Webhook] Processing input: ${input}`);

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
            await handleNumericInput(botToken, chatId, input);
          } else {
            await sendTelegramMessage(botToken, chatId, 'Comando não reconhecido.', getMainKeyboard());
          }

          return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        } catch (error) {
          console.error('[Webhook] Processing error:', error);
          return new Response('Error', { status: 500 });
        }
      },
    },
  },
});

async function sendTelegramMessage(token: string, chatId: string, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML',
      }),
    });
    const result = await res.json();
    console.log(`[Webhook] sendMessage response for ${chatId}:`, JSON.stringify(result));
  } catch (e) {
    console.error(`[Webhook] sendMessage error:`, e);
  }
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

async function handleIniciarJornada(token: string, chatId: string) {
  const today = new Date().toISOString().split('T')[0]!;
  const { data: activeSession } = await supabaseAdmin.from('sessions').select('id').eq('status', 'active').maybeSingle();
  if (activeSession) {
    await sendTelegramMessage(token, chatId, 'Existe uma jornada em andamento.');
    return;
  }
  let { data: workDay } = await supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle();
  if (!workDay) {
    const { data: newWorkDay, error } = await supabaseAdmin.from('work_days').insert({ date: today, status: 'in_progress' }).select().single();
    if (error) return sendTelegramMessage(token, chatId, 'Erro ao criar o dia.');
    workDay = newWorkDay;
  }
  if (workDay.status === 'completed') return sendTelegramMessage(token, chatId, 'Dia já fechado.');
  if (workDay.odometer_start === null) {
    await sendTelegramMessage(token, chatId, 'Qual é o odômetro atual da bike?');
  } else {
    await supabaseAdmin.from('sessions').insert({ work_day_id: workDay.id, status: 'active', start_time: new Date().toISOString() });
    await sendTelegramMessage(token, chatId, `Jornada iniciada às ${new Date().toLocaleTimeString('pt-BR')}.`);
  }
}

async function handleEncerrarJornada(token: string, chatId: string) {
  const { data: activeSession } = await supabaseAdmin.from('sessions').select('*, work_days(*)').eq('status', 'active').maybeSingle();
  if (!activeSession) return sendTelegramMessage(token, chatId, 'Não há jornada ativa.');
  const endTime = new Date();
  await supabaseAdmin.from('sessions').update({ status: 'completed', end_time: endTime.toISOString() }).eq('id', activeSession.id);
  await sendTelegramMessage(token, chatId, `Jornada encerrada às ${endTime.toLocaleTimeString('pt-BR')}.`);
}

async function handleFecharDia(token: string, chatId: string) {
  const today = new Date().toISOString().split('T')[0]!;
  const { data: activeSession } = await supabaseAdmin.from('sessions').select('id').eq('status', 'active').maybeSingle();
  if (activeSession) return sendTelegramMessage(token, chatId, 'Encerre a jornada antes.');
  const { data: workDay } = await supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle();
  if (!workDay) return sendTelegramMessage(token, chatId, 'Sem atividade hoje.');
  if (workDay.status === 'completed') return sendTelegramMessage(token, chatId, 'Dia já fechado.');
  await sendTelegramMessage(token, chatId, 'Qual é o odômetro final?');
}

async function handleNumericInput(token: string, chatId: string, input: string) {
  const value = parseFloat(input.replace(',', '.'));
  const today = new Date().toISOString().split('T')[0]!;
  const { data: workDay } = await supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle();
  if (!workDay || workDay.status === 'completed') return;

  if (workDay.odometer_start === null) {
    await supabaseAdmin.from('work_days').update({ odometer_start: Math.round(value) }).eq('id', workDay.id);
    await supabaseAdmin.from('sessions').insert({ work_day_id: workDay.id, status: 'active', start_time: new Date().toISOString() });
    await sendTelegramMessage(token, chatId, `Odômetro inicial salvo: ${Math.round(value)} km. Jornada iniciada.`);
  } else if (workDay.odometer_end === null) {
    await supabaseAdmin.from('work_days').update({ odometer_end: Math.round(value) }).eq('id', workDay.id);
    await sendTelegramMessage(token, chatId, 'Quantas entregas hoje?');
  } else if (workDay.total_deliveries === 0 || workDay.total_deliveries === null) {
    await supabaseAdmin.from('work_days').update({ total_deliveries: Math.round(value) }).eq('id', workDay.id);
    await sendTelegramMessage(token, chatId, 'Quanto você ganhou hoje?');
  } else if (workDay.total_earned === 0 || workDay.total_earned === null || workDay.total_earned === 0) {
    await supabaseAdmin.from('work_days').update({ total_earned: value, status: 'completed' }).eq('id', workDay.id);
    await sendTelegramMessage(token, chatId, `Dia fechado com sucesso!`, getMainKeyboard());
  }
}

async function handleResumo(token: string, chatId: string) {
  const today = new Date().toISOString().split('T')[0]!;
  const { data: workDay } = await supabaseAdmin.from('work_days').select('*, sessions(*)').eq('date', today).maybeSingle();
  if (!workDay) return sendTelegramMessage(token, chatId, 'Sem atividade hoje.');
  let totalDurationMs = 0;
  workDay.sessions?.forEach((s: any) => {
    const start = new Date(s.start_time).getTime();
    const end = s.end_time ? new Date(s.end_time).getTime() : new Date().getTime();
    totalDurationMs += (end - start);
  });
  const hours = totalDurationMs / (1000 * 60 * 60);
  const km = (workDay.odometer_end && workDay.odometer_start) ? (workDay.odometer_end - workDay.odometer_start) : 0;
  const earnings = Number(workDay.total_earned) || 0;
  let msg = `<b>Resumo (${workDay.date})</b>\n\n`;
  msg += `Ganhos: R$ ${earnings.toFixed(2)}\nKm: ${km} km\nTempo: ${Math.floor(hours)}h${Math.round((hours % 1) * 60)}min`;
  await sendTelegramMessage(token, chatId, msg, getMainKeyboard());
}
