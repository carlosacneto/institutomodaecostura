import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Wallet,
  TriangleAlert as AlertTriangle,
  Clock,
  UserPlus,
  CalendarCheck,
  CheckSquare,
  Target,
  XCircle,
  ArrowUpRight,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Tone =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "destructive"
  | "muted";

type StatCard = {
  label: string;
  value: string | number;
  description?: string;
  icon: typeof Users;
  tone: Tone;
  to?: string;
};

type Lead = {
  id: string;
  origem: string | null;
  status: string | null;
  intencao: string | null;
  prioridade: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
};

function normalizarValor(valor: number | null | undefined): number {
  if (valor == null) return 0;
  return valor >= 1000 ? valor / 100 : valor;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthRange() {
  const now = new Date();

  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const proximoMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    inicioMes: toDateInput(inicioMes),
    proximoMes: toDateInput(proximoMes),
  };
}

function getHojeRange() {
  const now = new Date();

  const inicioHoje = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const inicioAmanha = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  return {
    hoje: toDateInput(inicioHoje),
    amanha: toDateInput(inicioAmanha),
  };
}

function textoNormalizado(valor: string | null | undefined) {
  return (valor ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function percentual(parte: number, total: number) {
  if (total <= 0) return 0;

  return Math.round((parte / total) * 100);
}

function classificarTurma(total: number, maiorTurma: number) {
  const percent = maiorTurma > 0 ? (total / maiorTurma) * 100 : 0;

  if (percent >= 100) {
    return {
      label: "Muito cheia",
      card: "border-primary/30 bg-primary/5",
      badge: "bg-primary/10 text-primary",
      bar: "bg-primary",
      text: "text-primary",
    };
  }

  if (percent >= 70) {
    return {
      label: "Alta",
      card: "border-orange-200 bg-orange-50/60",
      badge: "bg-orange-100 text-orange-700",
      bar: "bg-orange-500",
      text: "text-orange-700",
    };
  }

  if (percent >= 40) {
    return {
      label: "Média",
      card: "border-blue-200 bg-blue-50/60",
      badge: "bg-blue-100 text-blue-700",
      bar: "bg-blue-500",
      text: "text-blue-700",
    };
  }

  if (percent >= 15) {
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

function agruparPorCampo<T extends Record<string, any>>(
  itens: T[],
  campo: keyof T,
  fallback: string
) {
  const mapa = new Map<string, number>();

  for (const item of itens) {
    const valor = String(item[campo] || fallback).trim() || fallback;

    mapa.set(valor, (mapa.get(valor) ?? 0) + 1);
  }

  return Array.from(mapa.entries())
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { inicioMes, proximoMes } = getMonthRange();
      const { hoje, amanha } = getHojeRange();

      const [
        alunosAtivos,
        turmasAtivas,
        receitaRecebida,
        mensalidadesVencidas,
        mensalidadesPendentes,
        alunoTurmas,
        leadsResult,
      ] = await Promise.all([
        supabase
          .from("alunos")
          .select("id, valor_mensalidade, status")
          .eq("status", "ativo"),

        supabase
          .from("turmas")
          .select("id, nome, status")
          .eq("status", "ativa")
          .order("nome"),

        supabase
          .from("mensalidades")
          .select("valor, data_pagamento, status")
          .gte("data_pagamento", inicioMes)
          .lt("data_pagamento", proximoMes)
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

        supabase
          .from("leads")
          .select(
            "id, origem, status, intencao, prioridade, criado_em, atualizado_em"
          ),
      ]);

      if (alunosAtivos.error) throw alunosAtivos.error;
      if (turmasAtivas.error) throw turmasAtivas.error;
      if (receitaRecebida.error) throw receitaRecebida.error;
      if (mensalidadesVencidas.error) throw mensalidadesVencidas.error;
      if (mensalidadesPendentes.error) throw mensalidadesPendentes.error;
      if (alunoTurmas.error) throw alunoTurmas.error;

      const alunosAtivosData = alunosAtivos.data ?? [];
      const turmasAtivasData = turmasAtivas.data ?? [];
      const alunoTurmasData = alunoTurmas.data ?? [];
      const leadsData = leadsResult.error ? [] : ((leadsResult.data ?? []) as Lead[]);

      const alunosAtivosIds = new Set(
        alunosAtivosData.map((aluno: any) => aluno.id)
      );

      const receitaPrevista = alunosAtivosData.reduce(
        (soma: number, aluno: any) =>
          soma + normalizarValor(aluno.valor_mensalidade),
        0
      );

      const recebidaMes = (receitaRecebida.data ?? []).reduce(
        (soma: number, pagamento: any) =>
          soma + normalizarValor(pagamento.valor),
        0
      );

      const leadsHoje = leadsData.filter((lead) => {
        if (!lead.criado_em) return false;

        const dataLead = lead.criado_em.slice(0, 10);

        return dataLead >= hoje && dataLead < amanha;
      });

      const leadsAgendados = leadsData.filter((lead) => {
        const status = textoNormalizado(lead.status);
        const intencao = textoNormalizado(lead.intencao);

        return (
          status.includes("agend") ||
          status.includes("visita") ||
          intencao.includes("agend") ||
          intencao.includes("visita")
        );
      });

      const leadsAltaPrioridade = leadsData.filter((lead) => {
        const prioridade = textoNormalizado(lead.prioridade);

        return prioridade.includes("alta");
      });

      const leadsNovosOuAtendimento = leadsData.filter((lead) => {
        const status = textoNormalizado(lead.status);

        return (
          status.includes("novo") ||
          status.includes("atendimento") ||
          status.includes("em atendimento")
        );
      });

      const tarefasPendentes = Array.from(
        new Set([
          ...leadsAltaPrioridade.map((lead) => lead.id),
          ...leadsNovosOuAtendimento.map((lead) => lead.id),
        ])
      ).length;

      const leadsMatriculados = leadsData.filter((lead) => {
        const status = textoNormalizado(lead.status);

        return status.includes("matriculad");
      });

      const leadsPerdidos = leadsData.filter((lead) => {
        const status = textoNormalizado(lead.status);

        return (
          status.includes("perdid") ||
          status.includes("sem resposta") ||
          status.includes("cancel")
        );
      });

      const conversaoLeadAluno = percentual(
        leadsMatriculados.length,
        leadsData.length
      );

      const porOrigem = agruparPorCampo(leadsData, "origem", "Sem origem");
      const porStatus = agruparPorCampo(leadsData, "status", "Sem status");

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

      const totalVinculos = porTurma.reduce((soma, turma) => soma + turma.total, 0);
      const maiorTurma = porTurma.length > 0 ? porTurma[0].total : 0;

      const turmasAltaOcupacao = porTurma.filter((turma) => {
        if (maiorTurma <= 0) return false;

        return (turma.total / maiorTurma) * 100 >= 70;
      }).length;

      return {
        alunosAtivos: alunosAtivosData.length,
        turmasAtivas: turmasAtivasData.length,
        receitaPrevista,
        receitaRecebida: recebidaMes,
        mensalidadesVencidas: mensalidadesVencidas.count ?? 0,
        mensalidadesPendentes: mensalidadesPendentes.count ?? 0,

        leadsTotal: leadsData.length,
        leadsHoje: leadsHoje.length,
        leadsAgendados: leadsAgendados.length,
        leadsAltaPrioridade: leadsAltaPrioridade.length,
        leadsPerdidos: leadsPerdidos.length,
        leadsMatriculados: leadsMatriculados.length,
        conversaoLeadAluno,
        tarefasPendentes,

        porOrigem,
        porStatus,

        porTurma,
        totalVinculos,
        totalTurmasComAlunos: porTurma.length,
        maiorTurma,
        turmasAltaOcupacao,
      };
    },
  });

  const toneCls: Record<Tone, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };

  const hojeStats: StatCard[] = [
    {
      label: "Novos leads hoje",
      value: data?.leadsHoje ?? 0,
      description: "Leads criados hoje",
      icon: UserPlus,
      tone: "primary",
      to: "/leads",
    },
    {
      label: "Visitas agendadas",
      value: data?.leadsAgendados ?? 0,
      description: "Leads com status ou intenção de visita",
      icon: CalendarCheck,
      tone: "success",
      to: "/leads",
    },
    {
      label: "Turmas em alta ocupação",
      value: data?.turmasAltaOcupacao ?? 0,
      description: "Turmas próximas das maiores lotações",
      icon: GraduationCap,
      tone: "warning",
      to: "/turmas",
    },
    {
      label: "Tarefas pendentes",
      value: data?.tarefasPendentes ?? 0,
      description: "Leads novos ou de alta prioridade",
      icon: CheckSquare,
      tone: "destructive",
      to: "/leads",
    },
  ];

  const financeiroStats: StatCard[] = [
    {
      label: "Receita prevista",
      value: formatBRL(data?.receitaPrevista ?? 0),
      description: "Base nos alunos ativos",
      icon: TrendingUp,
      tone: "primary",
      to: "/mensalidades",
    },
    {
      label: "Recebido no mês",
      value: formatBRL(data?.receitaRecebida ?? 0),
      description: "Pagamentos com status pago",
      icon: Wallet,
      tone: "success",
      to: "/pagamentos",
    },
    {
      label: "Mensalidades vencidas",
      value: data?.mensalidadesVencidas ?? 0,
      description: "Vencidas e ainda não pagas",
      icon: AlertTriangle,
      tone: "destructive",
      to: "/mensalidades",
    },
    {
      label: "Mensalidades pendentes",
      value: data?.mensalidadesPendentes ?? 0,
      description: "Status pendente",
      icon: Clock,
      tone: "warning",
      to: "/mensalidades",
    },
  ];

  const comercialStats: StatCard[] = [
    {
      label: "Total de leads",
      value: data?.leadsTotal ?? 0,
      description: "Base comercial atual",
      icon: MessageCircle,
      tone: "primary",
      to: "/leads",
    },
    {
      label: "Alunos ativos",
      value: data?.alunosAtivos ?? 0,
      description: "Matrículas ativas",
      icon: Users,
      tone: "success",
      to: "/alunos",
    },
    {
      label: "Conversão lead → aluno",
      value: `${data?.conversaoLeadAluno ?? 0}%`,
      description: "Leads com status matriculado",
      icon: Target,
      tone: "accent",
      to: "/leads",
    },
    {
      label: "Leads perdidos",
      value: data?.leadsPerdidos ?? 0,
      description: "Perdidos, cancelados ou sem resposta",
      icon: XCircle,
      tone: "destructive",
      to: "/leads",
    },
  ];

  function renderStats(stats: StatCard[]) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          const content = (
            <Card className="h-full border-border/60 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>

                <div className={`rounded-full p-2 ${toneCls[stat.tone]}`}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="font-display text-3xl font-semibold">
                  {isLoading ? "—" : stat.value}
                </div>

                {stat.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );

          if (!stat.to) {
            return <div key={stat.label}>{content}</div>;
          }

          return (
            <Link key={stat.label} to={stat.to} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>

          <p className="text-muted-foreground mt-1">
            Visão geral da escola —{" "}
            {new Date().toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
          Atualizado automaticamente pelo Supabase
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Hoje</h2>
          <p className="text-sm text-muted-foreground">
            Indicadores rápidos para acompanhar o dia.
          </p>
        </div>

        {renderStats(hojeStats)}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Previsão, recebimentos e pendências do mês.
          </p>
        </div>

        {renderStats(financeiroStats)}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Comercial</h2>
          <p className="text-sm text-muted-foreground">
            Leads, conversão e situação comercial.
          </p>
        </div>

        {renderStats(comercialStats)}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Leads por origem
            </CardTitle>
          </CardHeader>

          <CardContent>
            {(data?.porOrigem ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum lead encontrado.
              </p>
            ) : (
              <div className="space-y-3">
                {data!.porOrigem.slice(0, 6).map((item) => {
                  const percent = percentual(item.total, data?.leadsTotal ?? 0);

                  return (
                    <div key={item.nome} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">{item.nome}</span>
                        <span className="text-muted-foreground">
                          {item.total} lead{item.total === 1 ? "" : "s"} ·{" "}
                          {percent}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(percent, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Funil por status
            </CardTitle>
          </CardHeader>

          <CardContent>
            {(data?.porStatus ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum status encontrado.
              </p>
            ) : (
              <div className="space-y-3">
                {data!.porStatus.slice(0, 7).map((item) => {
                  const percent = percentual(item.total, data?.leadsTotal ?? 0);

                  return (
                    <div
                      key={item.nome}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {percent}% do total de leads
                        </div>
                      </div>

                      <Badge variant="secondary">
                        {item.total} lead{item.total === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
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
                              <div
                                className={`rounded-full px-3 py-1 text-xs font-medium ${visual.badge}`}
                              >
                                {visual.label}
                              </div>

                              <div
                                className={`text-2xl font-semibold ${visual.text}`}
                              >
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
                                {Math.round(percentualMaiorTurma)}% da maior
                                turma
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

      <Card className="border-border/60 bg-muted/30 shadow-[var(--shadow-soft)]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="font-display text-lg font-semibold">
              Próximas melhorias do Dashboard
            </div>

            <p className="text-sm text-muted-foreground">
              Depois podemos adicionar tarefas reais, notificações, metas e
              filtros por período.
            </p>
          </div>

          <Link
            to="/leads"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Ver leads
            <ArrowUpRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}