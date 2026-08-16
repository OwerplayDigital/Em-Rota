import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState, useMemo } from 'react'
import { X, Calendar, DollarSign, Package, MapPin, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchDashboardData } from '@/lib/dashboard.functions'
import { 
  formatDateBR, 
  formatTimeBR, 
  formatDuration, 
  formatCurrency,
  calculateMetrics
} from '@/lib/dashboard-utils'

export const Route = createFileRoute('/_authenticated/historico')({
  component: HistoryPage,
})

function HistoryPage() {
  const [selectedDay, setSelectedDay] = useState<any>(null)
  
  const { data } = useSuspenseQuery({
    queryKey: ['dashboard', 'history-all'],
    queryFn: () => fetchDashboardData({ 
      data: { 
        startDate: '2020-01-01',
        endDate: new Date().toISOString().split('T')[0]
      } 
    })
  })

  const historyItems = useMemo(() => {
    return data.workDays.map(wd => {
      const daySessions = data.sessions.filter(s => s.work_day_id === wd.id);
      const metrics = calculateMetrics([wd], daySessions);
      return {
        ...wd,
        metrics,
        daySessions
      };
    });
  }, [data]);

  return (
    <div className="p-6 md:p-10 space-y-8 bg-background min-h-screen text-foreground relative overflow-hidden">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Histórico</h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide uppercase">Detalhamento das suas jornadas passadas.</p>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden rounded-2xl relative z-10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase py-6 pl-8">DATA</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">GANHOS</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">ENTREGAS</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">DISTÂNCIA</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">TEMPO</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase text-right pr-8">R$/HORA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyItems.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedDay(item)}
                  >
                    <TableCell className="font-medium text-foreground py-5 pl-8">{formatDateBR(item.date)}</TableCell>
                    <TableCell className="text-foreground/80">{formatCurrency(item.total_earned || 0)}</TableCell>
                    <TableCell className="text-foreground/80">{item.total_deliveries || 0}</TableCell>
                    <TableCell className="text-foreground/80">{(item.odometer_end && item.odometer_start) ? `${(Number(item.odometer_end) - Number(item.odometer_start)).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} km` : '—'}</TableCell>
                    <TableCell className="text-foreground/80">{formatDuration(item.metrics.totalMs)}</TableCell>
                    <TableCell className="text-primary font-bold text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {item.metrics.avgPerHour > 0 ? `${formatCurrency(item.metrics.avgPerHour)}/h` : '—'}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-24 text-center space-y-3 border-t border-border">
            <p className="text-muted-foreground/30 text-xs uppercase tracking-[0.3em] font-bold">Fim dos registros</p>
            <p className="text-muted-foreground/40 text-[10px] max-w-[200px] mx-auto leading-relaxed">
              Novas jornadas aparecerão aqui após serem finalizadas no bot.
            </p>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-[70] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Detalhes da Jornada</div>
                  <h2 className="text-2xl font-bold text-foreground">{formatDateBR(selectedDay.date)}</h2>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-muted/50 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={DollarSign} label="Ganhos Totais" value={formatCurrency(selectedDay.total_earned || 0)} color="text-primary" />
                  <DetailItem icon={Package} label="Entregas" value={(selectedDay.total_deliveries || 0).toString()} />
                  <DetailItem icon={MapPin} label="Distância" value={(selectedDay.odometer_end && selectedDay.odometer_start) ? `${(Number(selectedDay.odometer_end) - Number(selectedDay.odometer_start)).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} km` : '—'} />
                  <DetailItem icon={Clock} label="Duração" value={formatDuration(selectedDay.metrics.totalMs)} />
                </div>

                <div className="space-y-4 pt-8 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">Odômetro</h3>
                  <div className="bg-muted/20 rounded-2xl p-6 border border-border flex justify-between items-center relative overflow-hidden">
                    <div className="space-y-1">
                      <div className="text-[9px] text-muted-foreground/50 uppercase tracking-tighter">Início</div>
                      <div className="text-xl font-bold text-foreground">{selectedDay.odometer_start !== null ? Number(selectedDay.odometer_start).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'} km</div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="space-y-1 text-right">
                      <div className="text-[9px] text-muted-foreground/50 uppercase tracking-tighter">Fim</div>
                      <div className="text-xl font-bold text-foreground">{selectedDay.odometer_end !== null ? Number(selectedDay.odometer_end).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'} km</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">Eficiência</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                      <div className="text-[9px] text-muted-foreground/50 uppercase tracking-tighter mb-1">R$ / HORA</div>
                      <div className="text-lg font-bold text-primary">{selectedDay.metrics.avgPerHour > 0 ? `${formatCurrency(selectedDay.metrics.avgPerHour)}/h` : '—'}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                      <div className="text-[9px] text-muted-foreground/50 uppercase tracking-tighter mb-1">Jornadas</div>
                      <div className="text-lg font-medium text-foreground">{selectedDay.daySessions.length}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">Jornadas Detalhadas</h3>
                  <div className="space-y-3">
                    {selectedDay.daySessions.length > 0 ? (
                      selectedDay.daySessions.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map((session: any, idx: number) => (
                        <div key={session.id} className="p-4 rounded-2xl bg-muted/10 border border-border/50 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {idx + 1}
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                                {formatTimeBR(session.start_time)} — {session.end_time ? formatTimeBR(session.end_time) : '...'}
                              </div>
                              <div className="text-xs font-medium text-foreground/80">
                                {session.end_time ? formatDuration(new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) : 'Em andamento'}
                              </div>
                            </div>
                          </div>
                          <Clock className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground/40 italic">Nenhuma jornada registrada.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-border">
                <button className="w-full py-4 rounded-xl bg-muted/30 border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground">
                  Gerar Comprovante
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailItem({ icon: Icon, label, value, color = "text-foreground" }: any) {
  return (
    <div className="p-5 rounded-2xl bg-muted/20 border border-border space-y-3 relative overflow-hidden group hover:bg-muted/30 transition-colors">
      <Icon className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      <div className="space-y-0.5">
        <div className="text-[9px] text-muted-foreground/50 uppercase tracking-tighter">{label}</div>
        <div className={cn("text-xl font-light tracking-tight", color)}>{value}</div>
      </div>
    </div>
  )
}
