import { 
  LayoutDashboard, 
  History, 
  TrendingUp, 
  Menu,
  ChevronRight,
  LogOut,
  Smartphone,
  X
} from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'


const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Histórico', icon: History, href: '/historico' },
  { label: 'Desempenho', icon: TrendingUp, href: '/desempenho' },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Erro ao sair")
    } else {
      toast.success("Até breve!")
      navigate({ to: "/auth" })
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-[110] md:hidden p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl text-white/60 hover:text-white transition-all active:scale-95"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card/80 md:bg-card/40 backdrop-blur-3xl border-r border-border flex flex-col z-[100] transition-all duration-500 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-foreground to-foreground/60 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
            EM ROTA
          </h1>
        </div>
        <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] ml-11">Pro Edition</div>

        </div>

        <nav className="flex-1 px-6 space-y-2 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative",
                "text-muted-foreground hover:text-foreground hover:bg-muted/20",
                "[&.active]:bg-primary/10 [&.active]:text-foreground [&.active]:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
              )}
            >
              <item.icon className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all duration-500 group-[.active]:opacity-100 group-[.active]:text-primary" />
              <span className="font-medium text-sm tracking-tight">
                {item.label}
              </span>
              <ChevronRight className="ml-auto w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-500" />
              
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-[.active]:h-4 bg-primary rounded-full transition-all duration-500 opacity-0 group-[.active]:opacity-100 -translate-x-3 group-[.active]:-translate-x-1" />
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-border">
          <div className="p-5 rounded-[2rem] bg-muted/10 border border-border space-y-4 hover:bg-muted/20 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-bold group-hover:text-muted-foreground/60 transition-colors">Telegram Bot</div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center border border-border group-hover:bg-muted/30 transition-colors">
                <Smartphone className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-foreground/80">Conectado</div>
                <p className="text-[9px] text-muted-foreground/30 leading-tight">Sync 100% ativo</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full mt-6 py-4 flex items-center justify-center gap-3 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sair do Painel</span>
          </button>
        </div>
      </aside>

    </>
  )
}
