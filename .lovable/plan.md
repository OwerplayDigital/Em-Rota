# Plan - Telegram Bot Webhook Connection

Conectar definitivamente o bot Telegram ao projeto Em Rota utilizando os Secrets configurados e a TanStack server route existente.

## User Review Required

> [!IMPORTANT]
> O webhook será configurado apontando para o endpoint publicamente acessível do projeto. Certifique-se de que os Secrets `TELEGRAM_BOT_TOKEN` e `TELEGRAM_ALLOWED_USER_ID` estão corretamente preenchidos no painel do Lovable Cloud.

## Proposed Changes

### Backend Configuration

1. **Telegram Webhook Setup**
    - Identificar a URL pública do projeto: `https://a04e9028-15d8-49b1-9700-f0e4de349cab.lovableproject.com`.
    - Endpoint do webhook: `/api/public/telegram-webhook`.
    - Utilizar a Bot API do Telegram para registrar o webhook via `setWebhook`.
    - Validar o registro com `getWebhookInfo`.

2. **Frontend Update**
    - Atualizar a `src/routes/index.tsx` para refletir o status de "Conectado" e fornecer o resumo da configuração.

### Verification Plan

- **Automatic Validation**:
    - Verificar resposta da API do Telegram após `setWebhook`.
    - Verificar logs do servidor durante a chamada de status.
- **Manual Verification**:
    - O usuário enviará `/start` no bot para confirmar o recebimento básico (sem iniciar jornadas).

## Technical Details

- **Webhook URL**: `https://a04e9028-15d8-49b1-9700-f0e4de349cab.lovableproject.com/api/public/telegram-webhook`
- **Method**: POST
- **Security**: O acesso é restrito ao ID do usuário configurado no Secret `TELEGRAM_ALLOWED_USER_ID` dentro do handler da rota.
