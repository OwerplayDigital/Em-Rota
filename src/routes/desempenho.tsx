import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/desempenho')({
  component: PerformancePage,
})

function PerformancePage() {
  return (
    <div className="p-6 md:p-10 space-y-8 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Desempenho</h1>
        <p className="text-muted-foreground">Análise profunda da sua rentabilidade.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <MetricItem label="Ganhos médios por dia" value="R$ 0,00" />
        <MetricItem label="Ganhos por hora" value="R$ 0,00" />
        <MetricItem label="Entregas por hora" value="0,0" />
        <MetricItem label="Ganhos por km" value="R$ 0,00" />
        <MetricItem label="Média de entregas" value="0" />
        <MetricItem label="Tempo médio trabalhado" value="0h 00m" />
      </div>

      <Card className="bg-white/5 border-white/10 p-12 text-center">
        <CardContent className="space-y-4">
          <div className="text-white/20 uppercase tracking-[0.2em] text-xs font-bold">Análise Comparativa</div>
          <h3 className="text-xl text-white/40">Dados insuficientes para gerar tendências</h3>
          <p className="text-sm text-white/30 max-w-sm mx-auto">
            Continue registrando suas jornadas no Telegram para desbloquear insights de crescimento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</div>
      <div className="text-2xl font-light text-white/80">{value}</div>
    </div>
  )
}
