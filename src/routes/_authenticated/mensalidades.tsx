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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatDate, today } from "@/lib/format";

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
};

function MensalidadesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState("all");

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

    return data.filter((m) => {
      const status = m.status ?? "pendente";
      const vencimento = m.data_vencimento ?? "";

      if (filtro === "all") return true;
      if (filtro === "pago") return status === "pago";
      if (filtro === "pendente") {
        return status === "pendente" && vencimento >= hoje;
      }
      if (filtro === "vencida") {
        return status !== "pago" && vencimento < hoje;
      }

      return true;
    });
  }, [data, filtro]);

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

        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4 mr-2" />
          Nova mensalidade
        </Button>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
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
        aluno_id: form.aluno_id || null,
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