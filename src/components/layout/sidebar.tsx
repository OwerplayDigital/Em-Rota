import { 
  LayoutDashboard, 
  History, 
  TrendingUp, 
  Menu,
  ChevronRight,
  LogOut,
  Smartphone
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col z-[100] transition-all duration-500">
      <div className="p-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-white/60 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            EM ROTA
          </h1>
        </div>
        <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] ml-11">Pro Edition</div>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative",
              "text-white/40 hover:text-white hover:bg-white/[0.03]",
              "[&.active]:bg-white/10 [&.active]:text-white [&.active]:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
            )}
          >
            <item.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all duration-500 group-[.active]:opacity-100" />
            <span className="font-medium text-sm tracking-tight">
              {item.label}
            </span>
            <ChevronRight className="ml-auto w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-500" />
            
            {/* Active Indicator Dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-[.active]:h-4 bg-white rounded-full transition-all duration-500 opacity-0 group-[.active]:opacity-100 -translate-x-3 group-[.active]:-translate-x-1" />
          </Link>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-white/20 uppercase tracking-widest font-bold group-hover:text-white/40 transition-colors">Telegram Bot</div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
              <Smartphone className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-white/80">Conectado</div>
              <p className="text-[9px] text-white/30 leading-tight">Sync 100% ativo</p>
            </div>
          </div>
        </div>
        
        <button className="w-full mt-6 py-4 flex items-center justify-center gap-3 text-white/20 hover:text-white/60 transition-colors group">
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sair do Painel</span>
        </button>
      </div>
    </aside>
  )
}

