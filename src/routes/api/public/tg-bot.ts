import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/tg-bot')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const botToken = process.env['TELEGRAM_BOT_TOKEN'];
        const allowedUserId = process.env['TELEGRAM_ALLOWED_USER_ID'];

        if (!botToken || !allowedUserId) {
          return new Response('Config Error', { status: 500 });
        }

        try {
          const body = await request.json();
          const from = body.message?.from || body.callback_query?.from;
          const chatId = from?.id?.toString();
          
          if (!chatId) return new Response('OK', { status: 200 });

          if (chatId !== allowedUserId) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: 'Acesso negado.' }),
            });
            return new Response('OK', { status: 200 });
          }

          if (body.message?.text === '/start') {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: 'Bot ativo na nova rota /api/public/tg-bot',
                reply_markup: {
                  keyboard: [[{ text: 'INICIAR JORNADA' }, { text: 'ENCERRAR JORNADA' }], [{ text: 'FECHAR DIA' }, { text: 'RESUMO' }]],
                  resize_keyboard: true,
                },
              }),
            });
          }

          return new Response('OK', { status: 200 });
        } catch (error) {
          return new Response('OK', { status: 200 });
        }
      },
    },
  },
});
