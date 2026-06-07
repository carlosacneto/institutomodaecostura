import { createFileRoute, Link } from "@tanstack/react-router";
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

function classificarTurma(total: number, maiorTurma: number) {
  const percentual = maiorTurma > 0 ? (total / maiorTurma) * 100 : 0;

  if (percentual >= 100) {
    return {
      label: "Muito cheia",
      card: "border-primary/30 bg-primary/5",
      badge: "bg-primary/10 text-primary",
      bar: "bg-primary",
      text: "text-primary",
    };
  }

  if (percentual >= 70) {
    return {
      label: "Alta",
      card: "border-orange-200 bg-orange-50/60",
      badge: "bg-orange-100 text-orange-700",
      bar: "bg-orange-500",
      text: "text-orange-700",
    };
  }

  if (percentual >= 40) {
    return {
      label: "Média",
      card: "border-blue-200 bg-blue-50/60",
      badge: "bg-blue-100 text-blue-700",
      bar: "bg-blue-500",
      text: "text-blue-700",
    };
  }

  if (percentual >= 15) {
    return {
      label: "Baixa",
      card: "border-green-200 bg-green-50/60",
      badge: "bg-green-100 text-green-700",
      bar: "bg-green-500",
      text: "text-green-700",
    };
  }

  return {
    label: "Muito baixa",
    card: "border-slate-200 bg-slate-50/60",
    badge: "bg-slate-100 text-slate-700",
    bar: "bg-slate-500",
    text: "text-slate-700",
  };
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
            id: turma.id,
            nome: turma.nome,
            total,
          };
        })
        .filter((turma) => turma.total > 0)
        .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));

      const totalVinculos = porTurma.reduce((s, turma) => s + turma.total, 0);
      const maiorTurma = porTurma.length > 0 ? porTurma[0].total : 0;

      return {
        alunosAtivos: alunosAtivosData.length,
        turmasAtivas: turmasAtivasData.length,
        receitaPrevista,
        receitaRecebida: sumRecebida(recebida.data as any),
        vencidas: vencidas.count ?? 0,
        pendentes: pendentes.count ?? 0,
        porTurma,
        totalVinculos,
        totalTurmasComAlunos: porTurma.length,
        maiorTurma,
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
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="font-display">Alunos por turma</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em uma turma para ver a lista de alunos vinculados.
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="rounded-full bg-muted px-3 py-1 text-sm">
                {data?.totalVinculos ?? 0} vínculo
                {(data?.totalVinculos ?? 0) === 1 ? "" : "s"} totais
              </div>

              <div className="rounded-full bg-muted px-3 py-1 text-sm">
                {data?.totalTurmasComAlunos ?? 0} turma
                {(data?.totalTurmasComAlunos ?? 0) === 1 ? "" : "s"} com alunos
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {(data?.porTurma ?? []).length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma turma com alunos ativos vinculados.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data!.porTurma.map((turma, index) => {
                  const maiorTurma = data?.maiorTurma ?? 1;
                  const totalVinculos = data?.totalVinculos ?? 1;

                  const percentualMaiorTurma =
                    maiorTurma > 0 ? (turma.total / maiorTurma) * 100 : 0;

                  const percentualTotal =
                    totalVinculos > 0
                      ? Math.round((turma.total / totalVinculos) * 100)
                      : 0;

                  const larguraBarra = Math.max(percentualMaiorTurma, 8);
                  const visual = classificarTurma(turma.total, maiorTurma);

                  return (
                    <Link
                      key={turma.id}
                      to="/turmas/$turmaId"
                      params={{ turmaId: turma.id }}
                      className="block"
                    >
                      <Card
                        className={`h-full border shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md ${visual.card}`}
                      >
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${visual.badge}`}
                              >
                                {index + 1}
                              </div>

                              <div>
                                <div className="font-display text-lg font-semibold leading-none">
                                  {turma.nome}
                                </div>

                                <p className="text-sm text-muted-foreground mt-1">
                                  {turma.total} aluno
                                  {turma.total === 1 ? "" : "s"} ativo
                                  {turma.total === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 text-right">
                              <div className={`rounded-full px-3 py-1 text-xs font-medium ${visual.badge}`}>
                                {visual.label}
                              </div>

                              <div className={`text-2xl font-semibold ${visual.text}`}>
                                {turma.total}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${visual.bar}`}
                                style={{ width: `${larguraBarra}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className={visual.text}>
                                {Math.round(percentualMaiorTurma)}% da maior turma
                              </span>

                              <span className="text-muted-foreground">
                                {percentualTotal}% do total
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  Muito cheia
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  Alta
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  Média
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  Baixa
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-slate-500" />
                  Muito baixa
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}