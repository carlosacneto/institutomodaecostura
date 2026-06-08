import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { f as formatBRL, a as formatDate } from "./format-CYzaeKqH.mjs";
import { f as Search } from "../_libs/lucide-react.mjs";
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
import "../_libs/class-variance-authority.mjs";
function PagamentosPage() {
  const [busca, setBusca] = reactExports.useState("");
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const {
        data: data2,
        error
      } = await supabase.from("mensalidades").select("*").eq("status", "pago").order("data_pagamento", {
        ascending: false
      });
      if (error) throw error;
      return data2 ?? [];
    }
  });
  const pagamentosFiltrados = reactExports.useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return data;
    return data.filter((p) => {
      const textoBusca = [p.nome_aluno, p.telefone, p.turma, p.valor, p.data_pagamento, p.data_vencimento, p.status, p.observacoes].filter(Boolean).join(" ").toLowerCase();
      return textoBusca.includes(termo);
    });
  }, [data, busca]);
  const total = pagamentosFiltrados.reduce((s, p) => s + Number(p.valor || 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Pagamentos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Histórico completo de pagamentos recebidos." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-lg flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            pagamentosFiltrados.length,
            " pagamento",
            pagamentosFiltrados.length === 1 ? "" : "s"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: formatBRL(total) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: busca, onChange: (e) => setBusca(e.target.value), placeholder: "Buscar por nome, telefone, turma, valor ou data...", className: "pl-10" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Data pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Aluno" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Telefone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Turma" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Valor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Observações" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "Carregando..." }) }) : pagamentosFiltrados.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "Nenhum pagamento encontrado." }) }) : pagamentosFiltrados.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.data_pagamento ? formatDate(p.data_pagamento) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: p.nome_aluno ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.telefone ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.turma ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatBRL(Number(p.valor ?? 0)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-success/15 text-success", children: "pago" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground", children: p.observacoes ?? "—" })
        ] }, p.id)) })
      ] }) }) })
    ] })
  ] });
}
export {
  PagamentosPage as component
};
