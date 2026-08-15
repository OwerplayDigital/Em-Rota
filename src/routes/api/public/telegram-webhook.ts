import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/telegram-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const botToken = process.env['TELEGRAM_BOT_TOKEN']!;
        const allowedUserId = process.env['TELEGRAM_ALLOWED_USER_ID']!;

        const send = async (text: string, markup?: any) => {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: allowedUserId, text, reply_markup: markup }),
          });
        };

        try {
          const body = await request.json();
          const msg = body.message;
          if (!msg || String(msg.from?.id) !== allowedUserId) return new Response('OK');

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const text = msg.text;

          // 1. /start
          if (text === '/start') {
            await send('Bem-vindo ao Diária!', {
              keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }], [{ text: 'CANCELAR' }]],
              resize_keyboard: true
            });
            return new Response('OK');
          }

          // 2. INICIAR JORNADA
          if (text === 'INICIAR JORNADA') {
            const { data: active } = await supabaseAdmin.from('sessions').select('*').eq('status', 'active').maybeSingle();
            if (active) {
              await send('⚠️ Já existe uma jornada ativa.');
            } else {
              const today = new Date().toISOString().split('T')[0];
              let { data: day } = await supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle();
              if (!day) {
                const { data: newDay } = await supabaseAdmin.from('work_days').insert({ date: today, status: 'in_progress' }).select().single();
                day = newDay;
              }
              if (day && day.odometer_start === null) {
                await send('Por favor, informe o odômetro inicial (apenas números):');
              } else if (day) {
                await supabaseAdmin.from('sessions').insert({ work_day_id: day.id, status: 'active' });
                await send('🚀 Jornada iniciada com sucesso!');
              }
            }
            return new Response('OK');
          }

          // 3. ENCERRAR JORNADA
          if (text === 'ENCERRAR JORNADA') {
            const { data: session } = await supabaseAdmin.from('sessions').select('*').eq('status', 'active').maybeSingle();
            if (!session) {
              await send('❌ Nenhuma jornada ativa encontrada.');
            } else {
              await supabaseAdmin.from('sessions').update({ end_time: new Date().toISOString(), status: 'completed' }).eq('id', session.id);
              await send('✅ Jornada encerrada!');
            }
            return new Response('OK');
          }

          // 4. FECHAR DIA
          if (text === 'FECHAR DIA') {
            const { data: active } = await supabaseAdmin.from('sessions').select('*').eq('status', 'active').maybeSingle();
            if (active) {
              await send('⚠️ Encerre a jornada antes de fechar o dia.');
            } else {
              await send('Informe o odômetro final:');
            }
            return new Response('OK');
          }

          // 5. RESUMO
          if (text === 'RESUMO') {
            const today = new Date().toISOString().split('T')[0];
            const { data: day } = await supabaseAdmin.from('work_days').select('*, sessions(*)').eq('date', today).maybeSingle();
            if (!day) await send('Nenhum dado para hoje.');
            else await send(`📊 Resumo do Dia (${day.date}):\nStatus: ${day.status}\nOdômetro: ${day.odometer_start || '?'} - ${day.odometer_end || '?'}\nJornadas: ${day.sessions?.length || 0}`);
            return new Response('OK');
          }

          // 6. CANCELAR
          if (text === 'CANCELAR') {
            await send('Fluxo cancelado.', {
              keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }]],
              resize_keyboard: true
            });
            return new Response('OK');
          }

          // 7. Lógica de entrada numérica (Odômetros/Ganhos)
          if (/^\d+$/.test(text)) {
            const today = new Date().toISOString().split('T')[0];
            const { data: day } = await supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle();
            if (day && day.odometer_start === null) {
              await supabaseAdmin.from('work_days').update({ odometer_start: parseInt(text) }).eq('id', day.id);
              await supabaseAdmin.from('sessions').insert({ work_day_id: day.id, status: 'active' });
              await send(`📍 Odômetro inicial ${text} salvo. Jornada iniciada!`);
            } else if (day && day.odometer_end === null) {
              await supabaseAdmin.from('work_days').update({ odometer_end: parseInt(text), status: 'completed' }).eq('id', day.id);
              await send(`🏁 Dia fechado com odômetro final ${text}!`);
            }
          }

          return new Response('OK');
        } catch (e) {
          return new Response('OK');
        }
      }
    }
  }
});
