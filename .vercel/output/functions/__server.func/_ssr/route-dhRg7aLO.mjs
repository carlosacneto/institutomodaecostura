import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useRouterState, L as Link, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Scissors, L as LayoutDashboard, U as Users, F as FileText, G as GraduationCap, R as Receipt, C as CreditCard, a as Upload, M as MessageCircle, b as Settings, c as LogOut, d as Menu } from "../_libs/lucide-react.mjs";
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
import "../_libs/tailwind-merge.mjs";
const NAV = [{
  to: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  to: "/alunos",
  label: "Alunos",
  icon: Users
}, {
  to: "/contratos",
  label: "Contratos",
  icon: FileText
}, {
  to: "/turmas",
  label: "Turmas",
  icon: GraduationCap
}, {
  to: "/mensalidades",
  label: "Mensalidades",
  icon: Receipt
}, {
  to: "/pagamentos",
  label: "Pagamentos",
  icon: CreditCard
}, {
  to: "/importacao",
  label: "Importação",
  icon: Upload
}, {
  to: "/cobrancas",
  label: "Cobranças",
  icon: MessageCircle
}, {
  to: "/configuracoes",
  label: "Configurações",
  icon: Settings
}];
function AuthenticatedLayout() {
  const navigate = useNavigate();
  const {
    location
  } = useRouterState();
  const [email, setEmail] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => setEmail(data.user?.email ?? null));
  }, []);
  reactExports.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  async function logout() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({
      to: "/auth",
      replace: true
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: cn("fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"), style: {
      height: "100dvh",
      top: 0
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-base", children: "Instituto Moda e Costura" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Escola de Costura" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4 space-y-0.5", children: NAV.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: item.to, className: "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground", activeProps: {
          className: "bg-primary text-primary-foreground hover:bg-primary"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4 shrink-0" }),
          item.label
        ] }, item.to);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-sidebar-border p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs text-muted-foreground truncate", children: email }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "w-full justify-start", onClick: logout, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4 mr-2" }),
          " Sair"
        ] })
      ] })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/30 z-30 lg:hidden", onClick: () => setOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "lg:hidden sticky top-0 z-20 h-14 px-4 flex items-center justify-between bg-background/80 backdrop-blur border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(true), "aria-label": "Menu", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-display font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "size-4 text-primary" }),
          " Instituto Moda e Costura"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] });
}
export {
  AuthenticatedLayout as component
};
