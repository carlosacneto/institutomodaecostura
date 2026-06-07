import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Wallet,
  TriangleAlert as AlertTriangle,
  Clock,
} from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function normalizarMensalidade(valor: number | null | undefined): number {
  if (valor == null) return 0;
  return valor >= 1000 ? valor / 100 : valor;
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const now = new Date();

      const ini = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);

      const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);

      const hoje = now.toISOString().slice(0, 10);

      const [
        alunosAtivos,
        turmasAtivas,
        recebida,
        vencidas,
        pendentes,
        alunoTurmas,
      ] = await Promise.all([
        supabase
          .from("alunos")
          .select("id, valor_mensalidade")
          .eq("status", "ativo"),

        supabase
          .from("turmas")
          .select("id, nome, status")
          .eq("status", "ativa")
          .order("nome"),

        supabase
          .from("mensalidades")
          .select("valor")
          .gte("data_pagamento", ini)
          .lte("data_pagamento", fim)
          .eq("status", "pago"),

        supabase
          .from("mensalidades")
          .select("id", { count: "exact", head: true })
          .lt("data_vencimento", hoje)
          .neq("status", "pago"),

        supabase
          .from("mensalidades")
          .select("id", { count: "exact", head: true })
          .eq("status", "pendente"),

        supabase
          .from("aluno_turmas")
          .select("aluno_id, turma_id"),
      ]);

      if (alunosAtivos.error) throw alunosAtivos.error;
      if (turmasAtivas.error) throw turmasAtivas.error;
      if (recebida.error) throw recebida.error;
      if (vencidas.error) throw vencidas.error;
      if (pendentes.error) throw pendentes.error;
      if (alunoTurmas.error) throw alunoTurmas.error;

      const alunosAtivosData = alunosAtivos.data ?? [];
      const turmasAtivasData = turmasAtivas.data ?? [];
      const alunoTurmasData = alunoTurmas.data ?? [];

      const alunosAtivosIds = new Set(
        alunosAtivosData.map((aluno: any) => aluno.id)
      );

      const sumRecebida = (rows: { valor: number }[] | null) => {
        return (rows ?? []).reduce((s, r) => s + Number(r.valor || 0), 0);
      };

      const receitaPrevista = alunosAtivosData.reduce(
        (s: number, aluno: any) =>
          s + normalizarMensalidade(aluno.valor_mensalidade),
        0
      );

      const porTurma = turmasAtivasData.map((turma: any) => {
        const total = alunoTurmasData.filter((vinculo: any) => {
          return (
            vinculo.turma_id === turma.id &&
            alunosAtivosIds.has(vinculo.aluno_id)
          );
        }).length;

        return {
          nome: turma.nome,
          total,
        };
      });

      return {
        alunosAtivos: alunosAtivosData.length,
        turmasAtivas: turmasAtivasData.length,
        receitaPrevista,
        receitaRecebida: sumRecebida(recebida.data as any),
        vencidas: vencidas.count ?? 0,
        pendentes: pendentes.count ?? 0,
        porTurma,
      };
    },
  });

  const stats = [
    {
      label: "Alunos ativos",
      value: data?.alunosAtivos ?? 0,
      icon: Users,
      tone: "primary",
    },
    {
      label: "Turmas ativas",
      value: data?.turmasAtivas ?? 0,
      icon: GraduationCap,
      tone: "accent",
    },
    {
      label: "Receita prevista (mês)",
      value: formatBRL(data?.receitaPrevista ?? 0),
      icon: TrendingUp,
      tone: "primary",
    },
    {
      label: "Receita recebida (mês)",
      value: formatBRL(data?.receitaRecebida ?? 0),
      icon: Wallet,
      tone: "success",
    },
    {
      label: "Mensalidades vencidas",
      value: data?.vencidas ?? 0,
      icon: AlertTriangle,
      tone: "destructive",
    },
    {
      label: "Mensalidades pendentes",
      value: data?.pendentes ?? 0,
      icon: Clock,
      tone: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da escola —{" "}
          {new Date().toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => {
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>

                <div className={`rounded-full p-2 ${toneCls}`}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="font-display text-3xl font-semibold">
                  {isLoading ? "—" : s.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="font-display">Alunos por turma</CardTitle>
        </CardHeader>

        <CardContent>
          {(data?.porTurma ?? []).length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma turma cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {data!.porTurma.map((turma) => (
                <div
                  key={turma.nome}
                  className="flex items-center justify-between border-b py-3 last:border-b-0"
                >
                  <span className="font-medium">{turma.nome}</span>

                  <span className="rounded-full bg-muted px-3 py-1 text-sm">
                    {turma.total} aluno{turma.total === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}