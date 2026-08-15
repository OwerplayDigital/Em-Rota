import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const configureTelegramWebhook = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    webhookUrl: z.string().url()
  }))
  .handler(async ({ data }) => {
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not found in environment secrets.");
    }

    // 1. Set Webhook
    // We force the specific public URL to avoid any redirection issues
    const webhookUrl = data.webhookUrl;
    console.log(`[Config] Setting webhook to: ${webhookUrl}`);

    const setUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`;
    const setRes = await fetch(setUrl);
    const setResult = await setRes.json();
    
    console.log(`[Config] setWebhook response:`, JSON.stringify(setResult));

    if (!setResult.ok) {
      return {
        success: false,
        error: setResult.description || "Failed to set webhook",
        step: "setWebhook"
      };
    }

    // 2. Get Webhook Info
    const infoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    const infoRes = await fetch(infoUrl);
    const infoResult = await infoRes.json();
    
    console.log(`[Config] getWebhookInfo after set:`, JSON.stringify(infoResult));

    return {
      success: true,
      result: setResult,
      info: infoResult.result
    };
  });
