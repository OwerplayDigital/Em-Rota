import { createFileRoute } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">Diária</h1>
          <p className="text-lg text-stone-600">
            Projeto configurado e integrado com o Telegram.
          </p>
        </div>

        <div className="space-y-6 text-stone-800">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">Configuração do Bot</h2>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 space-y-2 text-sm font-mono">
              <p><strong>Webhook URL:</strong> https://[seu-projeto].lovable.app/api/public/telegram-webhook</p>
              <p><strong>Secrets necessárias:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>TELEGRAM_BOT_TOKEN</li>
                <li>TELEGRAM_ALLOWED_USER_ID</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">Instruções Próximas</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Crie um bot no <strong>@BotFather</strong> no Telegram.</li>
              <li>Obtenha o Token e seu User ID.</li>
              <li>Configure as Secrets no painel do Lovable.</li>
              <li>Configure o webhook usando o comando:<br/>
                <code className="bg-stone-100 px-1 rounded text-xs break-all">curl -X POST "https://api.telegram.org/botTOKEN/setWebhook?url=SUA_URL_WEBHOOK"</code>
              </li>
            </ol>
          </section>
        </div>

        <div className="pt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Infraestrutura pronta
          </span>
        </div>
      </div>
    </div>
  );
}
