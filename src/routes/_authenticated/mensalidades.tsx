import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatDate, today } from "@/lib/format";
import { callWebhook, loadWebhooks } from "@/lib/webhooks";

export const Route = createFileRoute("/_authenticated/mensalidades")({
  component: MensalidadesPage,
});

type Mensalidade = {
  id: string;
  aluno_id: string | null;
  nome_aluno: string | null;
  telefone: string | null;
  turma: string | null;
  valor: number | null;
  data_vencimento: string | null;
  status: string | null;
  data_pagamento?: string | null;
  observacoes?: string | null;
  tipo?: string | null;
  referencia?: string | null;
};

function limparTelefoneWhatsApp(telefone: string | null | undefined) {
  const numeros = String(telefone ?? "").replace(/\D/g, "");

  if (!numeros) return null;

  if (numeros.startsWith("55")) {
    return numeros.length >= 12 ? numeros : null;
  }

  if (numeros.length < 10) return null;

  return `55${numeros}`;
}

function montarMensagemCobranca(mensalidade: Mensalidade) {
  const nomeCompleto = mensalidade.nome_aluno?.trim() || "aluno";
  const primeiroNome = nomeCompleto.split(" ")[0] || "aluno";

  return [
    `Olá ${primeiroNome}, tudo bem?`,
    "",
    "Passando para lembrar sobre sua mensalidade do Instituto Moda e Costura.",
    "",
    `Aluno: ${nomeCompleto}`,
    mensalidade.referencia ? `Referência: ${mensalidade.referencia}` : "",
    mensalidade.tipo ? `Tipo: ${mensalidade.tipo}` : "",
    `Valor: ${formatBRL(Number(mensalidade.valor ?? 0))}`,
    `Vencimento: ${
      mensalidade.data_vencimento
        ? formatDate(mensalidade.data_vencimento)
        : "não informado"
    }`,
    mensalidade.turma ? `Turma: ${mensalidade.turma}` : "",
    "",
    "Caso já tenha realizado o pagamento, por favor desconsidere esta mensagem.",
    "Qualquer dúvida, estamos à disposição.",
  ]
    .filter(Boolean)
    .join("\n");
}

function montarPayloadCobranca(mensalidade: Mensalidade) {
  const telefoneWhatsApp = limparTelefoneWhatsApp(mensalidade.telefone);
  const status = mensalidade.status ?? "pendente";
  const vencimento = mensalidade.data_vencimento ?? "";
  const vencida = status !== "pago" && vencimento < today();

  return {
    id: mensalidade.id,
    aluno_id: mensalidade.aluno_id,
    nome_aluno: mensalidade.nome_aluno,
    telefone: mensalidade.telefone,
    telefone_whatsapp: telefoneWhatsApp,
    turma: mensalidade.turma,
    valor: mensalidade.valor,
    valor_formatado: formatBRL(Number(mensalidade.valor ?? 0)),
    data_vencimento: mensalidade.data_vencimento,
    vencimento_formatado: mensalidade.data_vencimento
      ? formatDate(mensalidade.data_vencimento)
      : null,
    status,
    vencida,
    data_pagamento: mensalidade.data_pagamento ?? null,
    observacoes: mensalidade.observacoes ?? null,
    tipo: mensalidade.tipo ?? null,
    referencia: mensalidade.referencia ?? null,
    mensagem: montarMensagemCobranca(mensalidade),
  };
}

function MensalidadesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState("all");
  const [busca, setBusca] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["mensalidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mensalidades")
        .select("*")
        .order("data_vencimento", { ascending: false });

      if (error) throw error;

      return (data ?? []) as Mensalidade[];
    },
  });

  const filtradas = useMemo(() => {
    const hoje = today();
    const termo = busca.trim().toLowerCase();

    return data.filter((m) => {
      const status = m.status ?? "pendente";
      const vencimento = m.data_vencimento ?? "";

      const passaFiltroStatus =
        filtro === "all" ||
        (filtro === "pago" && status === "pago") ||
        (filtro === "pendente" && status === "pendente" && vencimento >= hoje) ||
        (filtro === "vencida" && status !== "pago" && vencimento < hoje);

      if (!passaFiltroStatus) return false;

      if (!termo) return true;

      const textoBusca = [
        m.nome_aluno,
        m.telefone,
        m.turma,
        m.status,
        m.valor,
        m.data_vencimento,
        m.data_pagamento,
        m.observacoes,
        m.tipo,
        m.referencia,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return textoBusca.includes(termo);
    });
  }, [data, filtro, busca]);

  const marcarComoPaga = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("mensalidades")
        .update({
          status: "pago",
          data_pagamento: today(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensalidade marcada como paga");
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const desfazerPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("mensalidades")
        .update({
          status: "pendente",
          data_pagamento: null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pagamento desfeito");
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const cobrarIndividual = useMutation({
    mutationFn: async (mensalidade: Mensalidade) => {
      const url = loadWebhooks().cobrancaIndividual;
      const payloadMensalidade = montarPayloadCobranca(mensalidade);

      if (!payloadMensalidade.telefone_whatsapp) {
        throw new Error("Telefone inválido ou não informado para cobrança.");
      }

      await callWebhook(url, {
        tipo: "cobranca_individual",
        origem: "dashboard_mensalidades",
        mensalidade: payloadMensalidade,
      });
    },
    onSuccess: () => {
      toast.success("Cobrança enviada para o n8n");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const cobrarLote = useMutation({
    mutationFn: async (mensalidades: Mensalidade[]) => {
      const url = loadWebhooks().cobrancaLote;
      const mensalidadesValidas = mensalidades
        .map(montarPayloadCobranca)
        .filter((m) => m.status !== "pago" && !!m.telefone_whatsapp);

      if (mensalidadesValidas.length === 0) {
        throw new Error("Nenhuma mensalidade pendente/vencida com telefone válido para cobrar.");
      }

      await callWebhook(url, {
        tipo: "cobranca_lote",
        origem: "dashboard_mensalidades",
        filtro,
        total: mensalidadesValidas.length,
        mensalidades: mensalidadesValidas,
      });
    },
    onSuccess: (_, mensalidades) => {
      const total = mensalidades
        .map(montarPayloadCobranca)
        .filter((m) => m.status !== "pago" && !!m.telefone_whatsapp).length;

      toast.success(`Cobrança em lote enviada para o n8n (${total} mensalidade${total === 1 ? "" : "s"})`);
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  function handleCobrarLote() {
    const mensalidadesParaCobrar = filtradas.filter((m) => (m.status ?? "pendente") !== "pago");

    if (mensalidadesParaCobrar.length === 0) {
      toast.error("Nenhuma mensalidade pendente ou vencida na lista atual.");
      return;
    }

    const confirmar = window.confirm(
      `Enviar cobrança em lote para ${mensalidadesParaCobrar.length} mensalidade${
        mensalidadesParaCobrar.length === 1 ? "" : "s"
      } da lista atual?`
    );

    if (!confirmar) return;

    cobrarLote.mutate(mensalidadesParaCobrar);
  }

  function handleDesfazerPagamento(mensalidade: Mensalidade) {
    const confirmar = window.confirm(
      `Deseja desfazer o pagamento de ${mensalidade.nome_aluno ?? "este aluno"}?`
    );

    if (!confirmar) return;

    desfazerPagamento.mutate(mensalidade.id);
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between flex-wrap gap-4 items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Mensalidades
          </h1>
          <p className="text-muted-foreground mt-1">
            Vencimentos, valores e status.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleCobrarLote}
            disabled={cobrarLote.isPending || filtradas.every((m) => (m.status ?? "pendente") === "pago")}
          >
            <Send className="size-4 mr-2" />
            {cobrarLote.isPending ? "Enviando lote..." : "Cobrar lote"}
          </Button>

          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4 mr-2" />
            Nova mensalidade
          </Button>
        </div>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone, turma, status ou valor..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {[
              { v: "all", l: "Todas" },
              { v: "pago", l: "Pagas" },
              { v: "pendente", l: "Pendentes" },
              { v: "vencida", l: "Vencidas" },
            ].map((o) => (
              <Button
                key={o.v}
                size="sm"
                variant={filtro === o.v ? "default" : "outline"}
                onClick={() => setFiltro(o.v)}
              >
                {o.l}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filtradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma mensalidade encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtradas.map((m) => {
                    const status = m.status ?? "pendente";
                    const vencimento = m.data_vencimento ?? "";
                    const vencida = status !== "pago" && vencimento < today();
                    const telefoneWhatsApp = limparTelefoneWhatsApp(m.telefone);

                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.nome_aluno ?? "—"}
                        </TableCell>

                        <TableCell>{m.telefone ?? "—"}</TableCell>

                        <TableCell>{m.turma ?? "—"}</TableCell>

                        <TableCell>{formatBRL(Number(m.valor ?? 0))}</TableCell>

                        <TableCell>
                          {m.data_vencimento
                            ? formatDate(m.data_vencimento)
                            : "—"}
                        </TableCell>

                        <TableCell>
                          {status === "pago" ? (
                            <Badge className="bg-success/15 text-success">
                              pago
                            </Badge>
                          ) : vencida ? (
                            <Badge className="bg-destructive/15 text-destructive">
                              vencida
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{status}</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {status !== "pago" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cobrarIndividual.mutate(m)}
                                disabled={cobrarIndividual.isPending || !telefoneWhatsApp}
                                title={
                                  telefoneWhatsApp
                                    ? "Cobrar pelo WhatsApp"
                                    : "Telefone inválido ou não informado"
                                }
                              >
                                <Send className="mr-2 size-4" />
                                {cobrarIndividual.isPending ? "Enviando..." : "Cobrar"}
                              </Button>
                            )}

                            {status === "pago" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDesfazerPagamento(m)}
                                disabled={desfazerPagamento.isPending}
                              >
                                Desfazer pagamento
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => marcarComoPaga.mutate(m.id)}
                                disabled={marcarComoPaga.isPending}
                              >
                                Marcar como paga
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MensalidadeForm open={open} onOpenChange={setOpen} />
    </div>
  );
}

function MensalidadeForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    aluno_id: "",
    nome_aluno: "",
    telefone: "",
    turma: "",
    valor: "",
    data_vencimento: today(),
    status: "pendente",
    observacoes: "",
  });

  const { data: alunos = [] } = useQuery({
    queryKey: ["alunos-min-mensalidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("id,nome,telefone,valor_mensalidade,dia_vencimento")
        .order("nome");

      if (error) throw error;

      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("mensalidades").insert({
        aluno_id: form.aluno_id!,
        nome_aluno: form.nome_aluno || null,
        telefone: form.telefone || null,
        turma: form.turma || null,
        valor: Number(form.valor),
        data_vencimento: form.data_vencimento,
        status: form.status,
        observacoes: form.observacoes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensalidade criada");
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function selecionarAluno(alunoId: string) {
    const aluno = (alunos as any[]).find((a) => a.id === alunoId);

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const dia = Math.min(Number(aluno?.dia_vencimento ?? 10), 28);
    const vencimento = `${ano}-${String(mes).padStart(2, "0")}-${String(
      dia
    ).padStart(2, "0")}`;

    setForm({
      ...form,
      aluno_id: alunoId,
      nome_aluno: aluno?.nome ?? "",
      telefone: aluno?.telefone ?? "",
      valor: String(aluno?.valor_mensalidade ?? ""),
      data_vencimento: vencimento,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Nova mensalidade</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Aluno</Label>
            <Select value={form.aluno_id} onValueChange={selecionarAluno}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {(alunos as any[]).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Turma</Label>
            <Input
              value={form.turma}
              onChange={(e) => setForm({ ...form, turma: e.target.value })}
              placeholder="Ex: C210 / C315"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Vencimento</Label>
            <Input
              type="date"
              value={form.data_vencimento}
              onChange={(e) =>
                setForm({ ...form, data_vencimento: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button
            onClick={() => save.mutate()}
            disabled={!form.aluno_id || !form.valor || save.isPending}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}