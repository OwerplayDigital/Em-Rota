import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { TrendingUp, Award, Zap, BarChart3, Target, PieChart } from 'lucide-react'

export const Route = createFileRoute('/desempenho')({
  component: PerformancePage,
})

function PerformancePage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-12 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 -translate-x-1/2 -translate-y-1/2" />

      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Insights Avançados</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">Desempenho</h1>
        <p className="text-white/40 text-sm font-light">Análise profunda da sua rentabilidade e tendências.</p>
      </div>

      <div className="grid gap-12 md:grid-cols-3 relative z-10">
        <MetricItem icon={BarChart3} label="Ganhos médios por dia" value="R$ 0,00" />
        <MetricItem icon={TrendingUp} label="Ganhos por hora" value="R$ 0,00" />
        <MetricItem icon={Zap} label="Entregas por hora" value="0,0" />
        <MetricItem icon={Target} label="Ganhos por km" value="R$ 0,00" />
        <MetricItem icon={Award} label="Média de entregas" value="0" />
        <MetricItem icon={PieChart} label="Tempo médio trabalhado" value="0h 00m" />
      </div>

      <Card className="bg-white/5 border-white/10 p-20 text-center rounded-[3rem] backdrop-blur-xl relative z-10 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <CardContent className="space-y-8 relative z-10">
          <div className="text-white/10 uppercase tracking-[0.6em] text-[10px] font-bold">Análise Comparativa</div>
          <div className="space-y-3">
            <h3 className="text-2xl text-white/60 font-light">Dados insuficientes para gerar tendências</h3>
            <p className="text-xs text-white/20 max-w-sm mx-auto leading-relaxed font-light">
              O sistema utiliza algoritmos de IA para calcular variações de rentabilidade. Precisamos de pelo menos 7 dias de atividades consecutivas.
            </p>
          </div>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Aguardando Primeira Jornada
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 relative z-10">
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
          <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Recorde Pessoal</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/40 font-light">Maior ganho em um dia</span>
            <span className="text-lg font-medium text-white/60">-</span>
          </div>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
          <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Eficiência Logística</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/40 font-light">Menor custo por km</span>
            <span className="text-lg font-medium text-white/60">-</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MetricItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="space-y-4 group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
          <Icon className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
        <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold group-hover:text-white/40 transition-colors">{label}</div>
      </div>
      <div className="text-4xl font-light text-white/80 tracking-tighter group-hover:text-white transition-colors">{value}</div>
    </div>
  )
}

