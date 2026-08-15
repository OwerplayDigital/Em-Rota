import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/telegram-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const botToken = (process.env['TELEGRAM_BOT_TOKEN'] ?? '') as string;
        const allowedUserId = (process.env['TELEGRAM_ALLOWED_USER_ID'] ?? '') as string;

        if (!botToken || !allowedUserId) return new Response('OK');

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
          const textInput = (msg.text || '') as string;

          if (textInput === '/start') {
            await send('Bem-vindo ao Diária!', {
              keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }], [{ text: 'CANCELAR' }]],
              resize_keyboard: true
            });
            return new Response('OK');
          }

          if (textInput === 'INICIAR JORNADA') {
            const { data: active } = await (supabaseAdmin.from('sessions').select('*').eq('status', 'active' as any).maybeSingle() as any);
            if (active) {
              await send('⚠️ Já existe uma jornada ativa.');
            } else {
              const today = new Date().toISOString().split('T')[0];
              const { data: existingDay } = await (supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle() as any);
              let dayId = '';
              let odoStart: number | null = null;
              
              if (!existingDay) {
                const { data: newDay } = await (supabaseAdmin.from('work_days').insert({ date: today, status: 'in_progress' as any }).select().single() as any);
                if (newDay) {
                  dayId = newDay.id as string;
                  odoStart = newDay.odometer_start as number | null;
                }
              } else {
                dayId = (existingDay as any).id as string;
                odoStart = (existingDay as any).odometer_start as number | null;
              }

              if (dayId && odoStart === null) {
                await send('Por favor, informe o odômetro inicial (apenas números):');
              } else if (dayId) {
                await (supabaseAdmin.from('sessions').insert({ work_day_id: dayId, status: 'active' as any }) as any);
                await send('🚀 Jornada iniciada com sucesso!');
              }
            }
            return new Response('OK');
          }

          if (textInput === 'ENCERRAR JORNADA') {
            const { data: session } = await (supabaseAdmin.from('sessions').select('*').eq('status', 'active' as any).maybeSingle() as any);
            if (!session) {
              await send('❌ Nenhuma jornada ativa encontrada.');
            } else {
              await (supabaseAdmin.from('sessions').update({ end_time: new Date().toISOString(), status: 'completed' as any }).eq('id', (session as any).id) as any);
              await send('✅ Jornada encerrada!');
            }
            return new Response('OK');
          }

          if (textInput === 'FECHAR DIA') {
            const { data: active } = await (supabaseAdmin.from('sessions').select('*').eq('status', 'active' as any).maybeSingle() as any);
            if (active) {
              await send('⚠️ Encerre a jornada antes de fechar o dia.');
            } else {
              await send('Informe o odômetro final:');
            }
            return new Response('OK');
          }

          if (textInput === 'RESUMO') {
            const today = new Date().toISOString().split('T')[0];
            const { data: day } = await (supabaseAdmin.from('work_days').select('*, sessions(*)').eq('date', today).maybeSingle() as any);
            if (!day) await send('Nenhum dado para hoje.');
            else {
              const d = day as any;
              const dateVal = String(d.date ?? today);
              const statusVal = String(d.status ?? '?');
              const odoS = String(d.odometer_start ?? '?');
              const odoE = String(d.odometer_end ?? '?');
              const sessCount = Number(d.sessions?.length ?? 0);
              await send(`📊 Resumo do Dia (${dateVal}):\nStatus: ${statusVal}\nOdômetro: ${odoS} - ${odoE}\nJornadas: ${sessCount}`);
            }
            return new Response('OK');
          }

          if (textInput === 'CANCELAR') {
            await send('Fluxo cancelado.', {
              keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }]],
              resize_keyboard: true
            });
            return new Response('OK');
          }

          if (/^\d+$/.test(textInput)) {
            const today = new Date().toISOString().split('T')[0];
            const { data: day } = await (supabaseAdmin.from('work_days').select('*').eq('date', today).maybeSingle() as any);
            if (day) {
              const d = day as any;
              const dId = d.id as string;
              if (d.odometer_start === null) {
                await (supabaseAdmin.from('work_days').update({ odometer_start: parseInt(textInput) }).eq('id', dId) as any);
                await (supabaseAdmin.from('sessions').insert({ work_day_id: dId, status: 'active' as any }) as any);
                await send(`📍 Odômetro inicial ${textInput} salvo. Jornada iniciada!`);
              } else if (d.odometer_end === null) {
                await (supabaseAdmin.from('work_days').update({ odometer_end: parseInt(textInput), status: 'completed' as any }).eq('id', dId) as any);
                await send(`🏁 Dia fechado com odômetro final ${textInput}!`);
              }
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
