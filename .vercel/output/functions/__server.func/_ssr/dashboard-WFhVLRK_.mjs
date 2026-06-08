import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { f as formatBRL } from "./format-CYzaeKqH.mjs";
import { U as Users, G as GraduationCap, h as TrendingUp, W as Wallet, i as TriangleAlert, j as Clock } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function normalizarMensalidade(valor) {
  if (valor == null) return 0;
  return valor >= 1e3 ? valor / 100 : valor;
}
function classificarTurma(total, maiorTurma) {
  const percentual = maiorTurma > 0 ? total / maiorTurma * 100 : 0;
  if (percentual >= 100) {
    return {
      label: "Muito cheia",
      card: "border-primary/30 bg-primary/5",
      badge: "bg-primary/10 text-primary",
      bar: "bg-primary",
      text: "text-primary"
    };
  }
  if (percentual >= 70) {
    return {
      label: "Alta",
      card: "border-orange-200 bg-orange-50/60",
      badge: "bg-orange-100 text-orange-700",
      bar: "bg-orange-500",
      text: "text-orange-700"
    };
  }
  if (percentual >= 40) {
    return {
      label: "Média",
      card: "border-blue-200 bg-blue-50/60",
      badge: "bg-blue-100 text-blue-700",
      bar: "bg-blue-500",
      text: "text-blue-700"
    };
  }
  if (percentual >= 15) {
    return {
      label: "Baixa",
      card: "border-green-200 bg-green-50/60",
      badge: "bg-green-100 text-green-700",
      bar: "bg-green-500",
      text: "text-green-700"
    };
  }
  return {
    label: "Muito baixa",
    card: "border-slate-200 bg-slate-50/60",
    badge: "bg-slate-100 text-slate-700",
    bar: "bg-slate-500",
    text: "text-slate-700"
  };
}
function Dashboard() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const now = /* @__PURE__ */ new Date();
      const ini = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const hoje = now.toISOString().slice(0, 10);
      const [alunosAtivos, turmasAtivas, recebida, vencidas, pendentes, alunoTurmas] = await Promise.all([supabase.from("alunos").select("id, valor_mensalidade").eq("status", "ativo"), supabase.from("turmas").select("id, nome, status").eq("status", "ativa").order("nome"), supabase.from("mensalidades").select("valor").gte("data_pagamento", ini).lte("data_pagamento", fim).eq("status", "pago"), supabase.from("mensalidades").select("id", {
        count: "exact",
        head: true
      }).lt("data_vencimento", hoje).neq("status", "pago"), supabase.from("mensalidades").select("id", {
        count: "exact",
        head: true
      }).eq("status", "pendente"), supabase.from("aluno_turmas").select("aluno_id, turma_id")]);
      if (alunosAtivos.error) throw alunosAtivos.error;
      if (turmasAtivas.error) throw turmasAtivas.error;
      if (recebida.error) throw recebida.error;
      if (vencidas.error) throw vencidas.error;
      if (pendentes.error) throw pendentes.error;
      if (alunoTurmas.error) throw alunoTurmas.error;
      const alunosAtivosData = alunosAtivos.data ?? [];
      const turmasAtivasData = turmasAtivas.data ?? [];
      const alunoTurmasData = alunoTurmas.data ?? [];
      const alunosAtivosIds = new Set(alunosAtivosData.map((aluno) => aluno.id));
      const sumRecebida = (rows) => {
        return (rows ?? []).reduce((s, r) => s + Number(r.valor || 0), 0);
      };
      const receitaPrevista = alunosAtivosData.reduce((s, aluno) => s + normalizarMensalidade(aluno.valor_mensalidade), 0);
      const porTurma = turmasAtivasData.map((turma) => {
        const total = alunoTurmasData.filter((vinculo) => {
          return vinculo.turma_id === turma.id && alunosAtivosIds.has(vinculo.aluno_id);
        }).length;
        return {
          id: turma.id,
          nome: turma.nome,
          total
        };
      }).filter((turma) => turma.total > 0).sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
      const totalVinculos = porTurma.reduce((s, turma) => s + turma.total, 0);
      const maiorTurma = porTurma.length > 0 ? porTurma[0].total : 0;
      return {
        alunosAtivos: alunosAtivosData.length,
        turmasAtivas: turmasAtivasData.length,
        receitaPrevista,
        receitaRecebida: sumRecebida(recebida.data),
        vencidas: vencidas.count ?? 0,
        pendentes: pendentes.count ?? 0,
        porTurma,
        totalVinculos,
        totalTurmasComAlunos: porTurma.length,
        maiorTurma
      };
    }
  });
  const stats = [{
    label: "Alunos ativos",
    value: data?.alunosAtivos ?? 0,
    icon: Users,
    tone: "primary"
  }, {
    label: "Turmas ativas",
    value: data?.turmasAtivas ?? 0,
    icon: GraduationCap,
    tone: "accent"
  }, {
    label: "Receita prevista (mês)",
    value: formatBRL(data?.receitaPrevista ?? 0),
    icon: TrendingUp,
    tone: "primary"
  }, {
    label: "Receita recebida (mês)",
    value: formatBRL(data?.receitaRecebida ?? 0),
    icon: Wallet,
    tone: "success"
  }, {
    label: "Mensalidades vencidas",
    value: data?.vencidas ?? 0,
    icon: TriangleAlert,
    tone: "destructive"
  }, {
    label: "Mensalidades pendentes",
    value: data?.pendentes ?? 0,
    icon: Clock,
    tone: "warning"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1", children: [
        "Visão geral da escola —",
        " ",
        (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric"
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: stats.map((s) => {
      const Icon = s.icon;
      const toneCls = {
        primary: "bg-primary/10 text-primary",
        accent: "bg-accent text-accent-foreground",
        success: "bg-success/15 text-success",
        warning: "bg-warning/20 text-warning-foreground",
        destructive: "bg-destructive/10 text-destructive"
      }[s.tone];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: s.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full p-2 ${toneCls}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-3xl font-semibold", children: isLoading ? "—" : s.value }) })
      ] }, s.label);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display", children: "Alunos por turma" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Clique em uma turma para ver a lista de alunos vinculados." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full bg-muted px-3 py-1 text-sm", children: [
            data?.totalVinculos ?? 0,
            " vínculo",
            (data?.totalVinculos ?? 0) === 1 ? "" : "s",
            " totais"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full bg-muted px-3 py-1 text-sm", children: [
            data?.totalTurmasComAlunos ?? 0,
            " turma",
            (data?.totalTurmasComAlunos ?? 0) === 1 ? "" : "s",
            " com alunos"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: (data?.porTurma ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Nenhuma turma com alunos ativos vinculados." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: data.porTurma.map((turma, index) => {
          const maiorTurma = data?.maiorTurma ?? 1;
          const totalVinculos = data?.totalVinculos ?? 1;
          const percentualMaiorTurma = maiorTurma > 0 ? turma.total / maiorTurma * 100 : 0;
          const percentualTotal = totalVinculos > 0 ? Math.round(turma.total / totalVinculos * 100) : 0;
          const larguraBarra = Math.max(percentualMaiorTurma, 8);
          const visual = classificarTurma(turma.total, maiorTurma);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/turmas/$turmaId", params: {
            turmaId: turma.id
          }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `h-full border shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md ${visual.card}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${visual.badge}`, children: index + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-semibold leading-none", children: turma.nome }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
                    turma.total,
                    " aluno",
                    turma.total === 1 ? "" : "s",
                    " ativo",
                    turma.total === 1 ? "" : "s"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full px-3 py-1 text-xs font-medium ${visual.badge}`, children: visual.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-semibold ${visual.text}`, children: turma.total })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full transition-all ${visual.bar}`, style: {
                width: `${larguraBarra}%`
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: visual.text, children: [
                  Math.round(percentualMaiorTurma),
                  "% da maior turma"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  percentualTotal,
                  "% do total"
                ] })
              ] })
            ] })
          ] }) }) }, turma.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-4 border-t pt-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-primary" }),
            "Muito cheia"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-orange-500" }),
            "Alta"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-blue-500" }),
            "Média"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-green-500" }),
            "Baixa"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-slate-500" }),
            "Muito baixa"
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Dashboard as component
};
