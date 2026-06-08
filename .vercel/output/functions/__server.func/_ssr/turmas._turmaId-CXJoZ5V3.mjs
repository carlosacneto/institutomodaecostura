import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { f as formatBRL } from "./format-CYzaeKqH.mjs";
import { R as Route$1 } from "./router-Dk3ZNGXt.mjs";
import "../_libs/sonner.mjs";
import { A as ArrowLeft, U as Users } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
function TurmaDetalhePage() {
  const {
    turmaId
  } = Route$1.useParams();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["turma-detalhe", turmaId],
    queryFn: async () => {
      const {
        data: turma2,
        error: turmaError
      } = await supabase.from("turmas").select("*").eq("id", turmaId).single();
      if (turmaError) throw turmaError;
      const {
        data: vinculos,
        error: vinculosError
      } = await supabase.from("aluno_turmas").select("aluno_id").eq("turma_id", turmaId);
      if (vinculosError) throw vinculosError;
      const alunoIds = (vinculos ?? []).map((v) => v.aluno_id);
      if (alunoIds.length === 0) {
        return {
          turma: turma2,
          alunos: []
        };
      }
      const {
        data: alunos2,
        error: alunosError
      } = await supabase.from("alunos").select("id, id_planilha, nome, telefone, email, cpf, valor_mensalidade, dia_vencimento, status").in("id", alunoIds).order("nome");
      if (alunosError) throw alunosError;
      return {
        turma: turma2,
        alunos: alunos2 ?? []
      };
    }
  });
  const turma = data?.turma;
  const alunos = data?.alunos ?? [];
  const alunosAtivos = alunos.filter((aluno) => aluno.status === "ativo");
  const receitaPrevista = alunosAtivos.reduce((soma, aluno) => soma + Number(aluno.valor_mensalidade ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/turmas", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 size-4" }),
          "Voltar para turmas"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: isLoading ? "Carregando turma..." : turma?.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Lista de alunos vinculados a esta turma." })
        ] })
      ] }),
      turma && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: turma.status === "ativa" ? "bg-success/15 text-success" : "", children: turma.status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Alunos vinculados" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-display text-3xl font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-6 text-primary" }),
          isLoading ? "—" : alunos.length
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Alunos ativos" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-3xl font-semibold", children: isLoading ? "—" : alunosAtivos.length }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Receita prevista" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-3xl font-semibold", children: isLoading ? "—" : formatBRL(receitaPrevista) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Horário" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: turma?.horario ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: turma?.dias_semana ?? "Dias não informados" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display", children: [
          "Alunos da turma ",
          turma?.nome ?? ""
        ] }),
        turma && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Curso: ",
          turma.curso ?? "—",
          " · Professor(a):",
          " ",
          turma.professor ?? "—"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Aluno" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contato" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "CPF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mensalidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Venc." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: "Carregando alunos..." }) }) : alunos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: "Nenhum aluno vinculado a esta turma." }) }) : alunos.map((aluno) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: aluno.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "ID: ",
              aluno.id_planilha ?? "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: aluno.email ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: aluno.telefone ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: aluno.cpf ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatBRL(Number(aluno.valor_mensalidade ?? 0)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: aluno.dia_vencimento ? `Dia ${aluno.dia_vencimento}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: aluno.status === "ativo" ? "bg-success/15 text-success" : "", children: aluno.status ?? "—" }) })
        ] }, aluno.id)) })
      ] }) }) })
    ] })
  ] });
}
export {
  TurmaDetalhePage as component
};
