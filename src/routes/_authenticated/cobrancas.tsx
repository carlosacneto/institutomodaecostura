import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Users, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { callWebhook, loadWebhooks } from "@/lib/webhooks";
import { formatBRL, formatDate, today } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cobrancas")({ component: CobrancasPage });

function CobrancasPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: vencidas = [], isLoading } = useQuery({
    queryKey: ["vencidas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("mensalidades")
        .select("id, valor, data_vencimento, alunos(id, nome, telefone, email)")
        .neq("status", "pago")
        .lt("data_vencimento", today())
        .order("data_vencimento");
      return data ?? [];
    },
  });

  const { data: historico = [] } = useQuery({
    queryKey: ["mensagens"],
    queryFn: async () => (await supabase.from("mensagens").select("*, alunos(nome)").order("created_at", { ascending: false }).limit(30)).data ?? [],
  });

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const enviarIndividual = useMutation({
    mutationFn: async (m: any) => {
      const url = loadWebhooks().cobrancaIndividual;
      await callWebhook(url, {
        aluno: m.alunos, mensalidade: { id: m.id, valor: m.valor, vencimento: m.data_vencimento },
      });
      await supabase.from("mensagens").insert({
        aluno_id: m.alunos.id, tipo: "cobranca", canal: "whatsapp",
        conteudo: `Cobrança ${formatBRL(m.valor)} venc. ${m.data_vencimento}`,
        status_envio: "enviado", enviado_em: new Date().toISOString(),
      });
    },
    onSuccess: () => { toast.success("Cobrança enviada"); qc.invalidateQueries({ queryKey: ["mensagens"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const enviarLote = useMutation({
    mutationFn: async () => {
      const url = loadWebhooks().cobrancaLote;
      const list = (vencidas as any[]).filter(m => selected.has(m.id));
      if (list.length === 0) throw new Error("Selecione ao menos uma cobrança");
      await callWebhook(url, {
        cobrancas: list.map(m => ({
          aluno: m.alunos, mensalidade: { id: m.id, valor: m.valor, vencimento: m.data_vencimento },
        })),
      });
      await supabase.from("mensagens").insert(list.map(m => ({
        aluno_id: m.alunos.id, tipo: "cobranca_lote", canal: "whatsapp",
        conteudo: `Cobrança em lote ${formatBRL(m.valor)}`, status_envio: "enviado", enviado_em: new Date().toISOString(),
      })));
    },
    onSuccess: () => { toast.success(`${selected.size} cobranças enviadas`); setSelected(new Set()); qc.invalidateQueries({ queryKey: ["mensagens"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between flex-wrap gap-4 items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold">Cobranças por WhatsApp</h1>
          <p className="text-muted-foreground mt-1">Mensagens disparadas via webhook do n8n.</p>
        </div>
        <Button onClick={() => enviarLote.mutate()} disabled={selected.size === 0 || enviarLote.isPending}>
          <Users className="size-4 mr-2" /> Enviar em lote ({selected.size})
        </Button>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle className="font-display text-lg">Mensalidades vencidas</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow> :
                  vencidas.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma mensalidade vencida 🎉</TableCell></TableRow> :
                  (vencidas as any[]).map(m => (
                    <TableRow key={m.id}>
                      <TableCell><Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} /></TableCell>
                      <TableCell className="font-medium">{m.alunos?.nome}</TableCell>
                      <TableCell>{m.alunos?.telefone ?? "—"}</TableCell>
                      <TableCell>{formatBRL(m.valor)}</TableCell>
                      <TableCell><Badge className="bg-destructive/10 text-destructive">{formatDate(m.data_vencimento)}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => enviarIndividual.mutate(m)}>
                          <Send className="size-4 mr-2" /> Cobrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Configure webhooks em <Link to="/configuracoes" className="underline">Configurações</Link>.</p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><MessageCircle className="size-4" /> Histórico de mensagens</CardTitle></CardHeader>
        <CardContent>
          {historico.length === 0 ? <p className="text-sm text-muted-foreground">Sem mensagens ainda.</p> :
            <ul className="divide-y">
              {(historico as any[]).map(h => (
                <li key={h.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-medium">{h.alunos?.nome ?? "—"}</div>
                    <div className="text-muted-foreground">{h.conteudo}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{h.canal}</div>
                    <div>{formatDate(h.created_at?.slice(0, 10))}</div>
                  </div>
                </li>
              ))}
            </ul>}
        </CardContent>
      </Card>
    </div>
  );
}
