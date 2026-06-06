import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, GraduationCap, Receipt, CreditCard, Upload, MessageCircle, Settings, LogOut, Scissors, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/turmas", label: "Turmas", icon: GraduationCap },
  { to: "/mensalidades", label: "Mensalidades", icon: Receipt },
  { to: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { to: "/importacao", label: "Importação", icon: Upload },
  { to: "/cobrancas", label: "Cobranças", icon: MessageCircle },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )} style={{ height: "100dvh", top: 0 }}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Scissors className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-base">Instituto Moda e Costura</div>
            <div className="text-[11px] text-muted-foreground">Escola de Costura</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{email}</div>
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="size-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur border-b">
          <button onClick={() => setOpen(true)} aria-label="Menu"><Menu className="size-5" /></button>
          <div className="flex items-center gap-2 font-display font-semibold"><Scissors className="size-4 text-primary" /> Instituto Moda e Costura</div>
          <div className="w-5" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
