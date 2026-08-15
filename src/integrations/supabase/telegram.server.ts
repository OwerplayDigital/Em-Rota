import { supabaseAdmin } from './client.server';

export const handleTelegramUpdate = async (body: any) => {
  const botToken = (process.env['TELEGRAM_BOT_TOKEN'] ?? '') as string;
  const allowedUserId = (process.env['TELEGRAM_ALLOWED_USER_ID'] ?? '') as string;

  if (!botToken || !allowedUserId) return;

  const send = async (text: string, markup?: any) => {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: allowedUserId, text, parse_mode: 'HTML', reply_markup: markup }),
    });
    return res.json();
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: allowedUserId, message_id: messageId }),
      });
    } catch (e) {
      console.error('Failed to delete message:', messageId, e);
    }
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
  const formatDateBR = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateTimeBR = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date)).replace(', ', ' às ');
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h${minutes}min`;
  };

  const formatCurrency = (val: number | null) => val !== null ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Ainda não informado';
  const formatNumberBR = (val: number | null) => val !== null ? val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : 'Ainda não informado';

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

    const distance = (day.odometer_end !== null && day.odometer_start !== null) ? (Number(day.odometer_end) - Number(day.odometer_start)) : null;
    const hours = totalMs / 3600000;
    
    const perHour = (hours > 0 && day.total_earned !== null) ? (day.total_earned / hours) : null;
    const perKm = (distance && distance > 0 && day.total_earned !== null) ? (day.total_earned / distance) : null;
    const perDelivery = (day.total_deliveries && day.total_deliveries > 0 && day.total_earned !== null) ? (day.total_earned / day.total_deliveries) : null;

    return `<b>RESUMO DE ${formatDateBR(day.date)}</b>\n\n` +
      `<b>Ganhos:</b>\n${formatCurrency(day.total_earned)}\n\n` +
      `<b>Entregas:</b>\n${day.total_deliveries ?? 'Ainda não informado'}\n\n` +
      `<b>Distância:</b>\n${distance !== null ? `${formatNumberBR(distance)} km` : 'Ainda não informado'}\n\n` +
      `<b>Tempo na rua:</b>\n${formatDuration(totalMs)}\n\n` +
      `<b>Odômetro:</b>\n${formatNumberBR(day.odometer_start) ?? '?'}${day.odometer_end !== null ? ` → ${formatNumberBR(day.odometer_end)}` : ''} km\n\n` +
      `<b>MÉDIAS</b>\n\n` +
      `${formatCurrency(perHour)}/h\n` +
      `${formatCurrency(perKm)}/km\n` +
      `${formatCurrency(perDelivery)}/entrega`;
  };

  const mainMenu = {
    keyboard: [
      [{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }],
      [{ text: 'RESUMO' }, { text: 'FECHAR DIA' }],
      [{ text: 'CORRIGIR DIA' }, { text: 'LIMPAR CHAT' }]
    ],
    resize_keyboard: true
  };

  const cancelMenu = {
    keyboard: [[{ text: 'CANCELAR' }]],
    resize_keyboard: true
  };

  const clearChatMenu = {
    keyboard: [[{ text: 'SIM, LIMPAR' }, { text: 'CANCELAR' }]],
    resize_keyboard: true
  };

  const correctionMenu = {
    keyboard: [
      [{ text: 'GANHOS' }, { text: 'ENTREGAS' }],
      [{ text: 'ODÔMETRO FINAL' }, { text: 'REABRIR DIA' }],
      [{ text: 'CANCELAR' }]
    ],
    resize_keyboard: true
  };

  // Logic
  const activeSession = await getActiveSession();
  let activeDay = await getActiveWorkDay();

  // Command handlers
  if (textInput === '/start' || textInput === 'MENU' || textInput === 'MENU PRINCIPAL') {
    let statusMsg = activeSession ? '🏃 Jornada em andamento.' : '⏸️ Nenhuma jornada ativa.';
    if (activeDay?.status === 'completed') statusMsg = '🏁 Dia fechado.';
    
    await send(`<b>EM ROTA</b>\n\n${statusMsg}`, mainMenu);
    return;
  }

  if (textInput === 'CANCELAR') {
    // Reset correction state if any
    if (activeDay?.notes?.startsWith('CORRECT:')) {
      await (supabaseAdmin.from('work_days').update({ notes: null }).eq('id', activeDay.id) as any);
    }
    await send('Operação cancelada.', mainMenu);
    return;
  }

  if (textInput === 'RESUMO') {
    if (!activeDay) {
      await send('Nenhum dado para hoje.', mainMenu);
    } else {
      const summary = await getSummary(activeDay);
      await send(summary, activeDay.status === 'completed' ? { keyboard: [[{ text: 'CORRIGIR DIA' }, { text: 'LIMPAR CHAT' }], [{ text: 'MENU' }]], resize_keyboard: true } : mainMenu);
    }
    return;
  }

  if (textInput === 'LIMPAR CHAT') {
    await send('<b>Limpar o chat?</b>\n\nIsso apagará somente as mensagens desta conversa do Telegram. Nenhum registro do Em Rota será apagado.', clearChatMenu);
    return;
  }

  if (textInput === 'SIM, LIMPAR') {
    const sent = await send('Limpando mensagens...', { remove_keyboard: true });
    const lastMsgId = sent?.result?.message_id;

    if (lastMsgId) {
      // Telegram allows deleting messages up to 48h old.
      // We try to delete the last 100 messages.
      for (let i = 0; i < 100; i++) {
        await deleteMessage(lastMsgId - i);
      }
    }

    await send('<b>EM ROTA</b>\n\nHistórico visual limpo. Todos os dados permanecem salvos no sistema.', mainMenu);
    return;
  }

  if (textInput === 'INICIAR JORNADA') {
    if (activeDay?.status === 'completed') {
      await send('⚠️ O dia já foi fechado.\n\nPara continuar registrando, use:\n<b>CORRIGIR DIA → REABRIR DIA</b>', {
        keyboard: [[{ text: 'CORRIGIR DIA' }, { text: 'RESUMO' }], [{ text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }
    if (activeSession) {
      const startTime = formatDateTimeBR(activeSession.start_time);
      await send(`Você já tem uma jornada em andamento.\n\nInício: ${startTime}\nOdômetro: ${activeDay?.odometer_start ?? 'Não informado'}`, {
        keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'RESUMO' }], [{ text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }
    
    if (!activeDay || activeDay.odometer_start === null) {
      await send('Qual é o odômetro inicial da bike?', cancelMenu);
      return;
    }

    await (supabaseAdmin.from('sessions').insert({ work_day_id: activeDay.id, status: 'active' as any }) as any);
    await send('Jornada iniciada!', {
      keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'RESUMO' }], [{ text: 'LIMPAR CHAT' }]],
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

    const distance = (day.odometer_end !== null && day.odometer_start !== null) ? (day.odometer_end - day.odometer_start) : null;

    await send(`<b>JORNADA ENCERRADA</b>\n\nDuração desta jornada: ${formatDuration(thisSessionMs)}\n\n<b>TOTAL DE ${formatDateBR(day.date)}:</b>\nTempo na rua: ${formatDuration(totalMs)}\nGanhos: ${formatCurrency(day.total_earned)}\nEntregas: ${day.total_deliveries ?? 'Ainda não informado'}`, {
      keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'FECHAR DIA' }], [{ text: 'RESUMO' }, { text: 'LIMPAR CHAT' }], [{ text: 'MENU' }]],
      resize_keyboard: true
    });
    return;
  }

  if (textInput === 'FECHAR DIA') {
    if (activeSession) {
      await send('⚠️ Você ainda tem uma jornada em andamento. Encerre a jornada antes de fechar o dia.', {
        keyboard: [[{ text: 'ENCERRAR JORNADA' }, { text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }
    if (!activeDay) {
      await send('Nenhum dado para hoje.', mainMenu);
      return;
    }
    await (supabaseAdmin.from('work_days').update({ notes: 'AWAITING:CLOSE_ODO' }).eq('id', activeDay.id) as any);
    await send('Qual é o odômetro final da bike?', cancelMenu);
    return;
  }

  // Correction Flow
  if (textInput === 'CORRIGIR DIA') {
    if (!activeDay || activeDay.status !== 'completed') {
      await send('⚠️ O dia precisa estar fechado para correções.', mainMenu);
      return;
    }
    await send('Qual informação você deseja corrigir?', correctionMenu);
    return;
  }

  if (textInput === 'GANHOS') {
    await (supabaseAdmin.from('work_days').update({ notes: 'CORRECT:EARNED' }).eq('id', activeDay.id) as any);
    await send('Qual é o valor correto dos ganhos de hoje?', cancelMenu);
    return;
  }

  if (textInput === 'ENTREGAS') {
    await (supabaseAdmin.from('work_days').update({ notes: 'CORRECT:DELIVERIES' }).eq('id', activeDay.id) as any);
    await send('Qual é a quantidade correta de entregas?', cancelMenu);
    return;
  }

  if (textInput === 'ODÔMETRO FINAL') {
    await (supabaseAdmin.from('work_days').update({ notes: 'CORRECT:ODO_END' }).eq('id', activeDay.id) as any);
    await send('Qual é o odômetro final correto?', cancelMenu);
    return;
  }

  if (textInput === 'REABRIR DIA') {
    await send('Reabrir o dia permitirá continuar registrando jornadas.\nDeseja continuar?', {
      keyboard: [[{ text: 'SIM, REABRIR' }, { text: 'CANCELAR' }]],
      resize_keyboard: true
    });
    return;
  }

  if (textInput === 'SIM, REABRIR') {
    const res = await (supabaseAdmin.from('work_days').update({ status: 'in_progress', notes: null }).eq('id', activeDay.id).select().single() as any);
    await send('Dia reaberto.', {
      keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'FECHAR DIA' }], [{ text: 'MENU' }]],
      resize_keyboard: true
    });
    return;
  }

  // Input Handling (Numeric/Prices)
  const val = textInput.replace('R$', '').replace(',', '.').trim();
  const num = parseFloat(val);

  if (!isNaN(num)) {
    // 1. Correction Handling
    if (activeDay?.notes?.startsWith('CORRECT:')) {
      const mode = activeDay.notes.split(':')[1];
      let update: any = { notes: null };
      
      if (mode === 'EARNED') {
        update.total_earned = num;
      } else if (mode === 'DELIVERIES') {
        update.total_deliveries = Math.round(num);
      } else if (mode === 'ODO_END') {
        if (num < (activeDay.odometer_start || 0)) {
          await send(`⚠️ O odômetro final não pode ser menor que o inicial (${activeDay.odometer_start}).`, cancelMenu);
          return;
        }
        update.odometer_end = num;
      }

      const res = await (supabaseAdmin.from('work_days').update(update).eq('id', activeDay.id).select().single() as any);
      const summary = await getSummary(res.data);
      await send('Dados atualizados.', {
        keyboard: [[{ text: 'CORRIGIR DIA' }, { text: 'LIMPAR CHAT' }, { text: 'RESUMO' }], [{ text: 'MENU' }]],
        resize_keyboard: true
      });
      await send(summary);
      return;
    }

    // 2. Normal Flow
    if (!activeDay || activeDay.odometer_start === null) {
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

    if (activeDay.notes === 'AWAITING:CLOSE_ODO') {
      if (num < (activeDay.odometer_start || 0)) {
        await send(`⚠️ O odômetro final não pode ser menor que o inicial (${activeDay.odometer_start}). Informe novamente:`, cancelMenu);
        return;
      }
      await (supabaseAdmin.from('work_days').update({ odometer_end: num, notes: 'AWAITING:CLOSE_EARNINGS' }).eq('id', activeDay.id) as any);
      await send('Quanto você ganhou hoje?', cancelMenu);
      return;
    }

    if (activeDay.notes === 'AWAITING:CLOSE_EARNINGS') {
      await (supabaseAdmin.from('work_days').update({ total_earned: num, notes: 'AWAITING:CLOSE_DELIVERIES' }).eq('id', activeDay.id) as any);
      await send('Quantas entregas você fez hoje?', cancelMenu);
      return;
    }

    if (activeDay.notes === 'AWAITING:CLOSE_DELIVERIES') {
      const res = await (supabaseAdmin.from('work_days').update({ 
        total_deliveries: Math.round(num), 
        status: 'completed' as any,
        notes: null 
      }).eq('id', activeDay.id).select().single() as any);
      const summary = await getSummary(res.data);
      await send(`<b>DIA ${formatDateBR(res.data.date)} FECHADO</b>\n\n${summary}`, {
        keyboard: [[{ text: 'CORRIGIR DIA' }, { text: 'LIMPAR CHAT' }, { text: 'RESUMO' }], [{ text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }

    // Fallback para lógica antiga caso notes esteja vazio mas o fluxo esteja no meio
    if (activeDay.status === 'in_progress' && activeDay.odometer_end === null) {
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
      await send(`<b>DIA ${formatDateBR(res.data.date)} FECHADO</b>\n\n${summary}`, {
        keyboard: [[{ text: 'CORRIGIR DIA' }, { text: 'RESUMO' }], [{ text: 'MENU' }]],
        resize_keyboard: true
      });
      return;
    }
  }

  await send('Não entendi o comando. Use os botões do menu.', mainMenu);
};