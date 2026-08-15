import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState } from 'react'
import { X, Calendar, DollarSign, Package, MapPin, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/historico')({
  component: HistoryPage,
})

function HistoryPage() {
  const [selectedDay, setSelectedDay] = useState<any>(null)

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white relative overflow-hidden">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">Histórico</h1>
        <p className="text-white/40 text-sm">Detalhamento das suas jornadas passadas.</p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden rounded-2xl relative z-10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase py-6 pl-8">DATA</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">GANHOS</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">ENTREGAS</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">DISTÂNCIA</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">TEMPO</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase text-right pr-8">R$/HORA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow 
                  className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedDay({
                    date: '15/08/2026',
                    earnings: 'R$ 160,00',
                    deliveries: 20,
                    distance: '30 km',
                    duration: '0h46',
                    hourly: 'R$ 206,23/h',
                    odometer_start: 782,
                    odometer_end: 812,
                    sessions: 3
                  })}
                >
                  <TableCell className="font-medium text-white/90 py-5 pl-8">15/08/2026</TableCell>
                  <TableCell className="text-white/70">R$ 160,00</TableCell>
                  <TableCell className="text-white/70">20</TableCell>
                  <TableCell className="text-white/70">30 km</TableCell>
                  <TableCell className="text-white/70">0h46</TableCell>
                  <TableCell className="text-emerald-500 font-bold text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      R$ 206,23/h
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="p-24 text-center space-y-3 border-t border-white/5">
            <p className="text-white/10 text-xs uppercase tracking-[0.3em] font-bold">Fim dos registros</p>
            <p className="text-white/30 text-[10px] max-w-[200px] mx-auto leading-relaxed">
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[oklch(0.129_0.042_264.695)] border-l border-white/10 shadow-2xl z-[70] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Detalhes da Jornada</div>
                  <h2 className="text-2xl font-bold">{selectedDay.date}</h2>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={DollarSign} label="Ganhos Totais" value={selectedDay.earnings} color="text-emerald-400" />
                  <DetailItem icon={Package} label="Entregas" value={selectedDay.deliveries.toString()} />
                  <DetailItem icon={MapPin} label="Distância" value={selectedDay.distance} />
                  <DetailItem icon={Clock} label="Duração" value={selectedDay.duration} />
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                  <h3 className="text-xs font-bold text-white/20 uppercase tracking-widest">Odômetro</h3>
                  <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5 flex justify-between items-center relative overflow-hidden">
                    <div className="space-y-1">
                      <div className="text-[9px] text-white/30 uppercase tracking-tighter">Início</div>
                      <div className="text-xl font-light">{selectedDay.odometer_start} km</div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="space-y-1 text-right">
                      <div className="text-[9px] text-white/30 uppercase tracking-tighter">Fim</div>
                      <div className="text-xl font-light">{selectedDay.odometer_end} km</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                  <h3 className="text-xs font-bold text-white/20 uppercase tracking-widest">Eficiência</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] text-white/30 uppercase tracking-tighter mb-1">R$ / HORA</div>
                      <div className="text-lg font-medium text-emerald-500">{selectedDay.hourly}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] text-white/30 uppercase tracking-tighter mb-1">SESSIÕES</div>
                      <div className="text-lg font-medium">{selectedDay.sessions}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
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

function DetailItem({ icon: Icon, label, value, color = "text-white" }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 relative overflow-hidden group hover:bg-white/[0.05] transition-colors">
      <Icon className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
      <div className="space-y-0.5">
        <div className="text-[9px] text-white/30 uppercase tracking-tighter">{label}</div>
        <div className={cn("text-xl font-light tracking-tight", color)}>{value}</div>
      </div>
    </div>
  )
}

