import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { C as Card, a as CardHeader, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, S as Select, d as SelectTrigger, e as SelectValue, f as SelectContent, g as SelectItem, h as DialogFooter } from "./select-CZT6g108.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as Plus, e as Pencil, T as Trash2 } from "../_libs/lucide-react.mjs";
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
function TurmasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const {
    data: turmas = [],
    isLoading
  } = useQuery({
    queryKey: ["turmas-full"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("turmas").select("*").order("nome");
      if (error) throw error;
      return data ?? [];
    }
  });
  const deleteTurma = useMutation({
    mutationFn: async (turma) => {
      const {
        error
      } = await supabase.rpc("excluir_turma_segura", {
        p_turma_id: turma.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Turma excluída com sucesso");
      qc.invalidateQueries({
        queryKey: ["turmas-full"]
      });
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });
  function handleDelete(turma) {
    const confirmar = window.confirm(`Tem certeza que deseja excluir a turma ${turma.nome}?

Essa ação vai remover a turma dos alunos vinculados a ela.`);
    if (!confirmar) return;
    deleteTurma.mutate(turma);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex justify-between items-end flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Turmas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Cursos, horários e professores." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Nova turma"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Carregando..." }) : turmas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Nenhuma turma ainda. Crie a primeira." }) : turmas.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex-row items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: t.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t.curso ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: t.status === "ativa" ? "bg-success/15 text-success" : "", children: t.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Dias:" }),
          " ",
          t.dias_semana ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Horário:" }),
          " ",
          t.horario ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Professor(a):" }),
          " ",
          t.professor ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(t);
            setOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4 mr-1" }),
            "Editar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "text-destructive hover:text-destructive", disabled: deleteTurma.isPending, onClick: () => handleDelete(t), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 mr-1" }),
            "Excluir"
          ] })
        ] })
      ] })
    ] }, t.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TurmaForm, { open, onOpenChange: setOpen, turma: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["turmas-full"]
    }) })
  ] });
}
function TurmaForm({
  open,
  onOpenChange,
  turma,
  onSaved
}) {
  const [form, setForm] = reactExports.useState({});
  reactExports.useMemo(() => {
    setForm(turma ?? {
      status: "ativa"
    });
  }, [turma]);
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome?.trim().toUpperCase() ?? "",
        curso: form.curso?.trim() || null,
        professor: form.professor?.trim() || null,
        dias_semana: form.dias_semana?.trim() || null,
        horario: form.horario?.trim() || null,
        status: form.status || "ativa"
      };
      if (turma) {
        const {
          error
        } = await supabase.from("turmas").update(payload).eq("id", turma.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("turmas").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Turma salva");
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display", children: turma ? "Editar turma" : "Nova turma" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nome ?? "", onChange: (e) => setForm({
          ...form,
          nome: e.target.value
        }), placeholder: "Ex: C415" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Curso" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.curso ?? "", onChange: (e) => setForm({
          ...form,
          curso: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Professor(a)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.professor ?? "", onChange: (e) => setForm({
          ...form,
          professor: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dias da semana" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Seg/Qua", value: form.dias_semana ?? "", onChange: (e) => setForm({
          ...form,
          dias_semana: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Horário" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "19h-21h", value: form.horario ?? "", onChange: (e) => setForm({
          ...form,
          horario: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "ativa", onValueChange: (v) => setForm({
          ...form,
          status: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ativa", children: "Ativa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "encerrada", children: "Encerrada" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending || !form.nome, children: "Salvar" })
    ] })
  ] }) });
}
export {
  TurmasPage as component
};
