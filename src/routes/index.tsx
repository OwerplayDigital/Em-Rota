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
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">Diária</h1>
        <p className="text-lg text-stone-600">
          Projeto preparado para conexão com Supabase e desenvolvimento de bot Telegram para registro de jornadas de entregas.
        </p>
        <div className="pt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-stone-200 text-stone-800">
            Aguardando implementação
          </span>
        </div>
      </div>
    </div>
  );
}
