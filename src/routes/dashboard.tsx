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
  Bar,
  Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Package, MapPin, DollarSign, Calendar } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

const periods = ['Hoje', '7 dias', 'Este mês', 'Este ano']

const mockChartData = [
  { name: 'Seg', valor: 120 },
  { name: 'Ter', valor: 150 },
  { name: 'Qua', valor: 80 },
  { name: 'Qui', valor: 190 },
  { name: 'Sex', valor: 220 },
  { name: 'Sab', valor: 250 },
  { name: 'Dom', valor: 160 },
]

function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState('Hoje')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-10 bg-background min-h-screen text-foreground relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Em Tempo Real</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground text-sm font-light">Seu desempenho em movimento.</p>
        </div>
        
        <div className="flex bg-muted/30 p-1 rounded-2xl border border-border backdrop-blur-md">
          {periods.map((period) => (
            <button 
              key={period}
              onClick={() => setActivePeriod(period)}
              className={cn(
                "px-5 py-2 text-xs font-medium rounded-xl transition-all duration-300",
                activePeriod === period 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 relative z-10">
        <MetricCard title="GANHOS" value="R$ 0,00" icon={DollarSign} trend="+0%" />
        <MetricCard title="ENTREGAS" value="0" icon={Package} />
        <MetricCard title="TEMPO NA RUA" value="0h" icon={Clock} />
        <MetricCard title="DISTÂNCIA" value="0 km" icon={MapPin} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 relative z-10">
        <ChartCard title="Evolução dos Ganhos" subtitle="Desempenho semanal aproximado">
          <div className="h-[280px] w-full flex items-center justify-center border border-dashed border-border rounded-3xl bg-muted/10 group hover:bg-muted/20 transition-colors">
            <div className="text-center space-y-3 p-8">
              <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4 border border-border">
                <TrendingUp className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground/60 text-xs uppercase tracking-[0.2em] font-bold">Mock Visual: Sem dados</p>
              <p className="text-muted-foreground/40 text-[10px] max-w-[200px] leading-relaxed">
                As estatísticas reais aparecerão após você finalizar sua primeira jornada no Telegram.
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Entregas por Período" subtitle="Volume de trabalho diário">
          <div className="h-[280px] w-full flex items-center justify-center border border-dashed border-border rounded-3xl bg-muted/10 group hover:bg-muted/20 transition-colors">
             <div className="text-center space-y-3 p-8">
              <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4 border border-border">
                <Calendar className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground/60 text-xs uppercase tracking-[0.2em] font-bold">Aguardando registros</p>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/30">Métricas de Eficiência</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <SmallMetric label="R$ / HORA" value="-" />
          <SmallMetric label="R$ / KM" value="-" />
          <SmallMetric label="R$ / ENTREGA" value="-" />
          <SmallMetric label="ENTREGAS / HORA" value="-" />
        </div>
      </div>

    </motion.div>
  )
}

function MetricCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: string }) {
  return (
    <Card className="bg-card border-border backdrop-blur-xl rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-6 px-6">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-light tracking-tight text-foreground transition-colors">{value}</div>
          {trend && <span className="text-[10px] text-emerald-500 font-bold">{trend}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card border-border backdrop-blur-xl overflow-hidden rounded-[2.5rem] p-2">
      <CardHeader className="p-8 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium text-foreground">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground font-light">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-[2rem] bg-card border border-border space-y-2 hover:bg-muted/30 transition-all duration-300 group">
      <div className="text-[9px] font-bold text-muted-foreground tracking-[0.2em] uppercase transition-colors">{label}</div>
      <div className="text-2xl font-light text-foreground/80 group-hover:text-foreground transition-colors">{value}</div>
    </div>
  )
}



