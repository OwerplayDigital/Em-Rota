import { createServerFn } from "@tanstack/react-start";

export const getTelegramWebhookStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    
    if (!botToken) {
      return { success: false, error: "TELEGRAM_BOT_TOKEN not found." };
    }

    try {
      const infoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
      const infoRes = await fetch(infoUrl);
      const infoResult = await infoRes.json();

      return {
        success: true,
        info: infoResult.result
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
