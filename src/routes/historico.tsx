import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const Route = createFileRoute('/historico')({
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 bg-[oklch(0.129_0.042_264.695)] min-h-screen text-white">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">Detalhamento das suas jornadas passadas.</p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-white/10">
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="text-white/40">DATA</TableHead>
                <TableHead className="text-white/40">GANHOS</TableHead>
                <TableHead className="text-white/40">ENTREGAS</TableHead>
                <TableHead className="text-white/40">DISTÂNCIA</TableHead>
                <TableHead className="text-white/40">TEMPO</TableHead>
                <TableHead className="text-white/40">R$/HORA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                <TableCell className="font-medium text-white/90">15/08/2026</TableCell>
                <TableCell>R$ 160,00</TableCell>
                <TableCell>20</TableCell>
                <TableCell>30 km</TableCell>
                <TableCell>0h46</TableCell>
                <TableCell className="text-emerald-500 font-bold">R$ 206,23/h</TableCell>
              </TableRow>
              {/* Mais linhas mockadas se necessário, ou estado vazio */}
            </TableBody>
          </Table>
          
          <div className="p-20 text-center space-y-4">
            <p className="text-white/20 text-sm">Sem outros registros para exibir no momento.</p>
            <p className="text-white/40 text-xs">As jornadas registradas no bot aparecerão aqui automaticamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
