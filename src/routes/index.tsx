import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { configureTelegramWebhook } from "@/lib/telegram.functions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Loader2, Bot, ExternalLink, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const setupWebhook = useServerFn(configureTelegramWebhook);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const getStatus = useServerFn(getTelegramWebhookStatus);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await getStatus();
        if (result.success && result.info?.url) {
          setWebhookInfo(result.info);
          setStatus('success');
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };
    checkStatus();
  }, [getStatus]);

  const handleConnect = async () => {
    setStatus('loading');
    try {
      const webhookUrl = `${window.location.origin}/api/public/telegram-webhook`;
      console.log("Requesting webhook setup for:", webhookUrl);
      const result = await setupWebhook({ data: { webhookUrl } });
      console.log("Setup result:", result);
      
      if (result.success) {
        setWebhookInfo(result.info);
        setStatus('success');
        toast.success("Bot conectado com sucesso!");
      } else {
        setStatus('error');
        toast.error(`Erro: ${result.error}`);
      }
    } catch (err) {
      console.error("Setup error:", err);
      setStatus('error');
      toast.error("Erro ao conectar webhook. Verifique os Secrets.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Diária</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Sistema de registro de entregas via Telegram.
          </p>
        </div>

        <div className="space-y-6">
          {status === 'success' ? (
            <section className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold">Bot Conectado!</h2>
              </div>
              
              <div className="space-y-3 text-sm text-emerald-800">
                <p>O webhook foi registrado com sucesso na API do Telegram.</p>
                <div className="bg-white/50 p-4 rounded-lg border border-emerald-200 font-mono text-xs break-all">
                  <p><strong>Endpoint:</strong> {webhookInfo?.url}</p>
                  <p className="mt-1"><strong>Pending updates:</strong> {webhookInfo?.pending_update_count}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Acesso restrito ao seu User ID configurado.</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium mb-3">Próximo passo:</p>
                <div className="bg-emerald-600 text-white p-4 rounded-lg flex items-center justify-between group cursor-pointer">
                  <span>Envie <b>/start</b> para o seu bot</span>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  Conexão Final
                </h2>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Clique no botão abaixo para ativar definitivamente o webhook do Telegram usando os Secrets configurados.
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>Ativar Webhook do Bot</>
                )}
              </button>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Falha na conexão. Verifique se os Secrets estão preenchidos.</span>
                </div>
              )}
            </section>
          )}

          <section className="space-y-3 opacity-60">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Configuração Atual</h2>
            <div className="text-xs space-y-1.5 font-medium text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span>Database (Supabase)</span>
                <span className="text-emerald-600">Ativo</span>
              </div>
              <div className="flex justify-between">
                <span>Secrets (Token/ID)</span>
                <span>Configurado</span>
              </div>
              <div className="flex justify-between">
                <span>Edge Function</span>
                <span>Pronta</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

