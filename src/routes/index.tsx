import { createFileRoute } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4 text-stone-900">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Diária</h1>
          <p className="text-lg text-stone-600">
            A infraestrutura do bot está pronta. Agora, configure as chaves de acesso.
          </p>
        </div>

        <div className="space-y-6">
          <section className="bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Ação Necessária: Configurar Secrets
            </h2>
            <p className="text-blue-800 text-sm leading-relaxed">
              Para o bot funcionar, você precisa cadastrar os valores no painel do <strong>Lovable Cloud</strong> (ícone de chave no canto inferior esquerdo).
            </p>
            <div className="grid gap-3">
              <div className="bg-white p-3 rounded border border-blue-200 shadow-sm">
                <code className="text-blue-700 font-bold">TELEGRAM_BOT_TOKEN</code>
                <p className="text-xs text-stone-500 mt-1">Obtido com o @BotFather no Telegram.</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200 shadow-sm">
                <code className="text-blue-700 font-bold">TELEGRAM_ALLOWED_USER_ID</code>
                <p className="text-xs text-stone-500 mt-1">Seu ID numérico do Telegram (ex: 12345678).</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 opacity-60">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Próximos Passos</h2>
            <ul className="text-sm space-y-2 list-disc pl-5 text-stone-600">
              <li>Preencher os Secrets acima.</li>
              <li>Configurar o Webhook no Telegram (instruções virão após os Secrets).</li>
              <li>Iniciar a conversa com o bot.</li>
            </ul>
          </section>
        </div>

        <div className="pt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Webhook endpoint ativo em /api/public/telegram-webhook
          </span>
        </div>
      </div>
    </div>
  );
}

