import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Seu desempenho em movimento.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="GANHOS" value="R$ 0,00" />
        <MetricCard title="ENTREGAS" value="0" />
        <MetricCard title="TEMPO NA RUA" value="0h" />
        <MetricCard title="DISTÂNCIA" value="0 km" />
      </div>
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
