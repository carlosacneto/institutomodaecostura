import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Receipt, Send, Search } from "lucide-react";
import { toast } from "sonner";
import { callWebhook, loadWebhooks } from "@/lib/webhooks";
import { formatBRL, today } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/alunos")({ component: AlunosPage });

type Aluno = {
  id: string; nome: string; telefone: string | null; email: string | null;
  status: string; data_matricula: string | null; observacoes: string | null;
  turma_id: string | null; created_at: string;
};

function AlunosPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtroTurma, setFiltroTurma] = useState<string>("all");
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Aluno | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openPay, setOpenPay] = useState<Aluno | null>(null);

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ["alunos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alunos").select("*").order("nome");
      if (error) throw error;
      return data as Aluno[];
    },
  });

  const { data: turmas = [] } = useQuery({
    queryKey: ["turmas"],
    queryFn: async () => (await supabase.from("turmas").select("id,nome").order("nome")).data ?? [],
  });

  const filtrados = useMemo(() => alunos.filter(a => {
    if (busca && !a.nome.toLowerCase().includes(busca.toLowerCase()) && !(a.email ?? "").toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroTurma !== "all" && a.turma_id !== filtroTurma) return false;
    if (filtroStatus !== "all" && a.status !== filtroStatus) return false;
    return true;
  }), [alunos, busca, filtroTurma, filtroStatus]);

  const cobrar = useMutation({
    mutationFn: async (a: Aluno) => {
      const url = loadWebhooks().cobrancaIndividual;
      await callWebhook(url, { aluno: { id: a.id, nome: a.nome, telefone: a.telefone, email: a.email } });
      await supabase.from("mensagens").insert({
        aluno_id: a.id, tipo: "cobranca", canal: "whatsapp",
        conteudo: `Cobrança enviada para ${a.nome}`, status_envio: "enviado", enviado_em: new Date().toISOString(),
      });
    },
    onSuccess: () => { toast.success("Cobrança enviada"); qc.invalidateQueries({ queryKey: ["mensagens"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Alunos</h1>
          <p className="text-muted-foreground mt-1">Gerencie matrículas, contatos e cobranças.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpenForm(true); }}><Plus className="size-4 mr-2" /> Novo aluno</Button>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px_180px]">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <Select value={filtroTurma} onValueChange={setFiltroTurma}>
              <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="trancado">Trancado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum aluno encontrado.</TableCell></TableRow>
                ) : filtrados.map(a => {
                  const turma = turmas.find((t: any) => t.id === a.turma_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{a.email ?? "—"}</div>
                        <div>{a.telefone ?? "—"}</div>
                      </TableCell>
                      <TableCell>{turma?.nome ?? "—"}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" title="Editar" onClick={() => { setEditing(a); setOpenForm(true); }}><Pencil className="size-4" /></Button>
                          <Button size="icon" variant="ghost" title="Registrar pagamento" onClick={() => setOpenPay(a)}><Receipt className="size-4" /></Button>
                          <Button size="icon" variant="ghost" title="Enviar cobrança WhatsApp" onClick={() => cobrar.mutate(a)} disabled={cobrar.isPending}><Send className="size-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlunoForm open={openForm} onOpenChange={setOpenForm} aluno={editing} turmas={turmas as any} />
      {openPay && <PagamentoDialog aluno={openPay} onClose={() => setOpenPay(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { ativo: "bg-success/15 text-success", inativo: "bg-muted text-muted-foreground", trancado: "bg-warning/20 text-warning-foreground" };
  return <Badge variant="secondary" className={map[status] ?? ""}>{status}</Badge>;
}

function AlunoForm({ open, onOpenChange, aluno, turmas }: { open: boolean; onOpenChange: (b: boolean) => void; aluno: Aluno | null; turmas: { id: string; nome: string }[] }) {
  const qc = useQueryClient();
  const isEdit = !!aluno;
  const [form, setForm] = useState<Partial<Aluno>>({});

  useState(() => { setForm(aluno ?? { status: "ativo", data_matricula: today() }); });
  // re-sync when aluno changes
  useMemo(() => { setForm(aluno ?? { status: "ativo", data_matricula: today() }); }, [aluno]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, turma_id: form.turma_id || null };
      if (isEdit) {
        const { error } = await supabase.from("alunos").update(payload).eq("id", aluno!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("alunos").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(isEdit ? "Aluno atualizado" : "Aluno criado"); qc.invalidateQueries({ queryKey: ["alunos"] }); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="font-display">{isEdit ? "Editar aluno" : "Novo aluno"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2"><Label>Nome</Label><Input value={form.nome ?? ""} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
          <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone ?? ""} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 9..." /></div>
          <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Turma</Label>
            <Select value={form.turma_id ?? "none"} onValueChange={v => setForm({ ...form, turma_id: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem turma</SelectItem>
                {turmas.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status ?? "ativo"} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="trancado">Trancado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Data de matrícula</Label><Input type="date" value={form.data_matricula ?? ""} onChange={e => setForm({ ...form, data_matricula: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-2"><Label>Observações</Label><Textarea value={form.observacoes ?? ""} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.nome}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PagamentoDialog({ aluno, onClose }: { aluno: Aluno; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ valor_pago: "", data_pagamento: today(), forma_pagamento: "pix", observacoes: "", mensalidade_id: "" });

  const { data: pendentes = [] } = useQuery({
    queryKey: ["mens-pend", aluno.id],
    queryFn: async () => (await supabase.from("mensalidades").select("id,valor,data_vencimento").eq("aluno_id", aluno.id).neq("status", "pago").order("data_vencimento")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pagamentos").insert({
        aluno_id: aluno.id,
        mensalidade_id: form.mensalidade_id || null,
        valor_pago: Number(form.valor_pago),
        data_pagamento: form.data_pagamento,
        forma_pagamento: form.forma_pagamento,
        observacoes: form.observacoes,
      });
      if (error) throw error;
      if (form.mensalidade_id) {
        await supabase.from("mensalidades").update({
          status: "pago", data_pagamento: form.data_pagamento, forma_pagamento: form.forma_pagamento,
        }).eq("id", form.mensalidade_id);
      }
    },
    onSuccess: () => { toast.success("Pagamento registrado"); qc.invalidateQueries(); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">Registrar pagamento — {aluno.nome}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Mensalidade (opcional)</Label>
            <Select value={form.mensalidade_id || "none"} onValueChange={v => {
              const m = pendentes.find((p: any) => p.id === v);
              setForm({ ...form, mensalidade_id: v === "none" ? "" : v, valor_pago: m ? String(m.valor) : form.valor_pago });
            }}>
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Avulso (sem mensalidade)</SelectItem>
                {pendentes.map((p: any) => <SelectItem key={p.id} value={p.id}>{formatBRL(p.valor)} — venc. {p.data_vencimento}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Valor pago</Label><Input type="number" step="0.01" value={form.valor_pago} onChange={e => setForm({ ...form, valor_pago: e.target.value })} /></div>
          <div className="space-y-2"><Label>Data</Label><Input type="date" value={form.data_pagamento} onChange={e => setForm({ ...form, data_pagamento: e.target.value })} /></div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Forma de pagamento</Label>
            <Select value={form.forma_pagamento} onValueChange={v => setForm({ ...form, forma_pagamento: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-2"><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !form.valor_pago}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
