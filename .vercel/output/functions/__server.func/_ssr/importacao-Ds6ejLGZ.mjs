import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-DQ5v2DYb.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadWebhooks, c as callWebhook } from "./webhooks-BOZMFP8R.mjs";
import { a as formatDate } from "./format-CYzaeKqH.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as FileSpreadsheet, a as Upload } from "../_libs/lucide-react.mjs";
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
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
function ImportacaoPage() {
  const qc = useQueryClient();
  const [loading, setLoading] = reactExports.useState(false);
  const {
    data: hist = []
  } = useQuery({
    queryKey: ["importacoes"],
    queryFn: async () => (await supabase.from("importacoes").select("*").order("executado_em", {
      ascending: false
    }).limit(20)).data ?? []
  });
  const importar = useMutation({
    mutationFn: async () => {
      const url = loadWebhooks().importacao;
      setLoading(true);
      const res = await callWebhook(url, {
        source: "google_sheets",
        triggered_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await supabase.from("importacoes").insert({
        origem: "google_sheets",
        total_linhas: 0,
        novos_registros: 0,
        registros_atualizados: 0,
        erros: 0
      });
      return res;
    },
    onSuccess: () => {
      toast.success("Importação solicitada ao n8n");
      qc.invalidateQueries({
        queryKey: ["importacoes"]
      });
    },
    onError: (e) => toast.error(e.message),
    onSettled: () => setLoading(false)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Importação" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Sincronize alunos e turmas a partir do Google Sheets via n8n." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-8 flex flex-col items-center text-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-2xl bg-primary/10 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "Importar do Google Sheets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-md", children: "Aciona o webhook configurado no n8n para puxar os dados da sua planilha." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", onClick: () => importar.mutate(), disabled: loading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4 mr-2" }),
        loading ? "Importando..." : "Importar Google Sheets"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "URL configurada em ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/configuracoes", className: "underline", children: "Configurações" }),
        "."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-lg", children: "Histórico" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quando" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Origem" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Linhas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Novos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Atualizados" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Erros" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: hist.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center py-6 text-muted-foreground", children: "Sem importações ainda." }) }) : hist.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(h.executado_em?.slice(0, 10)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.origem }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.total_linhas }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.novos_registros }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.registros_atualizados }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.erros })
        ] }, h.id)) })
      ] }) }) })
    ] })
  ] });
}
export {
  ImportacaoPage as component
};
