import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/telegram-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          // Import dynamic to avoid potential circular dependencies and ensure server context
          const { handleTelegramUpdate } = await import("@/integrations/supabase/telegram.server");
          await handleTelegramUpdate(body);
          return new Response('OK', { status: 200 });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('OK', { status: 200 }); // Always 200 for Telegram
        }
      }
    }
  }
});