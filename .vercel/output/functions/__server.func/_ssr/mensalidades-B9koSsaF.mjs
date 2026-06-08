import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { C as Card, a as CardHeader, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, S as Select, d as SelectTrigger, e as SelectValue, f as SelectContent, g as SelectItem, h as DialogFooter } from "./select-CZT6g108.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as today, f as formatBRL, a as formatDate } from "./format-CYzaeKqH.mjs";
import { P as Plus, f as Search } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
function MensalidadesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [filtro, setFiltro] = reactExports.useState("all");
  const [busca, setBusca] = reactExports.useState("");
  const {
    data = [],
    isLoading
  } = useQuery({
    queryKey: ["mensalidades"],
    queryFn: async () => {
      const {
        data: data2,
        error
      } = await supabase.from("mensalidades").select("*").order("data_vencimento", {
        ascending: false
      });
      if (error) throw error;
      return data2 ?? [];
    }
  });
  const filtradas = reactExports.useMemo(() => {
    const hoje = today();
    const termo = busca.trim().toLowerCase();
    return data.filter((m) => {
      const status = m.status ?? "pendente";
      const vencimento = m.data_vencimento ?? "";
      const passaFiltroStatus = filtro === "all" || filtro === "pago" && status === "pago" || filtro === "pendente" && status === "pendente" && vencimento >= hoje || filtro === "vencida" && status !== "pago" && vencimento < hoje;
      if (!passaFiltroStatus) return false;
      if (!termo) return true;
      const textoBusca = [m.nome_aluno, m.telefone, m.turma, m.status, m.valor, m.data_vencimento, m.data_pagamento, m.observacoes].filter(Boolean).join(" ").toLowerCase();
      return textoBusca.includes(termo);
    });
  }, [data, filtro, busca]);
  const marcarComoPaga = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("mensalidades").update({
        status: "pago",
        data_pagamento: today()
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensalidade marcada como paga");
      qc.invalidateQueries({
        queryKey: ["mensalidades"]
      });
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });
  const desfazerPagamento = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("mensalidades").update({
        status: "pendente",
        data_pagamento: null
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pagamento desfeito");
      qc.invalidateQueries({
        queryKey: ["mensalidades"]
      });
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });
  function handleDesfazerPagamento(mensalidade) {
    const confirmar = window.confirm(`Deseja desfazer o pagamento de ${mensalidade.nome_aluno ?? "este aluno"}?`);
    if (!confirmar) return;
    desfazerPagamento.mutate(mensalidade.id);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex justify-between flex-wrap gap-4 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Mensalidades" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Vencimentos, valores e status." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Nova mensalidade"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: busca, onChange: (e) => setBusca(e.target.value), placeholder: "Buscar por nome, telefone, turma, status ou valor...", className: "pl-10" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 flex-wrap", children: [{
          v: "all",
          l: "Todas"
        }, {
          v: "pago",
          l: "Pagas"
        }, {
          v: "pendente",
          l: "Pendentes"
        }, {
          v: "vencida",
          l: "Vencidas"
        }].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: filtro === o.v ? "default" : "outline", onClick: () => setFiltro(o.v), children: o.l }, o.v)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Aluno" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Telefone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Turma" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Valor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Vencimento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "Carregando..." }) }) : filtradas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "Nenhuma mensalidade encontrada." }) }) : filtradas.map((m) => {
          const status = m.status ?? "pendente";
          const vencimento = m.data_vencimento ?? "";
          const vencida = status !== "pago" && vencimento < today();
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: m.nome_aluno ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: m.telefone ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: m.turma ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatBRL(Number(m.valor ?? 0)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: m.data_vencimento ? formatDate(m.data_vencimento) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: status === "pago" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-success/15 text-success", children: "pago" }) : vencida ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-destructive/15 text-destructive", children: "vencida" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: status === "pago" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDesfazerPagamento(m), disabled: desfazerPagamento.isPending, children: "Desfazer pagamento" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => marcarComoPaga.mutate(m.id), disabled: marcarComoPaga.isPending, children: "Marcar como paga" }) })
          ] }, m.id);
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MensalidadeForm, { open, onOpenChange: setOpen })
  ] });
}
function MensalidadeForm({
  open,
  onOpenChange
}) {
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState({
    aluno_id: "",
    nome_aluno: "",
    telefone: "",
    turma: "",
    valor: "",
    data_vencimento: today(),
    status: "pendente",
    observacoes: ""
  });
  const {
    data: alunos = []
  } = useQuery({
    queryKey: ["alunos-min-mensalidades"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("alunos").select("id,nome,telefone,valor_mensalidade,dia_vencimento").order("nome");
      if (error) throw error;
      return data ?? [];
    }
  });
  const save = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("mensalidades").insert({
        aluno_id: form.aluno_id,
        nome_aluno: form.nome_aluno || null,
        telefone: form.telefone || null,
        turma: form.turma || null,
        valor: Number(form.valor),
        data_vencimento: form.data_vencimento,
        status: form.status,
        observacoes: form.observacoes || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensalidade criada");
      qc.invalidateQueries({
        queryKey: ["mensalidades"]
      });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  function selecionarAluno(alunoId) {
    const aluno = alunos.find((a) => a.id === alunoId);
    const hoje = /* @__PURE__ */ new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const dia = Math.min(Number(aluno?.dia_vencimento ?? 10), 28);
    const vencimento = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    setForm({
      ...form,
      aluno_id: alunoId,
      nome_aluno: aluno?.nome ?? "",
      telefone: aluno?.telefone ?? "",
      valor: String(aluno?.valor_mensalidade ?? ""),
      data_vencimento: vencimento
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display", children: "Nova mensalidade" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Aluno" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.aluno_id, onValueChange: selecionarAluno, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecione" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: alunos.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.nome }, a.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Telefone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.telefone, onChange: (e) => setForm({
          ...form,
          telefone: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Turma" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.turma, onChange: (e) => setForm({
          ...form,
          turma: e.target.value
        }), placeholder: "Ex: C210 / C315" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor (R$)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.valor, onChange: (e) => setForm({
          ...form,
          valor: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vencimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.data_vencimento, onChange: (e) => setForm({
          ...form,
          data_vencimento: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm({
          ...form,
          status: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pendente", children: "Pendente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pago", children: "Pago" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: !form.aluno_id || !form.valor || save.isPending, children: "Salvar" })
    ] })
  ] }) });
}
export {
  MensalidadesPage as component
};
