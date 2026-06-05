import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, TrendingUp, Wallet, AlertTriangle, Clock } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const now = new Date();
      const ini = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const hoje = now.toISOString().slice(0, 10);

      const [alunos, turmas, prevista, recebida, vencidas, pendentes, perTurma] = await Promise.all([
        supabase.from("alunos").select("id", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("turmas").select("id", { count: "exact", head: true }).eq("status", "ativa"),
        supabase.from("mensalidades").select("valor").gte("data_vencimento", ini).lte("data_vencimento", fim),
        supabase.from("mensalidades").select("valor").gte("data_pagamento", ini).lte("data_pagamento", fim).eq("status", "pago"),
        supabase.from("mensalidades").select("id", { count: "exact", head: true }).lt("data_vencimento", hoje).neq("status", "pago"),
        supabase.from("mensalidades").select("id", { count: "exact", head: true }).eq("status", "pendente"),
        supabase.from("turmas").select("id, nome, alunos(count)"),
      ]);

      const sum = (rows: { valor: number }[] | null) => (rows ?? []).reduce((s, r) => s + Number(r.valor || 0), 0);

      return {
        alunosAtivos: alunos.count ?? 0,
        turmasAtivas: turmas.count ?? 0,
        receitaPrevista: sum(prevista.data as any),
        receitaRecebida: sum(recebida.data as any),
        vencidas: vencidas.count ?? 0,
        pendentes: pendentes.count ?? 0,
        porTurma: (perTurma.data ?? []).map((t: any) => ({ nome: t.nome, total: t.alunos?.[0]?.count ?? 0 })),
      };
    },
  });

  const stats = [
    { label: "Alunos ativos", value: data?.alunosAtivos ?? 0, icon: Users, tone: "primary" },
    { label: "Turmas ativas", value: data?.turmasAtivas ?? 0, icon: GraduationCap, tone: "accent" },
    { label: "Receita prevista (mês)", value: formatBRL(data?.receitaPrevista ?? 0), icon: TrendingUp, tone: "primary" },
    { label: "Receita recebida (mês)", value: formatBRL(data?.receitaRecebida ?? 0), icon: Wallet, tone: "success" },
    { label: "Mensalidades vencidas", value: data?.vencidas ?? 0, icon: AlertTriangle, tone: "destructive" },
    { label: "Mensalidades pendentes", value: data?.pendentes ?? 0, icon: Clock, tone: "warning" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da escola — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => {
          const Icon = s.icon;
          const toneCls = {
            primary: "bg-primary/10 text-primary",
            accent: "bg-accent text-accent-foreground",
            success: "bg-success/15 text-success",
            warning: "bg-warning/20 text-warning-foreground",
            destructive: "bg-destructive/10 text-destructive",
          }[s.tone];
          return (
            <Card key={s.label} className="border-border/60 shadow-[var(--shadow-soft)]">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="font-display text-3xl font-semibold mt-2">{isLoading ? "—" : s.value}</p>
                  </div>
                  <div className={`size-10 rounded-xl grid place-items-center ${toneCls}`}><Icon className="size-5" /></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle className="font-display">Alunos por turma</CardTitle></CardHeader>
        <CardContent>
          {(data?.porTurma ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada ainda.</p>
          ) : (
            <ul className="divide-y">
              {data!.porTurma.map((t, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <span className="font-medium">{t.nome}</span>
                  <span className="text-sm rounded-full bg-secondary px-3 py-1">{t.total} aluno{t.total === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
