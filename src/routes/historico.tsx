import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const Route = createFileRoute('/historico')({
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">Histórico</h1>
        <p className="text-white/40 text-sm">Detalhamento das suas jornadas passadas.</p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="hover:bg-transparent border-white/10">
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase py-6">DATA</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">GANHOS</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">ENTREGAS</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">DISTÂNCIA</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase">TEMPO</TableHead>
                  <TableHead className="text-white/30 text-[10px] font-bold tracking-widest uppercase text-right pr-8">R$/HORA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                  <TableCell className="font-medium text-white/90 py-5">15/08/2026</TableCell>
                  <TableCell className="text-white/70">R$ 160,00</TableCell>
                  <TableCell className="text-white/70">20</TableCell>
                  <TableCell className="text-white/70">30 km</TableCell>
                  <TableCell className="text-white/70">0h46</TableCell>
                  <TableCell className="text-emerald-500 font-bold text-right pr-8">R$ 206,23/h</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="p-24 text-center space-y-3">
            <p className="text-white/10 text-xs uppercase tracking-[0.3em] font-bold">Fim dos registros</p>
            <p className="text-white/30 text-[10px] max-w-[200px] mx-auto leading-relaxed">
              Novas jornadas aparecerão aqui após serem finalizadas no bot.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
