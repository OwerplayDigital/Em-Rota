import { supabaseAdmin } from './client.server';

export const handleTelegramUpdate = async (body: any) => {
  const botToken = (process.env['TELEGRAM_BOT_TOKEN'] ?? '') as string;
  const allowedUserId = (process.env['TELEGRAM_ALLOWED_USER_ID'] ?? '') as string;

  if (!botToken || !allowedUserId) return;

  const send = async (text: string, markup?: any) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: allowedUserId, text, reply_markup: markup }),
    });
  };

  const msg = body.message;
  if (!msg || String(msg.from?.id) !== allowedUserId) return;

  const textInput = (msg.text || '') as string;
  const { data: activeRes } = await (supabaseAdmin.from('sessions').select('*').eq('status', 'active' as any).maybeSingle() as any);
  const today = new Date().toISOString().split('T')[0];
  const { data: dayRes } = await (supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle() as any);

  if (textInput === '/start') {
    await send('Bem-vindo ao Diária!', {
      keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }], [{ text: 'CANCELAR' }]],
      resize_keyboard: true
    });
    return;
  }

  if (textInput === 'INICIAR JORNADA') {
    if (activeRes) {
      await send('⚠️ Já existe uma jornada ativa.');
    } else {
      let dayId = dayRes?.id;
      let odoStart = dayRes?.odometer_start;
      
      if (!dayRes) {
        const { data: newDay } = await (supabaseAdmin.from('work_days').insert({ date: today, status: 'in_progress' as any }).select().single() as any);
        dayId = newDay?.id;
        odoStart = newDay?.odometer_start;
      }

      if (dayId && odoStart === null) {
        await send('Por favor, informe o odômetro inicial (apenas números):');
      } else if (dayId) {
        await supabaseAdmin.from('sessions').insert({ work_day_id: dayId, status: 'active' as any });
        await send('🚀 Jornada iniciada com sucesso!');
      }
    }
    return;
  }

  if (textInput === 'ENCERRAR JORNADA') {
    if (!activeRes) {
      await send('❌ Nenhuma jornada ativa encontrada.');
    } else {
      await supabaseAdmin.from('sessions').update({ end_time: new Date().toISOString(), status: 'completed' as any }).eq('id', activeRes.id);
      await send('✅ Jornada encerrada!');
    }
    return;
  }

  if (textInput === 'FECHAR DIA') {
    if (activeRes) {
      await send('⚠️ Encerre a jornada antes de fechar o dia.');
    } else {
      await send('Informe o odômetro final:');
    }
    return;
  }

  if (textInput === 'RESUMO') {
    if (!dayRes) await send('Nenhum dado para hoje.');
    else {
      const { data: dayWithSessions } = await (supabaseAdmin.from('work_days').select('*, sessions(*)').eq('date', today).maybeSingle() as any);
      const d = dayWithSessions || dayRes;
      const odoS = d.odometer_start ?? '?';
      const odoE = d.odometer_end ?? '?';
      const sessCount = d.sessions?.length ?? 0;
      await send(`📊 Resumo do Dia (${d.date}):\nStatus: ${d.status}\nOdômetro: ${odoS} - ${odoE}\nJornadas: ${sessCount}`);
    }
    return;
  }

  if (textInput === 'CANCELAR') {
    await send('Fluxo cancelado.', {
      keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }]],
      resize_keyboard: true
    });
    return;
  }

  if (/^\d+$/.test(textInput)) {
    if (dayRes) {
      if (dayRes.odometer_start === null) {
        await supabaseAdmin.from('work_days').update({ odometer_start: parseInt(textInput) }).eq('id', dayRes.id);
        await supabaseAdmin.from('sessions').insert({ work_day_id: dayRes.id, status: 'active' as any });
        await send(`📍 Odômetro inicial ${textInput} salvo. Jornada iniciada!`);
      } else if (dayRes.odometer_end === null) {
        await supabaseAdmin.from('work_days').update({ odometer_end: parseInt(textInput), status: 'completed' as any }).eq('id', dayRes.id);
        await send(`🏁 Dia fechado com odômetro final ${textInput}!`);
      }
    }
  }
};
