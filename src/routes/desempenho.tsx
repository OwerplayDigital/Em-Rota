import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/desempenho')({
  component: PerformancePage,
})

function PerformancePage() {
  return (
    <div className="p-6 md:p-10 space-y-12 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">Desempenho</h1>
        <p className="text-white/40 text-sm">Análise profunda da sua rentabilidade.</p>
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        <MetricItem label="Ganhos médios por dia" value="R$ 0,00" />
        <MetricItem label="Ganhos por hora" value="R$ 0,00" />
        <MetricItem label="Entregas por hora" value="0,0" />
        <MetricItem label="Ganhos por km" value="R$ 0,00" />
        <MetricItem label="Média de entregas" value="0" />
        <MetricItem label="Tempo médio trabalhado" value="0h 00m" />
      </div>

      <Card className="bg-white/5 border-white/10 p-20 text-center rounded-3xl backdrop-blur-sm">
        <CardContent className="space-y-6">
          <div className="text-white/10 uppercase tracking-[0.4em] text-[10px] font-bold">Análise Comparativa</div>
          <div className="space-y-2">
            <h3 className="text-lg text-white/40 font-light">Dados insuficientes para gerar tendências</h3>
            <p className="text-xs text-white/20 max-w-xs mx-auto leading-relaxed">
              O sistema precisa de pelo menos 7 dias de atividades para calcular variações de rentabilidade.
            </p>
          </div>
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
