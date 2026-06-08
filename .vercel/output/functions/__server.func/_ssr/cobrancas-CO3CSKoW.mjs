import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "../_libs/radix-ui__react-checkbox.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadWebhooks, c as callWebhook } from "./webhooks-BOZMFP8R.mjs";
import { t as today, f as formatBRL, a as formatDate } from "./format-CYzaeKqH.mjs";
import { U as Users, k as Send, M as MessageCircle, l as Check } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/zod.mjs";
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
function CobrancasPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const {
    data: vencidas = [],
    isLoading
  } = useQuery({
    queryKey: ["vencidas"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("mensalidades").select("id, valor, data_vencimento, alunos(id, nome, telefone, email)").neq("status", "pago").lt("data_vencimento", today()).order("data_vencimento");
      return data ?? [];
    }
  });
  const {
    data: historico = []
  } = useQuery({
    queryKey: ["mensagens"],
    queryFn: async () => (await supabase.from("mensagens").select("*, alunos(nome)").order("created_at", {
      ascending: false
    }).limit(30)).data ?? []
  });
  const toggle = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const enviarIndividual = useMutation({
    mutationFn: async (m) => {
      const url = loadWebhooks().cobrancaIndividual;
      await callWebhook(url, {
        aluno: m.alunos,
        mensalidade: {
          id: m.id,
          valor: m.valor,
          vencimento: m.data_vencimento
        }
      });
      await supabase.from("mensagens").insert({
        aluno_id: m.alunos.id,
        tipo: "cobranca",
        canal: "whatsapp",
        conteudo: `Cobrança ${formatBRL(m.valor)} venc. ${m.data_vencimento}`,
        status_envio: "enviado",
        enviado_em: (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    onSuccess: () => {
      toast.success("Cobrança enviada");
      qc.invalidateQueries({
        queryKey: ["mensagens"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const enviarLote = useMutation({
    mutationFn: async () => {
      const url = loadWebhooks().cobrancaLote;
      const list = vencidas.filter((m) => selected.has(m.id));
      if (list.length === 0) throw new Error("Selecione ao menos uma cobrança");
      await callWebhook(url, {
        cobrancas: list.map((m) => ({
          aluno: m.alunos,
          mensalidade: {
            id: m.id,
            valor: m.valor,
            vencimento: m.data_vencimento
          }
        }))
      });
      await supabase.from("mensagens").insert(list.map((m) => ({
        aluno_id: m.alunos.id,
        tipo: "cobranca_lote",
        canal: "whatsapp",
        conteudo: `Cobrança em lote ${formatBRL(m.valor)}`,
        status_envio: "enviado",
        enviado_em: (/* @__PURE__ */ new Date()).toISOString()
      })));
    },
    onSuccess: () => {
      toast.success(`${selected.size} cobranças enviadas`);
      setSelected(/* @__PURE__ */ new Set());
      qc.invalidateQueries({
        queryKey: ["mensagens"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex justify-between flex-wrap gap-4 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Cobranças por WhatsApp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Mensagens disparadas via webhook do n8n." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => enviarLote.mutate(), disabled: selected.size === 0 || enviarLote.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 mr-2" }),
        " Enviar em lote (",
        selected.size,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-lg", children: "Mensalidades vencidas" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Aluno" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Telefone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Valor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Vencimento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ação" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "Carregando..." }) }) : vencidas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "Nenhuma mensalidade vencida 🎉" }) }) : vencidas.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selected.has(m.id), onCheckedChange: () => toggle(m.id) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: m.alunos?.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: m.alunos?.telefone ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatBRL(m.valor) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-destructive/10 text-destructive", children: formatDate(m.data_vencimento) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => enviarIndividual.mutate(m), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4 mr-2" }),
              " Cobrar"
            ] }) })
          ] }, m.id)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs text-muted-foreground", children: [
          "Configure webhooks em ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/configuracoes", className: "underline", children: "Configurações" }),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-4" }),
        " Histórico de mensagens"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: historico.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sem mensagens ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: historico.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex items-center justify-between gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: h.alunos?.nome ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: h.conteudo })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: h.canal }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatDate(h.created_at?.slice(0, 10)) })
        ] })
      ] }, h.id)) }) })
    ] })
  ] });
}
export {
  CobrancasPage as component
};
