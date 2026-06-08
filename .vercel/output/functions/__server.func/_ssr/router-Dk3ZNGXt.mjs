import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { Q as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const appCss = "/assets/styles-79cySTSm.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Página não encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "A página que você procura não existe." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Voltar ao início" }) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Algo deu errado" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Tente novamente ou volte para o início." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        router2.invalidate();
        reset();
      }, className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Tentar novamente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent", children: "Início" })
    ] })
  ] }) });
}
const Route$e = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Instituto Moda e Costura" },
      { name: "description", content: "Dashboard para gestão de alunos, turmas, mensalidades e cobranças da escola de costura." },
      { property: "og:title", content: "Instituto Moda e Costura" },
      { name: "twitter:title", content: "Instituto Moda e Costura" },
      { property: "og:description", content: "Dashboard para gestão de alunos, turmas, mensalidades e cobranças da escola de costura." },
      { name: "twitter:description", content: "Dashboard para gestão de alunos, turmas, mensalidades e cobranças da escola de costura." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f0d9207d-1f09-4500-8774-adcc598f4af2/id-preview-4223fea1--69506387-9cdd-47a5-b985-b44735320965.lovable.app-1780667089183.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f0d9207d-1f09-4500-8774-adcc598f4af2/id-preview-4223fea1--69506387-9cdd-47a5-b985-b44735320965.lovable.app-1780667089183.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "pt-BR", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$e.useRouteContext();
  const router2 = useRouter();
  reactExports.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router2.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router2, queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] });
}
const $$splitComponentImporter$c = () => import("./auth-BCZj3452.mjs");
const Route$d = createFileRoute("/auth")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./route-dhRg7aLO.mjs");
const Route$c = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data
    } = await supabase.auth.getUser();
    if (!data.user) throw redirect({
      to: "/auth"
    });
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const Route$b = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  }
});
const $$splitComponentImporter$a = () => import("./turmas-CgP0DVRE.mjs");
const Route$a = createFileRoute("/_authenticated/turmas")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./pagamentos-DHpcTI40.mjs");
const Route$9 = createFileRoute("/_authenticated/pagamentos")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./mensalidades-B9koSsaF.mjs");
const Route$8 = createFileRoute("/_authenticated/mensalidades")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./importacao-Ds6ejLGZ.mjs");
const Route$7 = createFileRoute("/_authenticated/importacao")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./dashboard-WFhVLRK_.mjs");
const Route$6 = createFileRoute("/_authenticated/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./configuracoes-DXkXSH05.mjs");
const Route$5 = createFileRoute("/_authenticated/configuracoes")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./cobrancas-CO3CSKoW.mjs");
const Route$4 = createFileRoute("/_authenticated/cobrancas")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./alunos-CyoaTGJ9.mjs");
const Route$3 = createFileRoute("/_authenticated/alunos")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./contratos.index-CxTrUh3n.mjs");
const Route$2 = createFileRoute("/_authenticated/contratos/")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./turmas._turmaId-CXJoZ5V3.mjs");
const Route$1 = createFileRoute("/_authenticated/turmas/$turmaId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./contratos._alunoId-B8ozfmUx.mjs");
const Route = createFileRoute("/_authenticated/contratos/$alunoId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AuthRoute = Route$d.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$e
});
const AuthenticatedRouteRoute = Route$c.update({
  id: "/_authenticated",
  getParentRoute: () => Route$e
});
const IndexRoute = Route$b.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$e
});
const AuthenticatedTurmasRoute = Route$a.update({
  id: "/turmas",
  path: "/turmas",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedPagamentosRoute = Route$9.update({
  id: "/pagamentos",
  path: "/pagamentos",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMensalidadesRoute = Route$8.update({
  id: "/mensalidades",
  path: "/mensalidades",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedImportacaoRoute = Route$7.update({
  id: "/importacao",
  path: "/importacao",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$6.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedConfiguracoesRoute = Route$5.update({
  id: "/configuracoes",
  path: "/configuracoes",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCobrancasRoute = Route$4.update({
  id: "/cobrancas",
  path: "/cobrancas",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAlunosRoute = Route$3.update({
  id: "/alunos",
  path: "/alunos",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedContratosIndexRoute = Route$2.update({
  id: "/contratos/",
  path: "/contratos/",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedTurmasTurmaIdRoute = Route$1.update({
  id: "/$turmaId",
  path: "/$turmaId",
  getParentRoute: () => AuthenticatedTurmasRoute
});
const AuthenticatedContratosAlunoIdRoute = Route.update({
  id: "/contratos/$alunoId",
  path: "/contratos/$alunoId",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedTurmasRouteChildren = {
  AuthenticatedTurmasTurmaIdRoute
};
const AuthenticatedTurmasRouteWithChildren = AuthenticatedTurmasRoute._addFileChildren(AuthenticatedTurmasRouteChildren);
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAlunosRoute,
  AuthenticatedCobrancasRoute,
  AuthenticatedConfiguracoesRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedImportacaoRoute,
  AuthenticatedMensalidadesRoute,
  AuthenticatedPagamentosRoute,
  AuthenticatedTurmasRoute: AuthenticatedTurmasRouteWithChildren,
  AuthenticatedContratosAlunoIdRoute,
  AuthenticatedContratosIndexRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute
};
const routeTree = Route$e._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  Route as a,
  router as r
};
