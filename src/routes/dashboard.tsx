import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="p-6 md:p-10 space-y-10 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-white/40 text-sm">Seu desempenho em movimento.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {['Hoje', '7 dias', 'Este mês', 'Este ano'].map((period) => (
            <button 
              key={period}
              className="px-4 py-1.5 text-xs font-medium rounded-lg transition-colors hover:text-white text-white/40 first:bg-white/10 first:text-white"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="GANHOS" value="R$ 0,00" />
        <MetricCard title="ENTREGAS" value="0" />
        <MetricCard title="TEMPO NA RUA" value="0h" />
        <MetricCard title="DISTÂNCIA" value="0 km" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Evolução dos Ganhos">
          <div className="h-[240px] w-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <div className="text-center space-y-2">
              <p className="text-white/20 text-xs uppercase tracking-widest font-bold">Sem dados suficientes</p>
              <p className="text-white/40 text-[10px]">As estatísticas aparecerão após o primeiro fechamento.</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Ganhos por Dia">
          <div className="h-[240px] w-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <div className="text-center space-y-2">
              <p className="text-white/20 text-xs uppercase tracking-widest font-bold">Aguardando registros</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Métricas Detalhadas</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <SmallMetric label="R$ / HORA" value="-" />
          <SmallMetric label="R$ / KM" value="-" />
          <SmallMetric label="R$ / ENTREGA" value="-" />
          <SmallMetric label="ENTREGAS / HORA" value="-" />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-light tracking-tight">{value}</div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-white/60">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
      <div className="text-[9px] font-bold text-white/20 tracking-tighter uppercase">{label}</div>
      <div className="text-lg font-medium text-white/70">{value}</div>
    </div>
  )
}

