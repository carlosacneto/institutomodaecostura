import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadWebhooks, s as saveWebhooks } from "./webhooks-BOZMFP8R.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/zod.mjs";
function ConfigPage() {
  const [cfg, setCfg] = reactExports.useState({
    importacao: "",
    cobrancaIndividual: "",
    cobrancaLote: ""
  });
  reactExports.useEffect(() => {
    setCfg(loadWebhooks());
  }, []);
  function salvar() {
    saveWebhooks(cfg);
    toast.success("Configurações salvas");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Configurações" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "URLs dos webhooks do n8n. Salvas apenas neste navegador." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-lg", children: "Webhooks n8n" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Importação do Google Sheets" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://n8n.../webhook/import", value: cfg.importacao, onChange: (e) => setCfg({
            ...cfg,
            importacao: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cobrança individual (WhatsApp)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://n8n.../webhook/cobranca", value: cfg.cobrancaIndividual, onChange: (e) => setCfg({
            ...cfg,
            cobrancaIndividual: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cobrança em lote (WhatsApp)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "https://n8n.../webhook/cobranca-lote", value: cfg.cobrancaLote, onChange: (e) => setCfg({
            ...cfg,
            cobrancaLote: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: salvar, children: "Salvar" }) })
      ] })
    ] })
  ] });
}
export {
  ConfigPage as component
};
