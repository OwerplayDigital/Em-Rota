import { 
  LayoutDashboard, 
  History, 
  TrendingUp, 
  Menu,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Histórico', icon: History, href: '/historico' },
  { label: 'Desempenho', icon: TrendingUp, href: '/desempenho' },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
      <div className="p-8">
        <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          EM ROTA
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-white/5",
              "[&.active]:bg-white/10 [&.active]:text-white"
            )}
          >
            <item.icon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="font-medium text-sm text-white/70 group-hover:text-white">
              {item.label}
            </span>
            <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="text-xs text-white/30 uppercase tracking-widest font-bold mb-4">
          Telegram Bot
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-medium text-emerald-500">Conectado</span>
          </div>
          <p className="text-[10px] text-white/40 leading-tight">
            Recebendo atualizações em tempo real.
          </p>
        </div>
      </div>
    </aside>
  )
}
