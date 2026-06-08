import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CSgZUmSl.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { C as Card, a as CardHeader, d as CardContent } from "./card-DQ5v2DYb.mjs";
import { S as Select, d as SelectTrigger, e as SelectValue, f as SelectContent, g as SelectItem, D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, h as DialogFooter } from "./select-CZT6g108.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-RrXKMtST.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadWebhooks, c as callWebhook } from "./webhooks-BOZMFP8R.mjs";
import { f as formatBRL, t as today } from "./format-CYzaeKqH.mjs";
import { P as Plus, f as Search, e as Pencil, R as Receipt, k as Send } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/tailwind-merge.mjs";
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
import "../_libs/zod.mjs";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function normalizarMensalidade(valor) {
  if (valor == null) return 0;
  return valor >= 1e3 ? valor / 100 : valor;
}
function AlunosPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = reactExports.useState("");
  const [filtroTurma, setFiltroTurma] = reactExports.useState("all");
  const [filtroStatus, setFiltroStatus] = reactExports.useState("all");
  const [editing, setEditing] = reactExports.useState(null);
  const [openForm, setOpenForm] = reactExports.useState(false);
  const [openPay, setOpenPay] = reactExports.useState(null);
  const {
    data: alunos = [],
    isLoading
  } = useQuery({
    queryKey: ["alunos"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("alunos").select(`
          *,
          aluno_turmas (
            turma_id,
            turmas (
              id,
              nome
            )
          )
        `).order("nome");
      if (error) throw error;
      return data;
    }
  });
  const {
    data: turmas = []
  } = useQuery({
    queryKey: ["turmas"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("turmas").select("id,nome").order("nome");
      if (error) throw error;
      return data;
    }
  });
  const filtrados = reactExports.useMemo(() => {
    return alunos.filter((a) => {
      const nome = a.nome ?? "";
      const email = a.email ?? "";
      const telefone = a.telefone ?? "";
      const cpf = a.cpf ?? "";
      if (busca && !nome.toLowerCase().includes(busca.toLowerCase()) && !email.toLowerCase().includes(busca.toLowerCase()) && !telefone.toLowerCase().includes(busca.toLowerCase()) && !cpf.toLowerCase().includes(busca.toLowerCase())) {
        return false;
      }
      if (filtroTurma !== "all") {
        const temTurma = a.aluno_turmas?.some((at) => at.turma_id === filtroTurma);
        if (!temTurma) return false;
      }
      if (filtroStatus !== "all" && a.status !== filtroStatus) return false;
      return true;
    });
  }, [alunos, busca, filtroTurma, filtroStatus]);
  const cobrar = useMutation({
    mutationFn: async (a) => {
      const url = loadWebhooks().cobrancaIndividual;
      await callWebhook(url, {
        aluno: {
          id: a.id,
          nome: a.nome,
          telefone: a.telefone,
          email: a.email
        }
      });
      await supabase.from("mensagens").insert({
        aluno_id: a.id,
        tipo: "cobranca",
        canal: "whatsapp",
        conteudo: `Cobrança enviada para ${a.nome}`,
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: "Alunos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Gerencie matrículas, contatos e cobranças." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setOpenForm(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
        "Novo aluno"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[1fr_200px_180px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "pl-9", placeholder: "Buscar por nome, e-mail, telefone ou CPF...", value: busca, onChange: (e) => setBusca(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filtroTurma, onValueChange: setFiltroTurma, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Turma" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todas as turmas" }),
            turmas.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.nome }, t.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filtroStatus, onValueChange: setFiltroStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Todos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ativo", children: "Ativo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inativo", children: "Inativo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "trancado", children: "Trancado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "aberto", children: "Aberto" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contato" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "CPF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Turmas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mensalidade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Venc." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Ações" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground", children: "Carregando..." }) }) : filtrados.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center py-8 text-muted-foreground", children: "Nenhum aluno encontrado." }) }) : filtrados.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: a.nome }),
            a.id_planilha && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "ID: ",
              a.id_planilha
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: a.email ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: a.telefone ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: a.cpf ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: a.aluno_turmas && a.aluno_turmas.length > 0 ? a.aluno_turmas.map((at) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: at.turmas?.nome ?? "Turma" }, at.turma_id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: a.valor_mensalidade != null ? formatBRL(normalizarMensalidade(a.valor_mensalidade)) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: a.dia_vencimento ? `Dia ${a.dia_vencimento}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Editar", onClick: () => {
              setEditing(a);
              setOpenForm(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Registrar pagamento", onClick: () => setOpenPay(a), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Enviar cobrança WhatsApp", onClick: () => cobrar.mutate(a), disabled: cobrar.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" }) })
          ] }) })
        ] }, a.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlunoForm, { open: openForm, onOpenChange: setOpenForm, aluno: editing, turmas }),
    openPay && /* @__PURE__ */ jsxRuntimeExports.jsx(PagamentoDialog, { aluno: openPay, onClose: () => setOpenPay(null) })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    ativo: "bg-success/15 text-success",
    inativo: "bg-muted text-muted-foreground",
    trancado: "bg-warning/20 text-warning-foreground",
    aberto: "bg-warning/20 text-warning-foreground"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: map[status] ?? "", children: status });
}
function AlunoForm({
  open,
  onOpenChange,
  aluno,
  turmas
}) {
  const qc = useQueryClient();
  const isEdit = !!aluno;
  const [form, setForm] = reactExports.useState({});
  const [turmasSelecionadas, setTurmasSelecionadas] = reactExports.useState([]);
  reactExports.useEffect(() => {
    setForm(aluno ?? {
      id_planilha: null,
      nome: "",
      telefone: null,
      email: null,
      cpf: null,
      endereco: null,
      data_nascimento: null,
      dia_vencimento: null,
      status: "ativo",
      data_matricula: today(),
      valor_mensalidade: null,
      observacoes: null
    });
    setTurmasSelecionadas(aluno?.aluno_turmas?.map((at) => at.turma_id) ?? []);
  }, [aluno, open]);
  function toggleTurma(turmaId) {
    setTurmasSelecionadas((prev) => {
      if (prev.includes(turmaId)) {
        return prev.filter((id) => id !== turmaId);
      }
      return [...prev, turmaId];
    });
  }
  function parseNumero(valor) {
    if (!valor) return null;
    const limpo = valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
    const numero = Number(limpo);
    return Number.isNaN(numero) ? null : numero;
  }
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        id_planilha: form.id_planilha || null,
        nome: form.nome || null,
        telefone: form.telefone || null,
        email: form.email || null,
        cpf: form.cpf || null,
        endereco: form.endereco || null,
        data_nascimento: form.data_nascimento || null,
        dia_vencimento: form.dia_vencimento ?? null,
        status: form.status || "ativo",
        data_matricula: form.data_matricula || null,
        observacoes: form.observacoes || null,
        valor_mensalidade: form.valor_mensalidade ?? null,
        turma_id: turmasSelecionadas[0] ?? null
      };
      let alunoId = aluno?.id;
      if (isEdit) {
        const {
          error
        } = await supabase.from("alunos").update(payload).eq("id", aluno.id);
        if (error) throw error;
      } else {
        const {
          data,
          error
        } = await supabase.from("alunos").insert(payload).select("id").single();
        if (error) throw error;
        alunoId = data.id;
      }
      if (!alunoId) {
        throw new Error("Não foi possível identificar o aluno salvo.");
      }
      const {
        error: deleteError
      } = await supabase.from("aluno_turmas").delete().eq("aluno_id", alunoId);
      if (deleteError) throw deleteError;
      if (turmasSelecionadas.length > 0) {
        const vinculos = turmasSelecionadas.map((turmaId) => ({
          aluno_id: alunoId,
          turma_id: turmaId
        }));
        const {
          error: insertTurmasError
        } = await supabase.from("aluno_turmas").insert(vinculos);
        if (insertTurmasError) throw insertTurmasError;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Aluno atualizado" : "Aluno criado");
      qc.invalidateQueries({
        queryKey: ["alunos"]
      });
      qc.invalidateQueries({
        queryKey: ["dashboard"]
      });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display", children: isEdit ? "Editar aluno" : "Novo aluno" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ID da planilha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.id_planilha ?? "", onChange: (e) => setForm({
          ...form,
          id_planilha: e.target.value
        }), placeholder: "Ex: 714" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CPF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cpf ?? "", onChange: (e) => setForm({
          ...form,
          cpf: e.target.value
        }), placeholder: "000.000.000-00" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nome ?? "", onChange: (e) => setForm({
          ...form,
          nome: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Telefone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.telefone ?? "", onChange: (e) => setForm({
          ...form,
          telefone: e.target.value
        }), placeholder: "(11) 9..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email ?? "", onChange: (e) => setForm({
          ...form,
          email: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data de nascimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.data_nascimento ?? "", onChange: (e) => setForm({
          ...form,
          data_nascimento: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dia de vencimento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "31", value: form.dia_vencimento ?? "", onChange: (e) => setForm({
          ...form,
          dia_vencimento: e.target.value === "" ? null : Number(e.target.value)
        }), placeholder: "Ex: 10" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Endereço" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.endereco ?? "", onChange: (e) => setForm({
          ...form,
          endereco: e.target.value
        }), placeholder: "Rua, número, bairro, cidade" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Turmas" }),
        turmas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhuma turma cadastrada." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 rounded-md border p-3", children: turmas.map((turma) => {
          const selecionada = turmasSelecionadas.includes(turma.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: selecionada ? "default" : "outline", onClick: () => toggleTurma(turma.id), children: turma.nome }, turma.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Clique em uma ou mais turmas para vincular ao aluno." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor da mensalidade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", placeholder: "Ex: 299,99", value: form.valor_mensalidade ?? "", onChange: (e) => setForm({
          ...form,
          valor_mensalidade: parseNumero(e.target.value)
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "ativo", onValueChange: (v) => setForm({
          ...form,
          status: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ativo", children: "Ativo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inativo", children: "Inativo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "trancado", children: "Trancado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "aberto", children: "Aberto" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data de matrícula" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.data_matricula ?? "", onChange: (e) => setForm({
          ...form,
          data_matricula: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.observacoes ?? "", onChange: (e) => setForm({
          ...form,
          observacoes: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending || !form.nome, children: "Salvar" })
    ] })
  ] }) });
}
function PagamentoDialog({
  aluno,
  onClose
}) {
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState({
    valor_pago: "",
    data_pagamento: today(),
    forma_pagamento: "pix",
    observacoes: "",
    mensalidade_id: ""
  });
  const {
    data: pendentes = []
  } = useQuery({
    queryKey: ["mens-pend", aluno.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("mensalidades").select("id,valor,data_vencimento").eq("aluno_id", aluno.id).neq("status", "pago").order("data_vencimento");
      if (error) throw error;
      return data ?? [];
    }
  });
  const save = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("pagamentos").insert({
        aluno_id: aluno.id,
        mensalidade_id: form.mensalidade_id || null,
        valor_pago: Number(form.valor_pago),
        data_pagamento: form.data_pagamento,
        forma_pagamento: form.forma_pagamento,
        observacoes: form.observacoes
      });
      if (error) throw error;
      if (form.mensalidade_id) {
        const {
          error: mensalidadeError
        } = await supabase.from("mensalidades").update({
          status: "pago",
          data_pagamento: form.data_pagamento,
          forma_pagamento: form.forma_pagamento
        }).eq("id", form.mensalidade_id);
        if (mensalidadeError) throw mensalidadeError;
      }
    },
    onSuccess: () => {
      toast.success("Pagamento registrado");
      qc.invalidateQueries();
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display", children: [
      "Registrar pagamento — ",
      aluno.nome
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mensalidade opcional" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.mensalidade_id || "none", onValueChange: (v) => {
          const m = pendentes.find((p) => p.id === v);
          setForm({
            ...form,
            mensalidade_id: v === "none" ? "" : v,
            valor_pago: m ? String(m.valor) : form.valor_pago
          });
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Nenhuma" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "Avulso sem mensalidade" }),
            pendentes.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
              formatBRL(p.valor),
              " — venc. ",
              p.data_vencimento
            ] }, p.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valor pago" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.valor_pago, onChange: (e) => setForm({
          ...form,
          valor_pago: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.data_pagamento, onChange: (e) => setForm({
          ...form,
          data_pagamento: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Forma de pagamento" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.forma_pagamento, onValueChange: (v) => setForm({
          ...form,
          forma_pagamento: v
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pix", children: "PIX" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dinheiro", children: "Dinheiro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cartao", children: "Cartão" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transferencia", children: "Transferência" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "boleto", children: "Boleto" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observações" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.observacoes, onChange: (e) => setForm({
          ...form,
          observacoes: e.target.value
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending || !form.valor_pago, children: "Registrar" })
    ] })
  ] }) });
}
export {
  AlunosPage as component
};
