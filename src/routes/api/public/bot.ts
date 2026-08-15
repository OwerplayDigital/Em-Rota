import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/bot')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { handleTelegramUpdate } = await import("@/integrations/supabase/telegram.server");
          await handleTelegramUpdate(body);
          return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        } catch (e) {
          return new Response('OK', { status: 200 });
        }
      },
      GET: () => new Response('BOT ACTIVE', { status: 200 })
    }
  }
});
