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
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Package, MapPin, DollarSign, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchDashboardData } from '@/lib/dashboard.functions'
import { 
  getDatesForPeriod, 
  calculateMetrics, 
  getChartData, 
  formatCurrency, 
  formatDuration 
} from '@/lib/dashboard-utils'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

const periods = ['Hoje', '7 dias', 'Este mês', 'Este ano']

function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState('7 dias')
  const { startDate, endDate } = useMemo(() => getDatesForPeriod(activePeriod), [activePeriod])
  
  const { data } = useSuspenseQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: () => fetchDashboardData({ data: { startDate, endDate } })
  })


  const metrics = useMemo(() => calculateMetrics(data.workDays, data.sessions), [data])
  const chartData = useMemo(() => getChartData(data.workDays, data.sessions), [data])
  const hasData = data.workDays.length > 0;


  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-10 space-y-8 md:space-y-10 bg-background min-h-screen text-foreground relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 order-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Em Tempo Real</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground text-xs font-light">Seu desempenho em movimento.</p>
        </div>
        
        <div className="flex bg-muted/30 p-1 rounded-2xl border border-border backdrop-blur-md self-start md:self-auto order-2">
          {periods.map((period) => (
            <button 
              key={period}
              onClick={() => setActivePeriod(period)}
              className={cn(
                "px-4 py-2 text-[10px] font-medium rounded-xl transition-all duration-300",
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 relative z-10 order-3">
        <MetricCard title="GANHOS" value={formatCurrency(metrics.totalEarned)} icon={DollarSign} />
        <MetricCard title="ENTREGAS" value={metrics.totalDeliveries.toString()} icon={Package} />
        <MetricCard title="TEMPO NA RUA" value={formatDuration(metrics.totalMs)} icon={Clock} />
        <MetricCard title="DISTÂNCIA" value={`${metrics.totalDistance} km`} icon={MapPin} />
      </div>

      <div className="flex flex-col gap-6 relative z-10 order-5">
        <ChartCard title="Evolução dos Ganhos" subtitle="Desempenho no período selecionado">
          {hasData ? (
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="label" 

                    stroke="var(--color-muted-foreground)" 

                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)" 

                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `R$ ${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '10px' }}
                    labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--color-foreground)', padding: 0 }}
                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Ganhos']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earned" 
                    name="Ganhos" 
                    stroke="var(--color-primary)" 
                    fillOpacity={1} 
                    fill="url(#colorEarned)" 
                    strokeWidth={2}
                    activeDot={{ r: 4, fill: 'var(--color-primary)', stroke: 'var(--color-background)', strokeWidth: 2 }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={TrendingUp} text="Sem registros neste período" subtext="As estatísticas reais aparecerão após você finalizar sua primeira jornada no Telegram." />
          )}
        </ChartCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Entregas por Período" subtitle="Volume de trabalho diário">
            {hasData ? (
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.2} />
                    <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '10px' }}
                      labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px', fontWeight: 'bold' }}
                      itemStyle={{ color: 'var(--color-foreground)', padding: 0 }}
                      cursor={{ fill: 'var(--color-primary)', fillOpacity: 0.1 }}
                      formatter={(value: any) => [value, 'Entregas']}
                    />
                    <Bar dataKey="deliveries" name="Entregas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState icon={Calendar} text="Aguardando registros" />
            )}
          </ChartCard>

          <ChartCard title="Tempo na Rua" subtitle="Horas dedicadas por dia">
            {hasData ? (
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.2} />
                    <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}h`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '10px' }}
                      labelStyle={{ color: 'var(--color-muted-foreground)', marginBottom: '4px', fontWeight: 'bold' }}
                      itemStyle={{ color: 'var(--color-foreground)', padding: 0 }}
                      cursor={{ fill: 'var(--color-primary)', fillOpacity: 0.1 }}
                      formatter={(value: any) => [`${Number(value).toFixed(1)}h`, 'Tempo']}
                    />
                    <Bar dataKey="hours" name="Horas" fill="var(--color-primary)" opacity={0.8} radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState icon={Clock} text="Aguardando registros" />
            )}
          </ChartCard>
        </div>
      </div>

      <div className="space-y-6 relative z-10 order-8">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">Métricas de Eficiência</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <SmallMetric label="R$ / HORA" value={metrics.avgPerHour > 0 ? formatCurrency(metrics.avgPerHour) : "—"} />
          <SmallMetric label="R$ / KM" value={metrics.avgPerKm > 0 ? formatCurrency(metrics.avgPerKm) : "—"} />
          <SmallMetric label="R$ / ENTREGA" value={metrics.avgPerDelivery > 0 ? formatCurrency(metrics.avgPerDelivery) : "—"} />
          <SmallMetric label="ENTREGAS / HORA" value={metrics.deliveriesPerHour > 0 ? metrics.deliveriesPerHour.toFixed(1) : "—"} />
        </div>
      </div>


    </motion.div>
  )
}

function MetricCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: string }) {
  return (
    <Card className="bg-card border-border backdrop-blur-xl rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 pt-4 px-4 md:pt-6 md:px-6">
        <CardTitle className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{title}</CardTitle>
        <Icon className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1 md:px-6 md:pb-6 md:pt-2">
        <div className="flex items-baseline gap-2">
          <div className="text-xl md:text-3xl font-light tracking-tight text-foreground transition-colors">{value}</div>
          {trend && <span className="text-[9px] md:text-[10px] text-emerald-500 font-bold">{trend}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="bg-card border-border backdrop-blur-xl overflow-hidden rounded-[2.5rem] p-2">
      <CardHeader className="p-6 md:p-8 pb-2 md:pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base md:text-lg font-medium text-foreground">{title}</CardTitle>
          {subtitle && <p className="text-[10px] md:text-xs text-muted-foreground font-light">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-4 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border space-y-1 md:space-y-2 hover:bg-muted/30 transition-all duration-300 group">
      <div className="text-[8px] md:text-[9px] font-bold text-muted-foreground tracking-[0.2em] uppercase transition-colors">{label}</div>
      <div className="text-lg md:text-2xl font-light text-foreground/80 group-hover:text-foreground transition-colors">{value}</div>
    </div>
  )
}

function EmptyState({ icon: Icon, text, subtext }: { icon: any; text: string; subtext?: string }) {
  return (
    <div className="h-[280px] w-full flex items-center justify-center border border-dashed border-border rounded-3xl bg-muted/10 group hover:bg-muted/20 transition-colors">
      <div className="text-center space-y-3 p-8">
        <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4 border border-border">
          <Icon className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground/60 text-xs uppercase tracking-[0.2em] font-bold">{text}</p>
        {subtext && (
          <p className="text-muted-foreground/40 text-[10px] max-w-[200px] leading-relaxed mx-auto">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}

