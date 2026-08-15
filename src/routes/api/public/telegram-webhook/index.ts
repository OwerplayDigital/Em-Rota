import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/telegram-webhook/')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const timestamp = new Date().toISOString();
        console.log(`[Webhook][${timestamp}] POST received`);
        
        const botToken = process.env['TELEGRAM_BOT_TOKEN'];
        const allowedUserId = process.env['TELEGRAM_ALLOWED_USER_ID'];

        if (!botToken || !allowedUserId) {
          return new Response('Config Error', { status: 500 });
        }

        try {
          const body = await request.json();
          console.log('[Webhook] Body:', JSON.stringify(body));

          const from = body.message?.from || body.callback_query?.from;
          const chatId = from?.id?.toString();
          
          if (!chatId) return new Response('OK', { status: 200 });

          if (chatId !== allowedUserId) {
            console.warn(`[Webhook] Unauthorized: ${chatId} !== ${allowedUserId}`);
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: 'Acesso negado.' }),
            });
            return new Response('OK', { status: 200 });
          }

          const text = body.message?.text;
          if (text === '/start') {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: 'Olá! Sistema operacional.',
                reply_markup: {
                  keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }]],
                  resize_keyboard: true,
                },
              }),
            });
          }

          return new Response('OK', { status: 200 });
        } catch (error) {
          console.error('[Webhook] Error:', error);
          return new Response('OK', { status: 200 });
        }
      },
    },
  },
});
