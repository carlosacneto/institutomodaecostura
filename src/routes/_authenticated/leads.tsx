import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  MessageSquare,
  Phone,
  Search,
  UserPlus,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

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

function getPrioridadeClass(prioridade: string | null) {
  const valor = prioridade?.toLowerCase();

  if (valor === "alta") {
    return "bg-destructive/15 text-destructive";
  }

  if (valor === "média" || valor === "media") {
    return "bg-warning/15 text-warning";
  }

  return "bg-muted text-muted-foreground";
}

function getStatusClass(status: string | null) {
  const valor = status?.toLowerCase();

  if (valor?.includes("novo")) {
    return "bg-primary/15 text-primary";
  }

  if (valor?.includes("atendimento")) {
    return "bg-warning/15 text-warning";
  }

  if (valor?.includes("visita")) {
    return "bg-primary/15 text-primary";
  }

  if (valor?.includes("matriculado")) {
    return "bg-success/15 text-success";
  }

  if (valor?.includes("perdido")) {
    return "bg-destructive/15 text-destructive";
  }

  return "bg-muted text-muted-foreground";
}

function getTarefaStatusClass(status: string | null) {
  const valor = status?.toLowerCase();

  if (valor?.includes("pendente")) {
    return "bg-warning/15 text-warning";
  }

  if (valor?.includes("conclu")) {
    return "bg-success/15 text-success";
  }

  return "bg-muted text-muted-foreground";
}

function formatDateTimeBR(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

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

function LeadsPage() {
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState("");
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);

  const [modalVisitaAberto, setModalVisitaAberto] = useState(false);
  const [dataVisita, setDataVisita] = useState("");
  const [observacaoVisita, setObservacaoVisita] = useState("");

  const [modalConversaoAberto, setModalConversaoAberto] = useState(false);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<string[]>([]);
  const [valorMensalidade, setValorMensalidade] = useState("");
  const [diaVencimento, setDiaVencimento] = useState("");
  const [observacoesAluno, setObservacoesAluno] = useState("");

  const supabaseAny = supabase as any;

  const {
    data: leads = [],
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

  const marcarVisitaMutation = useMutation({
    mutationFn: async () => {
      if (!leadSelecionado) {
        throw new Error("Nenhum lead selecionado.");
      }

      if (!dataVisita) {
        throw new Error("Informe a data e o horário da visita.");
      }

      const visitaISO = new Date(dataVisita).toISOString();

      const { error: leadError } = await supabaseAny
        .from("leads")
        .update({
          status: "visita_agendada",
          visita_agendada_em: visitaISO,
          observacao_visita: observacaoVisita || null,
          proxima_acao: "Confirmar presença na visita",
          atualizado_em: new Date().toISOString(),
        })
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
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({
        queryKey: ["lead_tarefas", leadSelecionado?.id],
      });

      setLeadSelecionado((leadAtual) => {
        if (!leadAtual) return leadAtual;

        return {
          ...leadAtual,
          status: "visita_agendada",
          visita_agendada_em: new Date(dataVisita).toISOString(),
          observacao_visita: observacaoVisita || null,
          proxima_acao: "Confirmar presença na visita",
          atualizado_em: new Date().toISOString(),
        };
      });

      setModalVisitaAberto(false);
      setDataVisita("");
      setObservacaoVisita("");
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
      const hoje = new Date().toISOString().slice(0, 10);
      const mensalidadeConvertida = converterValorMensalidade(valorMensalidade);
      const diaVencimentoConvertido = diaVencimento
        ? Number(diaVencimento)
        : null;

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

      const { error: leadError } = await supabaseAny
        .from("leads")
        .update({
          status: "matriculado",
          convertido_aluno: true,
          aluno_id: alunoCriado.id,
          convertido_em: agora,
          proxima_acao: "Aluno matriculado",
          atualizado_em: agora,
        })
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
          }.`,
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

      return alunoCriado;
    },
    onSuccess: async (alunoCriado) => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["turmas"] });
      await queryClient.invalidateQueries({
        queryKey: ["lead_tarefas", leadSelecionado?.id],
      });

      const agora = new Date().toISOString();

      setLeadSelecionado((leadAtual) => {
        if (!leadAtual) return leadAtual;

        return {
          ...leadAtual,
          status: "matriculado",
          convertido_aluno: true,
          aluno_id: alunoCriado.id,
          convertido_em: agora,
          proxima_acao: "Aluno matriculado",
          atualizado_em: agora,
        };
      });

      setModalConversaoAberto(false);
      setTurmasSelecionadas([]);
      setValorMensalidade("");
      setDiaVencimento("");
      setObservacoesAluno("");
    },
  });

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return leads;

    return leads.filter((lead) => {
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
  }, [leads, busca]);

  const totalLeads = leadsFiltrados.length;

  const leadsAltaPrioridade = leadsFiltrados.filter(
    (lead) => lead.prioridade?.toLowerCase() === "alta"
  ).length;

  const novosLeads = leadsFiltrados.filter((lead) =>
    lead.status?.toLowerCase().includes("novo")
  ).length;

  const leadsMatriculados = leadsFiltrados.filter(
    (lead) =>
      lead.convertido_aluno || lead.status?.toLowerCase() === "matriculado"
  ).length;

  const historicoAntigoSelecionado = formatHistorico(
    leadSelecionado?.historico ?? null
  );

  function abrirModalVisita() {
    if (!leadSelecionado) return;

    setDataVisita("");
    setObservacaoVisita(leadSelecionado.observacao_visita || "");
    setModalVisitaAberto(true);
  }

  function abrirModalConversao() {
    if (!leadSelecionado) return;

    setTurmasSelecionadas([]);
    setValorMensalidade("");
    setDiaVencimento("");
    setObservacoesAluno(
      `Aluno convertido a partir do lead. Origem: ${
        leadSelecionado.origem || "não informada"
      }.`
    );
    setModalConversaoAberto(true);
  }

  function alternarTurmaSelecionada(turmaId: string) {
    setTurmasSelecionadas((turmasAtuais) => {
      if (turmasAtuais.includes(turmaId)) {
        return turmasAtuais.filter((id) => id !== turmaId);
      }

      return [...turmasAtuais, turmaId];
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Leads</h1>
        <p className="mt-1 text-muted-foreground">
          Leads captados automaticamente pelo WhatsApp.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
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
          <CardTitle className="font-display flex justify-between text-lg">
            <span>
              {leadsFiltrados.length} lead
              {leadsFiltrados.length === 1 ? "" : "s"}
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
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Intenção</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última mensagem</TableHead>
                  <TableHead>Ações</TableHead>
                  <TableHead>Atualizado em</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Carregando leads...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-destructive"
                    >
                      Erro ao carregar leads.
                    </TableCell>
                  </TableRow>
                ) : leadsFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  leadsFiltrados.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.nome ?? "Lead WhatsApp"}
                      </TableCell>

                      <TableCell>{lead.telefone}</TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {lead.intencao ?? "—"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={getPrioridadeClass(lead.prioridade)}>
                          {lead.prioridade ?? "—"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusClass(lead.status)}>
                          {lead.status ?? "Novo Lead"}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                        {lead.ultima_mensagem ?? "—"}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLeadSelecionado(lead)}
                          >
                            <MessageSquare className="mr-2 size-4" />
                            Ver
                          </Button>

                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={montarLinkWhatsApp(lead)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Phone className="mr-2 size-4" />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell>
                        {formatDateTimeBR(
                          lead.atualizado_em ?? lead.criado_em
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!leadSelecionado}
        onOpenChange={(open) => {
          if (!open) setLeadSelecionado(null);
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
                <strong>Status:</strong> {leadSelecionado?.status ?? "—"}
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

                <Button variant="outline" onClick={abrirModalVisita}>
                  <CalendarClock className="mr-2 size-4" />
                  Marcar visita
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
                Erro ao converter lead em aluno. Confira se pelo menos uma turma
                foi selecionada e tente novamente.
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