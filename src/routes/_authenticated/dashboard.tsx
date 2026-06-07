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

type TurmaResumo = {
  nome: string;
  total: number;
};

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

        supabase.from("aluno_turmas").select("aluno_id, turma_id"),
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

      const porTurma = turmasAtivasData
        .map((turma: any) => {
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
        })
        .sort((a, b) => {
          if (b.total !== a.total) return b.total - a.total;
          return a.nome.localeCompare(b.nome);
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

  const turmas = data?.porTurma ?? [];
  const turmasComAlunos = turmas.filter((turma) => turma.total > 0);
  const turmasVazias = turmas.filter((turma) => turma.total === 0);
  const maiorTotal = Math.max(...turmasComAlunos.map((turma) => turma.total), 1);
  const totalVinculos = turmasComAlunos.reduce(
    (soma, turma) => soma + turma.total,
    0
  );

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
            <Card
              key={s.label}
              className="border-border/60 shadow-[var(--shadow-soft)]"
            >
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="font-display">Alunos por turma</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Ranking das turmas com alunos ativos vinculados.
              </p>
            </div>

            <div className="rounded-full bg-muted px-4 py-2 text-sm font-medium">
              {totalVinculos} vínculo{totalVinculos === 1 ? "" : "s"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando turmas...</p>
          ) : turmas.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma turma cadastrada ainda.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Turmas com alunos</h3>
                  <span className="text-sm text-muted-foreground">
                    {turmasComAlunos.length} turma
                    {turmasComAlunos.length === 1 ? "" : "s"}
                  </span>
                </div>

                {turmasComAlunos.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Nenhuma turma possui alunos ativos vinculados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turmasComAlunos.map((turma, index) => {
                      const porcentagem = Math.max(
                        8,
                        Math.round((turma.total / maiorTotal) * 100)
                      );

                      return (
                        <div
                          key={turma.nome}
                          className="rounded-xl border bg-card p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {index + 1}
                              </span>

                              <div>
                                <p className="font-semibold">{turma.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {turma.total} aluno
                                  {turma.total === 1 ? "" : "s"} ativo
                                  {turma.total === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                              {turma.total}
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${porcentagem}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Turmas vazias</h3>
                  <span className="text-sm text-muted-foreground">
                    {turmasVazias.length} turma
                    {turmasVazias.length === 1 ? "" : "s"}
                  </span>
                </div>

                {turmasVazias.length === 0 ? (
                  <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
                    Todas as turmas ativas possuem alunos vinculados.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {turmasVazias.map((turma) => (
                      <span
                        key={turma.nome}
                        className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                      >
                        {turma.nome}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}