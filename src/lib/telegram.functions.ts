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
    const setUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(data.webhookUrl)}`;
    const setRes = await fetch(setUrl);
    const setResult = await setRes.json();

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

    return {
      success: true,
      result: setResult,
      info: infoResult.result
    };
  });
