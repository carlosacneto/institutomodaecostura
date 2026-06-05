import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { formatBRL, formatDate, today } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/mensalidades")({ component: MensalidadesPage });

function MensalidadesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["mensalidades"],
    queryFn: async () => (await supabase.from("mensalidades").select("*, alunos(nome), turmas(nome)").order("data_vencimento", { ascending: false })).data ?? [],
  });

  const filtradas = useMemo(() => {
    const hoje = today();
    return (data as any[]).filter(m => {
      if (filtro === "all") return true;
      if (filtro === "pago") return m.status === "pago";
      if (filtro === "pendente") return m.status === "pendente" && m.data_vencimento >= hoje;
      if (filtro === "vencida") return m.status !== "pago" && m.data_vencimento < hoje;
      return true;
    });
  }, [data, filtro]);

  const baixar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mensalidades").update({ status: "pago", data_pagamento: today() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Mensalidade marcada como paga"); qc.invalidateQueries(); },
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between flex-wrap gap-4 items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold">Mensalidades</h1>
          <p className="text-muted-foreground mt-1">Vencimentos, valores e status.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-2" />Nova mensalidade</Button>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <div className="flex gap-3 flex-wrap">
            {[
              { v: "all", l: "Todas" }, { v: "pago", l: "Pagas" }, { v: "pendente", l: "Pendentes" }, { v: "vencida", l: "Vencidas" },
            ].map(o => (
              <Button key={o.v} size="sm" variant={filtro === o.v ? "default" : "outline"} onClick={() => setFiltro(o.v)}>{o.l}</Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow> :
                  filtradas.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma mensalidade encontrada.</TableCell></TableRow> :
                  filtradas.map((m: any) => {
                    const vencida = m.status !== "pago" && m.data_vencimento < today();
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.alunos?.nome ?? "—"}</TableCell>
                        <TableCell>{m.turmas?.nome ?? "—"}</TableCell>
                        <TableCell>{formatBRL(m.valor)}</TableCell>
                        <TableCell>{formatDate(m.data_vencimento)}</TableCell>
                        <TableCell>
                          {m.status === "pago"
                            ? <Badge className="bg-success/15 text-success">pago</Badge>
                            : vencida
                              ? <Badge className="bg-destructive/15 text-destructive">vencida</Badge>
                              : <Badge variant="secondary">{m.status}</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          {m.status !== "pago" && (
                            <Button size="sm" variant="ghost" onClick={() => baixar.mutate(m.id)}>Marcar como paga</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MensalidadeForm open={open} onOpenChange={setOpen} />
    </div>
  );
}

function MensalidadeForm({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ aluno_id: "", turma_id: "", valor: "", data_vencimento: today(), status: "pendente", observacoes: "" });

  const { data: alunos = [] } = useQuery({ queryKey: ["alunos-min"], queryFn: async () => (await supabase.from("alunos").select("id,nome,turma_id").order("nome")).data ?? [] });
  const { data: turmas = [] } = useQuery({ queryKey: ["turmas-min"], queryFn: async () => (await supabase.from("turmas").select("id,nome").order("nome")).data ?? [] });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("mensalidades").insert({
        aluno_id: form.aluno_id, turma_id: form.turma_id || null,
        valor: Number(form.valor), data_vencimento: form.data_vencimento, status: form.status, observacoes: form.observacoes,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Mensalidade criada"); qc.invalidateQueries(); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">Nova mensalidade</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Aluno</Label>
            <Select value={form.aluno_id} onValueChange={v => {
              const a = (alunos as any[]).find(a => a.id === v);
              setForm({ ...form, aluno_id: v, turma_id: a?.turma_id ?? form.turma_id });
            }}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{(alunos as any[]).map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Turma</Label>
            <Select value={form.turma_id || "none"} onValueChange={v => setForm({ ...form, turma_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {(turmas as any[]).map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
          <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={!form.aluno_id || !form.valor || save.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
