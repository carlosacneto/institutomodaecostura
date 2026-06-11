import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Columns3,
  ExternalLink,
  MessageSquare,
  Phone,
  Search,
  Send,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

const WEBHOOK_ENVIAR_WHATSAPP =
  "https://thirstygull-n8n.cloudfy.live/webhook/enviar-whatsapp-crm";

type Lead = {
  id: string;
  nome: string | null;
  telefone: string;
  email: string | null;
  origem: string | null;
  ultima_mensagem: string | null;
  data_ultima_mensagem: string | null;
  intencao: string | null;
  prioridade: string | null;
  resumo_ia: string | null;
  historico: string | null;
  status: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  visita_agendada_em: string | null;
  observacao_visita: string | null;
  proxima_acao: string | null;
  convertido_aluno: boolean | null;
  aluno_id: string | null;
  convertido_em: string | null;
};

type LeadTarefa = {
  id: string;
  lead_id: string;
  tipo: string | null;
  titulo: string | null;
  descricao: string | null;
  status: string | null;
  data_agendada: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type LeadInteracao = {
  id: string;
  lead_id: string;
  canal: string | null;
  direcao: string | null;
  mensagem: string | null;
  origem: string | null;
  created_at: string | null;
};

type Turma = {
  id: string;
  nome: string;
  curso: string | null;
  professor: string | null;
  dias_semana: string | null;
  horario: string | null;
  status: string | null;
  created_at: string | null;
};

type KanbanColumnId =
  | "novo"
  | "atendimento"
  | "visita"
  | "matriculado"
  | "sem_resposta"
  | "perdido";

type StatusLeadCanonico =
  | "novo"
  | "em_atendimento"
  | "visita_agendada"
  | "matriculado"
  | "sem_resposta"
  | "perdido";

type KanbanColumn = {
  id: KanbanColumnId;
  title: string;
  description: string;
  icon: typeof UserPlus;
};

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "novo",
    title: "Novo Lead",
    description: "Leads recém-chegados",
    icon: UserPlus,
  },
  {
    id: "atendimento",
    title: "Em atendimento",
    description: "Conversas em andamento",
    icon: MessageSquare,
  },
  {
    id: "visita",
    title: "Agendou visita",
    description: "Leads com visita marcada",
    icon: CalendarCheck,
  },
  {
    id: "matriculado",
    title: "Matriculado",
    description: "Leads convertidos em alunos",
    icon: UserCheck,
  },
  {
    id: "sem_resposta",
    title: "Sem resposta",
    description: "Aguardando retorno",
    icon: CalendarClock,
  },
  {
    id: "perdido",
    title: "Perdido",
    description: "Leads encerrados",
    icon: XCircle,
  },
];

const LARGURA_INICIAL_COLUNAS: Record<KanbanColumnId, number> = {
  novo: 280,
  atendimento: 280,
  visita: 280,
  matriculado: 280,
  sem_resposta: 280,
  perdido: 280,
};

function normalizarTexto(valor: string | null | undefined) {
  return (valor ?? "")
    .toString()
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalizarStatusLead(
  status: string | null | undefined
): StatusLeadCanonico {
  const valor = normalizarTexto(status);

  if (!valor || valor.includes("novo")) return "novo";

  if (valor.includes("matriculado") || valor.includes("convertido")) {
    return "matriculado";
  }

  if (valor.includes("perdido") || valor.includes("cancel")) {
    return "perdido";
  }

  if (valor.includes("sem resposta") || valor.includes("sem retorno")) {
    return "sem_resposta";
  }

  if (valor.includes("visita") || valor.includes("agend")) {
    return "visita_agendada";
  }

  if (valor.includes("atendimento")) {
    return "em_atendimento";
  }

  return "em_atendimento";
}

function formatStatusLead(status: string | null) {
  const statusCanonico = canonicalizarStatusLead(status);

  const map: Record<StatusLeadCanonico, string> = {
    novo: "Novo Lead",
    em_atendimento: "Em atendimento",
    visita_agendada: "Visita agendada",
    matriculado: "Matriculado",
    sem_resposta: "Sem resposta",
    perdido: "Perdido",
  };

  return map[statusCanonico];
}

function getPrioridadeClass(prioridade: string | null) {
  const valor = normalizarTexto(prioridade);

  if (valor === "alta") return "bg-destructive/15 text-destructive";
  if (valor === "media") return "bg-warning/15 text-warning";

  return "bg-muted text-muted-foreground";
}

function getStatusClass(status: string | null) {
  const valor = canonicalizarStatusLead(status);

  if (valor === "novo") return "bg-primary/15 text-primary";
  if (valor === "em_atendimento") return "bg-warning/15 text-warning";
  if (valor === "visita_agendada") return "bg-blue-100 text-blue-700";
  if (valor === "matriculado") return "bg-success/15 text-success";
  if (valor === "sem_resposta") return "bg-slate-100 text-slate-700";
  if (valor === "perdido") return "bg-destructive/15 text-destructive";

  return "bg-muted text-muted-foreground";
}

function getTarefaStatusClass(status: string | null) {
  const valor = normalizarTexto(status);

  if (valor.includes("pendente")) return "bg-warning/15 text-warning";
  if (valor.includes("conclu")) return "bg-success/15 text-success";

  return "bg-muted text-muted-foreground";
}

function getColumnClass(columnId: KanbanColumnId) {
  const map: Record<KanbanColumnId, string> = {
    novo: "border-primary/30 bg-primary/5",
    atendimento: "border-warning/30 bg-warning/5",
    visita: "border-blue-300 bg-blue-50/70",
    matriculado: "border-green-300 bg-green-50/70",
    sem_resposta: "border-slate-300 bg-slate-50/70",
    perdido: "border-destructive/30 bg-destructive/5",
  };

  return map[columnId];
}

function getColumnBadgeClass(columnId: KanbanColumnId) {
  const map: Record<KanbanColumnId, string> = {
    novo: "bg-primary/15 text-primary",
    atendimento: "bg-warning/15 text-warning",
    visita: "bg-blue-100 text-blue-700",
    matriculado: "bg-green-100 text-green-700",
    sem_resposta: "bg-slate-100 text-slate-700",
    perdido: "bg-destructive/15 text-destructive",
  };

  return map[columnId];
}

function getLeadColumnId(lead: Lead): KanbanColumnId {
  const status = canonicalizarStatusLead(lead.status);

  if (lead.convertido_aluno || status === "matriculado") return "matriculado";
  if (status === "perdido") return "perdido";
  if (status === "sem_resposta") return "sem_resposta";
  if (status === "em_atendimento") return "atendimento";
  if (status === "visita_agendada") return "visita";

  if (lead.visita_agendada_em && !lead.status) return "visita";

  return "novo";
}

function formatDateTimeBR(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatHistorico(historico: string | null) {
  if (!historico) return [];

  return historico
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function montarLinkWhatsApp(lead: Lead) {
  const telefoneLimpo = String(lead.telefone || "").replace(/\D/g, "");

  const telefoneComPais = telefoneLimpo.startsWith("55")
    ? telefoneLimpo
    : `55${telefoneLimpo}`;

  const texto = encodeURIComponent(
    `Olá ${lead.nome || ""}, tudo bem? Vi que você tem interesse no Instituto Moda e Costura. Posso te passar as informações?`
  );

  return `https://wa.me/${telefoneComPais}?text=${texto}`;
}

function converterValorMensalidade(valor: string) {
  const valorLimpo = valor
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  if (!valorLimpo) return null;

  const numero = Number(valorLimpo);

  return Number.isFinite(numero) ? numero : null;
}

function getReferenciaMesAno(data: Date) {
  const mes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(data);

  const mesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);

  return `${mesFormatado}/${data.getFullYear()}`;
}

function getDataVencimentoMensalidade(diaVencimento: number) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
  const diaSeguro = Math.min(Math.max(diaVencimento, 1), ultimoDiaMes);

  return new Date(ano, mes, diaSeguro).toISOString().slice(0, 10);
}

function getDataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function LeadsPage() {
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState("");
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);
  const [mensagemWhatsApp, setMensagemWhatsApp] = useState("");
  const scrollKanbanTopoRef = useRef<HTMLDivElement | null>(null);
  const scrollKanbanBaixoRef = useRef<HTMLDivElement | null>(null);
  const [leadsPainel, setLeadsPainel] = useState<Lead[]>([]);
  const [largurasColunas, setLargurasColunas] = useState<
    Record<KanbanColumnId, number>
  >(LARGURA_INICIAL_COLUNAS);

  const [modalVisitaAberto, setModalVisitaAberto] = useState(false);
  const [dataVisita, setDataVisita] = useState("");
  const [observacaoVisita, setObservacaoVisita] = useState("");

  const [modalConversaoAberto, setModalConversaoAberto] = useState(false);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<string[]>([]);
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [valorMatricula, setValorMatricula] = useState("");
  const [diaVencimento, setDiaVencimento] = useState("");
  const [observacoesAluno, setObservacoesAluno] = useState("");

  const supabaseAny = supabase as any;

  const {
    data: leadsBanco = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("leads")
        .select("*")
        .order("atualizado_em", { ascending: false });

      if (error) throw error;

      return (data ?? []) as Lead[];
    },
  });

  useEffect(() => {
    setLeadsPainel(leadsBanco);
  }, [leadsBanco]);

  function atualizarLeadNoPainel(leadId: string, alteracoes: Partial<Lead>) {
    setLeadsPainel((leadsAtuais) => {
      const novaLista = leadsAtuais.map((lead) => {
        if (lead.id !== leadId) return lead;

        return {
          ...lead,
          ...alteracoes,
        };
      });

      return [...novaLista].sort((a, b) => {
        const dataA = new Date(a.atualizado_em ?? a.criado_em ?? 0).getTime();
        const dataB = new Date(b.atualizado_em ?? b.criado_em ?? 0).getTime();

        return dataB - dataA;
      });
    });

    setLeadSelecionado((leadAtual) => {
      if (!leadAtual || leadAtual.id !== leadId) return leadAtual;

      return {
        ...leadAtual,
        ...alteracoes,
      };
    });
  }

  function atualizarLeadNoCache(leadAtualizado: Lead) {
    queryClient.setQueryData<Lead[]>(["leads"], (leadsAtuais) => {
      if (!leadsAtuais) return leadsAtuais;

      return leadsAtuais.map((lead) =>
        lead.id === leadAtualizado.id ? leadAtualizado : lead
      );
    });
  }

  function iniciarResizeColuna(
    columnId: KanbanColumnId,
    event: ReactMouseEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    const inicioX = event.clientX;
    const larguraInicial = largurasColunas[columnId];

    function aoMover(mouseEvent: MouseEvent) {
      const diferenca = mouseEvent.clientX - inicioX;
      const novaLargura = Math.min(
        560,
        Math.max(220, larguraInicial + diferenca)
      );

      setLargurasColunas((largurasAtuais) => ({
        ...largurasAtuais,
        [columnId]: novaLargura,
      }));
    }

    function aoSoltar() {
      document.removeEventListener("mousemove", aoMover);
      document.removeEventListener("mouseup", aoSoltar);
    }

    document.addEventListener("mousemove", aoMover);
    document.addEventListener("mouseup", aoSoltar);
  }
    const {
    data: turmas = [],
    isLoading: carregandoTurmas,
    isError: erroTurmas,
  } = useQuery({
    queryKey: ["turmas"],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("turmas")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;

      return (data ?? []) as Turma[];
    },
  });

  const {
    data: tarefasLead = [],
    isLoading: carregandoTarefas,
    isError: erroTarefas,
  } = useQuery({
    queryKey: ["lead_tarefas", leadSelecionado?.id],
    enabled: !!leadSelecionado?.id,
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("lead_tarefas")
        .select("*")
        .eq("lead_id", leadSelecionado?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as LeadTarefa[];
    },
  });

  const {
    data: interacoesLead = [],
    isLoading: carregandoInteracoes,
    isError: erroInteracoes,
  } = useQuery({
    queryKey: ["lead_interacoes", leadSelecionado?.id],
    enabled: !!leadSelecionado?.id,
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("lead_interacoes")
        .select("*")
        .eq("lead_id", leadSelecionado?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as LeadInteracao[];
    },
  });

  const enviarWhatsAppMutation = useMutation({
    mutationFn: async () => {
      if (!leadSelecionado) {
        throw new Error("Nenhum lead selecionado.");
      }

      const mensagem = mensagemWhatsApp.trim();

      if (!mensagem) {
        throw new Error("Digite uma mensagem antes de enviar.");
      }

      const response = await fetch(WEBHOOK_ENVIAR_WHATSAPP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead_id: leadSelecionado.id,
          nome: leadSelecionado.nome || "Lead",
          telefone: leadSelecionado.telefone,
          mensagem,
        }),
      });

      if (!response.ok) {
        const textoErro = await response.text();
        throw new Error(textoErro || "Erro ao enviar mensagem pelo WhatsApp.");
      }

      return true;
    },
    onSuccess: async () => {
      toast.success("Mensagem enviada pelo WhatsApp");
      setMensagemWhatsApp("");

      await queryClient.invalidateQueries({
        queryKey: ["lead_interacoes", leadSelecionado?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao enviar mensagem pelo WhatsApp");
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({
      lead,
      status,
      proximaAcao,
    }: {
      lead: Lead;
      status: StatusLeadCanonico;
      proximaAcao: string | null;
    }) => {
      const agora = new Date().toISOString();

      const payload: Partial<Lead> = {
        status,
        proxima_acao: proximaAcao,
        atualizado_em: agora,
      };

      if (status !== "visita_agendada") {
        payload.visita_agendada_em = null;
        payload.observacao_visita = null;
      }

      const { error } = await supabaseAny
        .from("leads")
        .update(payload)
        .eq("id", lead.id);

      if (error) throw error;

      return {
        ...lead,
        ...payload,
      } as Lead;
    },
    onMutate: (variables) => {
      const agora = new Date().toISOString();

      const alteracoes: Partial<Lead> = {
        status: variables.status,
        proxima_acao: variables.proximaAcao,
        atualizado_em: agora,
      };

      if (variables.status !== "visita_agendada") {
        alteracoes.visita_agendada_em = null;
        alteracoes.observacao_visita = null;
      }

      atualizarLeadNoPainel(variables.lead.id, alteracoes);
    },
    onSuccess: (leadAtualizado) => {
      atualizarLeadNoPainel(leadAtualizado.id, leadAtualizado);
      atualizarLeadNoCache(leadAtualizado);
      toast.success("Status do lead atualizado");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status do lead");
    },
  });

  const marcarVisitaMutation = useMutation({
    mutationFn: async () => {
      if (!leadSelecionado) {
        throw new Error("Nenhum lead selecionado.");
      }

      if (!dataVisita) {
        throw new Error("Informe a data e o horário da visita.");
      }

      const visitaISO = new Date(dataVisita).toISOString();
      const agora = new Date().toISOString();

      const payload: Partial<Lead> = {
        status: "visita_agendada",
        visita_agendada_em: visitaISO,
        observacao_visita: observacaoVisita || null,
        proxima_acao: "Confirmar presença na visita",
        atualizado_em: agora,
      };

      const { error: leadError } = await supabaseAny
        .from("leads")
        .update(payload)
        .eq("id", leadSelecionado.id);

      if (leadError) throw leadError;

      const { error: tarefaError } = await supabaseAny
        .from("lead_tarefas")
        .insert({
          lead_id: leadSelecionado.id,
          tipo: "visita",
          titulo: "Visita agendada",
          descricao:
            observacaoVisita ||
            `Visita agendada para ${formatDateTimeBR(visitaISO)}.`,
          status: "pendente",
          data_agendada: visitaISO,
        });

      if (tarefaError) throw tarefaError;

      return {
        ...leadSelecionado,
        ...payload,
      } as Lead;
    },
    onMutate: () => {
      if (!leadSelecionado || !dataVisita) return;

      const visitaISO = new Date(dataVisita).toISOString();

      atualizarLeadNoPainel(leadSelecionado.id, {
        status: "visita_agendada",
        visita_agendada_em: visitaISO,
        observacao_visita: observacaoVisita || null,
        proxima_acao: "Confirmar presença na visita",
        atualizado_em: new Date().toISOString(),
      });
    },
    onSuccess: async (leadAtualizado) => {
      atualizarLeadNoPainel(leadAtualizado.id, leadAtualizado);
      atualizarLeadNoCache(leadAtualizado);

      await queryClient.invalidateQueries({
        queryKey: ["lead_tarefas", leadSelecionado?.id],
      });

      toast.success("Visita marcada com sucesso");

      setModalVisitaAberto(false);
      setDataVisita("");
      setObservacaoVisita("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao marcar visita");
    },
  });

  const converterAlunoMutation = useMutation({
    mutationFn: async () => {
      if (!leadSelecionado) {
        throw new Error("Nenhum lead selecionado.");
      }

      if (turmasSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma turma.");
      }

      const nomeAluno = leadSelecionado.nome?.trim() || "Aluno sem nome";
      const hoje = getDataHojeISO();
      const mensalidadeConvertida = converterValorMensalidade(valorMensalidade);
      const matriculaConvertida = converterValorMensalidade(valorMatricula);
      const diaVencimentoConvertido = diaVencimento
        ? Number(diaVencimento)
        : null;

      if (mensalidadeConvertida === null) {
        throw new Error("Informe o valor da mensalidade.");
      }

      if (matriculaConvertida === null) {
        throw new Error(
          "Informe o valor da matrícula. Use 0,00 se houver isenção."
        );
      }

      if (
        diaVencimentoConvertido === null ||
        !Number.isInteger(diaVencimentoConvertido) ||
        diaVencimentoConvertido < 1 ||
        diaVencimentoConvertido > 31
      ) {
        throw new Error("Informe um dia de vencimento válido entre 1 e 31.");
      }

      const turmasEscolhidas = turmas.filter((turma) =>
        turmasSelecionadas.includes(turma.id)
      );

      const nomesTurmas = turmasEscolhidas
        .map((turma) => turma.nome)
        .filter(Boolean)
        .join(", ");

      const turmaPrincipal = turmasEscolhidas[0] ?? null;

      const { data: alunoCriado, error: alunoError } = await supabaseAny
        .from("alunos")
        .insert({
          nome: nomeAluno,
          telefone: leadSelecionado.telefone || null,
          email: leadSelecionado.email || null,
          turma: nomesTurmas || null,
          turma_id: turmaPrincipal?.id || null,
          valor_mensalidade: mensalidadeConvertida,
          dia_vencimento: diaVencimentoConvertido,
          status: "ativo",
          observacoes:
            observacoesAluno ||
            `Aluno convertido a partir do lead. Origem: ${
              leadSelecionado.origem || "não informada"
            }.`,
          data_matricula: hoje,
        })
        .select()
        .single();

      if (alunoError) throw alunoError;

      const vinculosAlunoTurmas = turmasSelecionadas.map((turmaId) => ({
        aluno_id: alunoCriado.id,
        turma_id: turmaId,
        status: "ativo",
      }));

      const { error: vinculosError } = await supabaseAny
        .from("aluno_turmas")
        .insert(vinculosAlunoTurmas);

      if (vinculosError) throw vinculosError;

      const agora = new Date().toISOString();
      const dataAtual = new Date();
      const referenciaMensalidade = getReferenciaMesAno(dataAtual);
      const referenciaMatricula = `Matrícula ${dataAtual.getFullYear()}`;
      const dataVencimentoMensalidade = getDataVencimentoMensalidade(
        diaVencimentoConvertido
      );

      const mensalidadesParaCriar = [
        {
          aluno_id: alunoCriado.id,
          nome_aluno: nomeAluno,
          telefone: leadSelecionado.telefone || null,
          turma: nomesTurmas || null,
          valor: matriculaConvertida,
          data_vencimento: hoje,
          status: "pendente",
          data_pagamento: null,
          forma_pagamento: null,
          observacoes: "Matrícula gerada automaticamente na conversão do lead.",
          tipo: "matricula",
          referencia: referenciaMatricula,
        },
        {
          aluno_id: alunoCriado.id,
          nome_aluno: nomeAluno,
          telefone: leadSelecionado.telefone || null,
          turma: nomesTurmas || null,
          valor: mensalidadeConvertida,
          data_vencimento: dataVencimentoMensalidade,
          status: "pendente",
          data_pagamento: null,
          forma_pagamento: null,
          observacoes:
            "Mensalidade gerada automaticamente na conversão do lead.",
          tipo: "mensalidade",
          referencia: referenciaMensalidade,
        },
      ];

      const { error: mensalidadesError } = await supabaseAny
        .from("mensalidades")
        .insert(mensalidadesParaCriar);

      if (mensalidadesError) throw mensalidadesError;

      const payloadLead: Partial<Lead> = {
        status: "matriculado",
        convertido_aluno: true,
        aluno_id: alunoCriado.id,
        convertido_em: agora,
        proxima_acao: "Aluno matriculado",
        atualizado_em: agora,
      };

      const { error: leadError } = await supabaseAny
        .from("leads")
        .update(payloadLead)
        .eq("id", leadSelecionado.id);

      if (leadError) throw leadError;

      const { error: tarefaError } = await supabaseAny
        .from("lead_tarefas")
        .insert({
          lead_id: leadSelecionado.id,
          tipo: "matricula",
          titulo: "Lead convertido em aluno",
          descricao: `Lead convertido em aluno: ${nomeAluno}. Turmas: ${
            nomesTurmas || "não informadas"
          }. Matrícula e mensalidade geradas no financeiro.`,
          status: "concluida",
          data_agendada: agora,
        });

      if (tarefaError) throw tarefaError;

      const { error: conversaoError } = await supabaseAny
        .from("lead_conversoes")
        .insert({
          lead_id: leadSelecionado.id,
          aluno_id: alunoCriado.id,
          nome: nomeAluno,
          telefone: leadSelecionado.telefone || null,
          origem: leadSelecionado.origem || null,
          status: "convertido",
        });

      if (conversaoError) throw conversaoError;

      return {
        ...leadSelecionado,
        ...payloadLead,
      } as Lead;
    },
    onSuccess: async (leadAtualizado) => {
      atualizarLeadNoPainel(leadAtualizado.id, leadAtualizado);
      atualizarLeadNoCache(leadAtualizado);

      await queryClient.invalidateQueries({ queryKey: ["turmas"] });
      await queryClient.invalidateQueries({ queryKey: ["alunos"] });
      await queryClient.invalidateQueries({ queryKey: ["mensalidades"] });
      await queryClient.invalidateQueries({
        queryKey: ["lead_tarefas", leadSelecionado?.id],
      });

      toast.success("Lead convertido em aluno e cobranças geradas");

      setModalConversaoAberto(false);
      setTurmasSelecionadas([]);
      setValorMensalidade("");
      setValorMatricula("");
      setDiaVencimento("");
      setObservacoesAluno("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao converter lead em aluno");
    },
  });

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return leadsPainel;

    return leadsPainel.filter((lead) => {
      const textoBusca = [
        lead.nome,
        lead.telefone,
        lead.email,
        lead.origem,
        lead.ultima_mensagem,
        lead.data_ultima_mensagem,
        lead.intencao,
        lead.prioridade,
        lead.resumo_ia,
        lead.historico,
        lead.status,
        lead.proxima_acao,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return textoBusca.includes(termo);
    });
  }, [leadsPainel, busca]);

  const leadsPorColuna = useMemo(() => {
    const colunas: Record<KanbanColumnId, Lead[]> = {
      novo: [],
      atendimento: [],
      visita: [],
      matriculado: [],
      sem_resposta: [],
      perdido: [],
    };

    for (const lead of leadsFiltrados) {
      const coluna = getLeadColumnId(lead);

      colunas[coluna].push(lead);
    }

    return colunas;
  }, [leadsFiltrados]);

  const totalLeads = leadsFiltrados.length;

  const leadsAltaPrioridade = leadsFiltrados.filter(
    (lead) => normalizarTexto(lead.prioridade) === "alta"
  ).length;

  const novosLeads = leadsPorColuna.novo.length;
  const leadsMatriculados = leadsPorColuna.matriculado.length;
  const leadsAgendaramVisita = leadsPorColuna.visita.length;
  const leadsPerdidos = leadsPorColuna.perdido.length;

  const historicoAntigoSelecionado = formatHistorico(
    leadSelecionado?.historico ?? null
  );

  const larguraTotalKanban = useMemo(() => {
    const larguraColunas = Object.values(largurasColunas).reduce(
      (total, largura) => total + largura,
      0
    );

    const larguraGaps = Math.max(KANBAN_COLUMNS.length - 1, 0) * 16;

    return larguraColunas + larguraGaps;
  }, [largurasColunas]);

  function sincronizarScrollKanban(
    origem: "topo" | "baixo",
    scrollLeft: number
  ) {
    const destino =
      origem === "topo" ? scrollKanbanBaixoRef.current : scrollKanbanTopoRef.current;

    if (destino && destino.scrollLeft !== scrollLeft) {
      destino.scrollLeft = scrollLeft;
    }
  }

  function abrirModalVisitaParaLead(lead: Lead) {
    setLeadSelecionado(lead);
    setMensagemWhatsApp("");
    setDataVisita("");
    setObservacaoVisita(lead.observacao_visita || "");
    setModalVisitaAberto(true);
  }

  function abrirModalConversaoParaLead(lead: Lead) {
    setLeadSelecionado(lead);
    setMensagemWhatsApp("");
    setTurmasSelecionadas([]);
    setValorMensalidade("");
    setValorMatricula("");
    setDiaVencimento("");
    setObservacoesAluno(
      `Aluno convertido a partir do lead. Origem: ${
        lead.origem || "não informada"
      }.`
    );
    setModalConversaoAberto(true);
  }

  function abrirModalVisita() {
    if (!leadSelecionado) return;

    abrirModalVisitaParaLead(leadSelecionado);
  }

  function abrirModalConversao() {
    if (!leadSelecionado) return;

    abrirModalConversaoParaLead(leadSelecionado);
  }

  function alternarTurmaSelecionada(turmaId: string) {
    setTurmasSelecionadas((turmasAtuais) => {
      if (turmasAtuais.includes(turmaId)) {
        return turmasAtuais.filter((id) => id !== turmaId);
      }

      return [...turmasAtuais, turmaId];
    });
  }

  function atualizarStatusLead(
    lead: Lead,
    status: StatusLeadCanonico,
    proximaAcao: string | null
  ) {
    atualizarStatusMutation.mutate({
      lead,
      status,
      proximaAcao,
    });
  }
    function renderLeadCard(lead: Lead) {
    const leadNome = lead.nome?.trim() || "Lead WhatsApp";
    const statusAtual = getLeadColumnId(lead);

    const atualizando =
      atualizarStatusMutation.isPending ||
      marcarVisitaMutation.isPending ||
      converterAlunoMutation.isPending;

    const buttonClass =
      "h-auto min-h-8 min-w-0 px-2 py-1.5 text-xs leading-tight !whitespace-normal";

    return (
      <Card
        key={lead.id}
        className="min-w-0 overflow-hidden border-border/70 bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <CardContent className="space-y-3 p-3">
          <div className="space-y-2">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="min-w-0 space-y-1">
                <div className="break-words text-sm font-semibold leading-tight">
                  {leadNome}
                </div>

                <div className="break-all text-xs leading-tight text-muted-foreground">
                  {lead.telefone || "Telefone não informado"}
                </div>
              </div>

              <Badge
                className={`${getStatusClass(
                  lead.status
                )} h-auto max-w-full self-start break-words px-2 py-1 text-left text-[11px] leading-tight !whitespace-normal`}
              >
                {formatStatusLead(lead.status)}
              </Badge>
            </div>

            <div className="flex min-w-0 flex-wrap gap-1.5">
              <Badge
                variant="secondary"
                className="h-auto max-w-full break-words px-2 py-1 text-[11px] leading-tight !whitespace-normal"
              >
                {lead.intencao || "Sem intenção"}
              </Badge>

              <Badge
                className={`${getPrioridadeClass(
                  lead.prioridade
                )} h-auto max-w-full break-words px-2 py-1 text-[11px] leading-tight !whitespace-normal`}
              >
                {lead.prioridade || "Sem prioridade"}
              </Badge>
            </div>

            {lead.origem && (
              <div className="break-words text-xs leading-tight text-muted-foreground">
                Origem: {lead.origem}
              </div>
            )}

            <p className="line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">
              {lead.ultima_mensagem ||
                lead.resumo_ia ||
                "Sem mensagem recente."}
            </p>

            <div className="text-xs leading-tight text-muted-foreground">
              Atualizado:{" "}
              {formatDateTimeBR(lead.atualizado_em ?? lead.criado_em)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 min-w-0 px-2 text-xs"
              onClick={() => {
                    setLeadSelecionado(lead);
                    setMensagemWhatsApp("");
                  }}
            >
              <MessageSquare className="mr-1 size-4 shrink-0" />
              <span className="truncate">Ver</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-9 min-w-0 px-2 text-xs"
              asChild
            >
              <a
                href={montarLinkWhatsApp(lead)}
                target="_blank"
                rel="noreferrer"
              >
                <Phone className="mr-1 size-4 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-3">
            {statusAtual !== "atendimento" && statusAtual !== "matriculado" && (
              <Button
                size="sm"
                variant="secondary"
                className={buttonClass}
                disabled={atualizando}
                onClick={() =>
                  atualizarStatusLead(
                    lead,
                    "em_atendimento",
                    "Continuar atendimento pelo WhatsApp"
                  )
                }
              >
                Atender
              </Button>
            )}

            {statusAtual !== "visita" && statusAtual !== "matriculado" && (
              <Button
                size="sm"
                variant="secondary"
                className={buttonClass}
                disabled={atualizando}
                onClick={() => abrirModalVisitaParaLead(lead)}
              >
                Visita
              </Button>
            )}

            {statusAtual !== "sem_resposta" &&
              statusAtual !== "matriculado" &&
              statusAtual !== "perdido" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className={buttonClass}
                  disabled={atualizando}
                  onClick={() =>
                    atualizarStatusLead(
                      lead,
                      "sem_resposta",
                      "Tentar contato novamente"
                    )
                  }
                >
                  Sem resposta
                </Button>
              )}

            {statusAtual !== "perdido" && statusAtual !== "matriculado" && (
              <Button
                size="sm"
                variant="secondary"
                className={buttonClass}
                disabled={atualizando}
                onClick={() =>
                  atualizarStatusLead(lead, "perdido", "Lead encerrado")
                }
              >
                Perdido
              </Button>
            )}

            {statusAtual !== "matriculado" && (
              <Button
                size="sm"
                className={`${buttonClass} col-span-2`}
                disabled={converterAlunoMutation.isPending}
                onClick={() => abrirModalConversaoParaLead(lead)}
              >
                Converter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Kanban comercial dos leads captados automaticamente pelo WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
          <Columns3 className="size-4" />
          Kanban de atendimento
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{novosLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{leadsAgendaramVisita}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alta prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{leadsAltaPrioridade}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matriculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{leadsMatriculados}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="space-y-4">
          <CardTitle className="font-display flex flex-wrap items-center justify-between gap-3 text-lg">
            <span>
              {leadsFiltrados.length} lead
              {leadsFiltrados.length === 1 ? "" : "s"} no funil
            </span>

            <span className="text-sm font-normal text-muted-foreground">
              {leadsPerdidos} perdido{leadsPerdidos === 1 ? "" : "s"}
            </span>
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone, intenção, prioridade, status ou mensagem..."
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Carregando leads...
            </div>
          ) : isError ? (
            <div className="rounded-lg border p-8 text-center text-destructive">
              Erro ao carregar leads.
            </div>
          ) : leadsFiltrados.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              Nenhum lead encontrado.
            </div>
          ) : (
            <div className="space-y-2">
              <div
                ref={scrollKanbanTopoRef}
                className="h-4 w-full overflow-x-auto overflow-y-hidden"
                onScroll={(event) =>
                  sincronizarScrollKanban("topo", event.currentTarget.scrollLeft)
                }
              >
                <div style={{ width: larguraTotalKanban }} className="h-1" />
              </div>

              <div
                ref={scrollKanbanBaixoRef}
                className="w-full overflow-x-auto pb-3"
                onScroll={(event) =>
                  sincronizarScrollKanban("baixo", event.currentTarget.scrollLeft)
                }
              >
                <div className="flex min-w-max gap-4">
                {KANBAN_COLUMNS.map((column) => {
                  const Icon = column.icon;
                  const leadsColuna = leadsPorColuna[column.id];

                  return (
                    <section
                      key={column.id}
                      style={{ width: largurasColunas[column.id] }}
                      className={`relative flex max-h-[calc(100vh-260px)] min-h-[520px] shrink-0 flex-col rounded-xl border ${getColumnClass(
                        column.id
                      )}`}
                    >
                      <div className="sticky top-0 z-10 rounded-t-xl border-b bg-background/90 p-3 backdrop-blur">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`grid size-8 shrink-0 place-items-center rounded-full ${getColumnBadgeClass(
                                column.id
                              )}`}
                            >
                              <Icon className="size-4" />
                            </span>

                            <div className="min-w-0">
                              <h2 className="break-words font-display text-sm font-semibold leading-tight">
                                {column.title}
                              </h2>

                              <p className="break-words text-xs leading-tight text-muted-foreground">
                                {column.description}
                              </p>
                            </div>
                          </div>

                          <Badge
                            className={`${getColumnBadgeClass(
                              column.id
                            )} shrink-0`}
                          >
                            {leadsColuna.length}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto p-3">
                        {leadsColuna.length === 0 ? (
                          <div className="rounded-lg border border-dashed bg-background/60 p-4 text-center text-sm text-muted-foreground">
                            Nenhum lead nesta etapa.
                          </div>
                        ) : (
                          leadsColuna.map((lead) => renderLeadCard(lead))
                        )}
                      </div>

                      <div
                        role="separator"
                        aria-label={`Redimensionar coluna ${column.title}`}
                        title="Segure e arraste para aumentar ou diminuir a largura da coluna"
                        onMouseDown={(event) =>
                          iniciarResizeColuna(column.id, event)
                        }
                        className="absolute right-0 top-0 z-20 h-full w-2 cursor-col-resize rounded-r-xl hover:bg-primary/20"
                      />
                    </section>
                  );
                })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
            <Dialog
        open={!!leadSelecionado}
        onOpenChange={(open) => {
          if (!open) {
            setLeadSelecionado(null);
            setMensagemWhatsApp("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Lead — {leadSelecionado?.nome ?? "Lead WhatsApp"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm md:grid-cols-2">
              <div>
                <strong>Telefone:</strong> {leadSelecionado?.telefone ?? "—"}
              </div>

              <div>
                <strong>Email:</strong> {leadSelecionado?.email ?? "—"}
              </div>

              <div>
                <strong>Origem:</strong> {leadSelecionado?.origem ?? "—"}
              </div>

              <div>
                <strong>Intenção:</strong> {leadSelecionado?.intencao ?? "—"}
              </div>

              <div>
                <strong>Prioridade:</strong>{" "}
                {leadSelecionado?.prioridade ?? "—"}
              </div>

              <div>
                <strong>Status:</strong>{" "}
                {formatStatusLead(leadSelecionado?.status ?? null)}
              </div>

              <div>
                <strong>Atualizado em:</strong>{" "}
                {formatDateTimeBR(
                  leadSelecionado?.atualizado_em ??
                    leadSelecionado?.criado_em ??
                    null
                )}
              </div>

              <div>
                <strong>Visita agendada:</strong>{" "}
                {formatDateTimeBR(leadSelecionado?.visita_agendada_em ?? null)}
              </div>

              <div>
                <strong>Próxima ação:</strong>{" "}
                {leadSelecionado?.proxima_acao ?? "—"}
              </div>

              <div>
                <strong>Convertido em aluno:</strong>{" "}
                {leadSelecionado?.convertido_aluno ? "Sim" : "Não"}
              </div>
            </div>

            {leadSelecionado && (
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a
                    href={montarLinkWhatsApp(leadSelecionado)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Phone className="mr-2 size-4" />
                    Chamar no WhatsApp
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    atualizarStatusLead(
                      leadSelecionado,
                      "em_atendimento",
                      "Continuar atendimento pelo WhatsApp"
                    )
                  }
                  disabled={atualizarStatusMutation.isPending}
                >
                  <MessageSquare className="mr-2 size-4" />
                  Em atendimento
                </Button>

                <Button variant="outline" onClick={abrirModalVisita}>
                  <CalendarClock className="mr-2 size-4" />
                  Marcar visita
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    atualizarStatusLead(
                      leadSelecionado,
                      "sem_resposta",
                      "Tentar contato novamente"
                    )
                  }
                  disabled={atualizarStatusMutation.isPending}
                >
                  Sem resposta
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    atualizarStatusLead(
                      leadSelecionado,
                      "perdido",
                      "Lead encerrado"
                    )
                  }
                  disabled={atualizarStatusMutation.isPending}
                >
                  Perdido
                </Button>

                <Button
                  variant="default"
                  onClick={abrirModalConversao}
                  disabled={!!leadSelecionado.convertido_aluno}
                >
                  <UserPlus className="mr-2 size-4" />
                  {leadSelecionado.convertido_aluno
                    ? "Já convertido"
                    : "Converter em aluno"}
                </Button>
              </div>
            )}

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">
                  Tarefas do lead
                </h2>
              </div>

              <div className="rounded-lg border">
                {carregandoTarefas ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    Carregando tarefas...
                  </p>
                ) : erroTarefas ? (
                  <p className="p-4 text-sm text-destructive">
                    Erro ao carregar tarefas.
                  </p>
                ) : tarefasLead.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    Nenhuma tarefa registrada para este lead.
                  </p>
                ) : (
                  <div className="divide-y">
                    {tarefasLead.map((tarefa) => (
                      <div key={tarefa.id} className="space-y-2 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium">
                            {tarefa.titulo ?? "Tarefa"}
                          </div>

                          <Badge
                            className={getTarefaStatusClass(tarefa.status)}
                          >
                            {tarefa.status ?? "pendente"}
                          </Badge>
                        </div>

                        {tarefa.descricao && (
                          <p className="text-sm text-muted-foreground">
                            {tarefa.descricao}
                          </p>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Criada em: {formatDateTimeBR(tarefa.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">
                  Histórico de interações
                </h2>
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-lg border p-3">
                {carregandoInteracoes ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando histórico...
                  </p>
                ) : erroInteracoes ? (
                  <p className="text-sm text-destructive">
                    Erro ao carregar histórico.
                  </p>
                ) : interacoesLead.length > 0 ? (
                  interacoesLead.map((interacao) => (
                    <div
                      key={interacao.id}
                      className="rounded-md bg-background px-3 py-2 text-sm shadow-sm"
                    >
                      <div className="mb-1 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {interacao.direcao === "saida"
                            ? "Mensagem enviada"
                            : "Mensagem recebida"}
                          {interacao.canal ? ` • ${interacao.canal}` : ""}
                        </span>

                        <span>{formatDateTimeBR(interacao.created_at)}</span>
                      </div>

                      <div>{interacao.mensagem || "Mensagem vazia"}</div>
                    </div>
                  ))
                ) : historicoAntigoSelecionado.length > 0 ? (
                  historicoAntigoSelecionado.map((linha, index) => (
                    <div
                      key={`${linha}-${index}`}
                      className="rounded-md bg-background px-3 py-2 text-sm shadow-sm"
                    >
                      {linha}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum histórico registrado para este lead.
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Send className="size-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">
                  Enviar mensagem pelo WhatsApp
                </h2>
              </div>

              <Textarea
                value={mensagemWhatsApp}
                onChange={(event) => setMensagemWhatsApp(event.target.value)}
                placeholder="Digite a mensagem para enviar pelo WhatsApp..."
                rows={4}
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => enviarWhatsAppMutation.mutate()}
                  disabled={
                    enviarWhatsAppMutation.isPending || !mensagemWhatsApp.trim()
                  }
                >
                  <Send className="mr-2 size-4" />
                  {enviarWhatsAppMutation.isPending
                    ? "Enviando..."
                    : "Enviar WhatsApp"}
                </Button>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalVisitaAberto} onOpenChange={setModalVisitaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Marcar visita</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-visita">Data e horário da visita</Label>
              <Input
                id="data-visita"
                type="datetime-local"
                value={dataVisita}
                onChange={(e) => setDataVisita(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao-visita">Observação</Label>
              <Textarea
                id="observacao-visita"
                value={observacaoVisita}
                onChange={(e) => setObservacaoVisita(e.target.value)}
                placeholder="Exemplo: lead quer conhecer a escola antes de fechar matrícula."
              />
            </div>

            {marcarVisitaMutation.isError && (
              <p className="text-sm text-destructive">
                Erro ao marcar visita. Confira os dados e tente novamente.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setModalVisitaAberto(false)}
                disabled={marcarVisitaMutation.isPending}
              >
                Cancelar
              </Button>

              <Button
                onClick={() => marcarVisitaMutation.mutate()}
                disabled={marcarVisitaMutation.isPending}
              >
                {marcarVisitaMutation.isPending
                  ? "Salvando..."
                  : "Salvar visita"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalConversaoAberto}
        onOpenChange={setModalConversaoAberto}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Converter lead em aluno
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p>
                <strong>Nome:</strong>{" "}
                {leadSelecionado?.nome || "Aluno sem nome"}
              </p>
              <p>
                <strong>Telefone:</strong> {leadSelecionado?.telefone || "—"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Turmas cadastradas</Label>

              {carregandoTurmas ? (
                <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                  Carregando turmas...
                </p>
              ) : erroTurmas ? (
                <p className="rounded-lg border p-3 text-sm text-destructive">
                  Erro ao carregar turmas.
                </p>
              ) : turmas.length === 0 ? (
                <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                  Nenhuma turma cadastrada. Cadastre uma turma antes de converter
                  o lead em aluno.
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {turmas.map((turma) => {
                    const checked = turmasSelecionadas.includes(turma.id);

                    return (
                      <label
                        key={turma.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            alternarTurmaSelecionada(turma.id)
                          }
                        />

                        <div className="space-y-1">
                          <div className="font-medium">{turma.nome}</div>

                          <div className="text-xs text-muted-foreground">
                            {turma.curso ? `Curso: ${turma.curso}` : ""}
                            {turma.professor
                              ? `${turma.curso ? " • " : ""}Professor: ${
                                  turma.professor
                                }`
                              : ""}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {turma.dias_semana || "Dias não informados"}
                            {turma.horario ? ` • ${turma.horario}` : ""}
                          </div>

                          <Badge variant="secondary">
                            {turma.status || "ativa"}
                          </Badge>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Você pode selecionar mais de uma turma para o mesmo aluno.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor-mensalidade">Valor da mensalidade</Label>
              <Input
                id="valor-mensalidade"
                value={valorMensalidade}
                onChange={(e) => setValorMensalidade(e.target.value)}
                placeholder="Exemplo: 250,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor-matricula">Valor da matrícula</Label>
              <Input
                id="valor-matricula"
                value={valorMatricula}
                onChange={(e) => setValorMatricula(e.target.value)}
                placeholder="Exemplo: 100,00 ou 0,00 se for isento"
              />
              <p className="text-xs text-muted-foreground">
                Informe o valor final após desconto. Use 0,00 se a matrícula for
                isenta.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dia-vencimento">Dia do vencimento</Label>
              <Input
                id="dia-vencimento"
                type="number"
                min="1"
                max="31"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                placeholder="Exemplo: 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes-aluno">Observações</Label>
              <Textarea
                id="observacoes-aluno"
                value={observacoesAluno}
                onChange={(e) => setObservacoesAluno(e.target.value)}
              />
            </div>

            {converterAlunoMutation.isError && (
              <p className="text-sm text-destructive">
                Erro ao converter lead em aluno. Confira turma, mensalidade,
                matrícula e dia de vencimento.
              </p>
            )}

            {converterAlunoMutation.isSuccess && (
              <p className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" />
                Lead convertido em aluno com sucesso.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setModalConversaoAberto(false)}
                disabled={converterAlunoMutation.isPending}
              >
                Cancelar
              </Button>

              <Button
                onClick={() => converterAlunoMutation.mutate()}
                disabled={
                  converterAlunoMutation.isPending ||
                  turmasSelecionadas.length === 0
                }
              >
                {converterAlunoMutation.isPending
                  ? "Convertendo..."
                  : "Confirmar conversão"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}