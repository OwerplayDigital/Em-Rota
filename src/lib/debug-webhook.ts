
import { createServerFn } from "@tanstack/react-start";
import { getTelegramWebhookStatus } from "./telegram-status.functions";

async function main() {
  const result = await getTelegramWebhookStatus();
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
