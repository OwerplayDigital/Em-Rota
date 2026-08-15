import { supabaseAdmin } from './client.server';

export const handleTelegramUpdate = async (body: any) => {
  const botToken = (process.env['TELEGRAM_BOT_TOKEN'] ?? '') as string;
  const allowedUserId = (process.env['TELEGRAM_ALLOWED_USER_ID'] ?? '') as string;

  if (!botToken || !allowedUserId) return;

  const send = async (text: string, markup?: any) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: allowedUserId, text, parse_mode: 'HTML', reply_markup: markup }),
    });
  };

  const msg = body.message;
  if (!msg || String(msg.from?.id) !== allowedUserId) return;

  const textInput = (msg.text || '') as string;
  const getUserToday = () => {
    return new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };
  const today = getUserToday();

  
  // Helpers
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h${minutes}min`;
  };

  const formatCurrency = (val: number | null) => val ? `R$ ${val.toFixed(2).replace('.', ',')}` : 'Ainda não informado';

  const getActiveWorkDay = async (): Promise<any> => {
    const res = await (supabaseAdmin.from('work_days').select('*').eq('date', today as any).maybeSingle() as any);
    return res.data;
  };

  const getActiveSession = async (): Promise<any> => {
    const activeRes = await (supabaseAdmin.from('sessions').select('*').eq('status', 'active' as any).maybeSingle() as any);
    return activeRes.data;
  };

  const getSummary = async (day: any) => {
    const { data: sessions } = await (supabaseAdmin.from('sessions').select('*').eq('work_day_id', day.id).eq('status', 'completed' as any) as any);
    
    let totalMs = 0;
    (sessions as any[])?.forEach(s => {
      if (s.start_time && s.end_time) {
        totalMs += new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
      }
    });

    const distance = (day.odometer_end && day.odometer_start) ? (day.odometer_end - day.odometer_start) : null;
    const hours = totalMs / 3600000;
    
    const perHour = (hours > 0 && day.total_earned) ? (day.total_earned / hours) : null;
    const perKm = (distance && distance > 0 && day.total_earned) ? (day.total_earned / distance) : null;
    const perDelivery = (day.total_deliveries && day.total_deliveries > 0 && day.total_earned) ? (day.total_earned / day.total_deliveries) : null;

    return `<b>RESUMO DE HOJE</b>\n\n` +
      `<b>Ganhos:</b>\n${formatCurrency(day.total_earned)}\n\n` +
      `<b>Entregas:</b>\n${day.total_deliveries ?? 'Ainda não informado'}\n\n` +
      `<b>Distância:</b>\n${distance ? `${distance} km` : 'Ainda não informado'}\n\n` +
      `<b>Tempo na rua:</b>\n${formatDuration(totalMs)}\n\n` +
      `<b>Odômetro:</b>\n${day.odometer_start ?? '?'}${day.odometer_end ? ` → ${day.odometer_end}` : ''} km\n\n` +
      `<b>MÉDIAS</b>\n\n` +
      `${formatCurrency(perHour)}/h\n` +
      `${formatCurrency(perKm)}/km\n` +
      `${formatCurrency(perDelivery)}/entrega`;
  };

  const mainMenu = {
    keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'RESUMO' }, { text: 'FECHAR DIA' }]],
    resize_keyboard: true
  };

  const cancelMenu = {
    keyboard: [[{ text: 'CANCELAR' }]],
    resize_keyboard: true
  };

  // Logic
  const activeSession = await getActiveSession();
  const activeDay = await getActiveWorkDay();

  if (textInput === '/start' || textInput === 'MENU' || textInput === 'MENU PRINCIPAL') {
    let statusMsg = activeSession ? '🏃 Jornada em andamento.' : '⏸️ Nenhuma jornada ativa.';
    if (activeDay?.status === 'completed') statusMsg = '🏁 Dia fechado.';
    
    await send(`<b>EM ROTA</b>\n\n${statusMsg}`, mainMenu);
    return;
  }

  if (textInput === 'CANCELAR') {
    await send('Operação cancelada.', mainMenu);
    return;
  }

  if (textInput === 'INICIAR JORNADA') {
    if (activeDay?.status === 'completed') {
      await send('⚠️ O dia já foi fechado. Não é possível iniciar novas jornadas.', mainMenu);
      return;
    }
    if (activeSession) {
      const startTime = new Date(activeSession.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await send(`Você já tem uma jornada em andamento.\n\nInício: ${startTime}\nOdômetro: ${activeDay?.odometer_start ?? 'Não informado'}`, {
        keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'RESUMO' }], [{ text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }
    
    if (!activeDay || activeDay.odometer_start === null) {
      await send('Qual é o odômetro atual da bike?', cancelMenu);
      return;
    }

    await (supabaseAdmin.from('sessions').insert({ work_day_id: activeDay.id, status: 'active' as any }) as any);
    await send('Jornada iniciada!', {
      keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'RESUMO' }]],
      resize_keyboard: true
    });
    return;
  }

  if (textInput === 'ENCERRAR JORNADA') {
    if (!activeSession) {
      await send('Não existe nenhuma jornada em andamento.', mainMenu);
      return;
    }

    const endTime = new Date().toISOString();
    await (supabaseAdmin.from('sessions').update({ end_time: endTime, status: 'completed' as any }).eq('id', activeSession.id) as any);
    
    const day = await getActiveWorkDay();
    if (!day) return;
    const { data: sessions } = await (supabaseAdmin.from('sessions').select('*').eq('work_day_id', day.id).eq('status', 'completed' as any) as any);
    
    const thisSessionMs = new Date(endTime).getTime() - new Date(activeSession.start_time).getTime();
    let totalMs = 0;
    (sessions as any[])?.forEach(s => {
      if (s.start_time && s.end_time) totalMs += new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
    });

    const distance = (day.odometer_end && day.odometer_start) ? (day.odometer_end - day.odometer_start) : null;

    await send(`<b>JORNADA ENCERRADA</b>\n\nDuração desta jornada:\n${formatDuration(thisSessionMs)}\n\n<b>TOTAL DE HOJE:</b>\nTempo na rua: ${formatDuration(totalMs)}\nDistância: ${distance ? `${distance} km` : 'Ainda não informado'}\nGanhos: ${formatCurrency(day.total_earned)}\nEntregas: ${day.total_deliveries ?? 'Ainda não informado'}`, {
      keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'FECHAR DIA' }], [{ text: 'RESUMO' }, { text: 'MENU' }]],
      resize_keyboard: true
    });
    return;
  }

  if (textInput === 'RESUMO') {
    if (!activeDay) {
      await send('Nenhum dado para hoje.', mainMenu);
    } else {
      const summary = await getSummary(activeDay);
      await send(summary, mainMenu);
    }
    return;
  }

  if (textInput === 'FECHAR DIA') {
    if (activeSession) {
      await send('Você ainda tem uma jornada em andamento. Encerre a jornada antes de fechar o dia.', {
        keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }
    if (!activeDay) {
      await send('Nenhum dado para hoje.', mainMenu);
      return;
    }
    await send('Qual é o odômetro atual da bike?', cancelMenu);
    return;
  }

  // Input Handling (Numeric/Prices)
  const val = textInput.replace('R$', '').replace(',', '.').trim();
  const num = parseFloat(val);

  if (!isNaN(num)) {
    if (!activeDay || activeDay.odometer_start === null) {
      // First odo of the day
      let day = activeDay;
      if (!day) {
        const res = await (supabaseAdmin.from('work_days').insert({ date: today as any, odometer_start: num, status: 'in_progress' as any }).select().single() as any);
        day = res.data;
      } else {
        await (supabaseAdmin.from('work_days').update({ odometer_start: num }).eq('id', day.id) as any);
      }
      if (!day) return;
      await (supabaseAdmin.from('sessions').insert({ work_day_id: day.id, status: 'active' as any }) as any);
      await send('Jornada iniciada!', {
        keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'RESUMO' }]],
        resize_keyboard: true
      });
      return;
    }

    if (activeDay.odometer_end === null) {
      if (num < activeDay.odometer_start) {
        await send(`⚠️ O odômetro final não pode ser menor que o inicial (${activeDay.odometer_start}). Informe novamente:`, cancelMenu);
        return;
      }
      await (supabaseAdmin.from('work_days').update({ odometer_end: num }).eq('id', activeDay.id) as any);
      await send('Quanto você ganhou hoje?', cancelMenu);
      return;
    }

    if (activeDay.total_earned === null) {
      await (supabaseAdmin.from('work_days').update({ total_earned: num }).eq('id', activeDay.id) as any);
      await send('Quantas entregas você fez hoje?', cancelMenu);
      return;
    }

    if (activeDay.total_deliveries === null) {
      const res = await (supabaseAdmin.from('work_days').update({ total_deliveries: Math.round(num), status: 'completed' as any }).eq('id', activeDay.id).select().single() as any);
      const summary = await getSummary(res.data);
      await send(`<b>DIA FECHADO</b>\n\n${summary}`, {
        keyboard: [[{ text: 'RESUMO' }, { text: 'MENU PRINCIPAL' }]],
        resize_keyboard: true
      });
      return;
    }
  }

  await send('Não entendi o comando. Use os botões do menu.', mainMenu);
};