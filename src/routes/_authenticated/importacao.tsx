import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { callWebhook, loadWebhooks } from "@/lib/webhooks";
import { formatDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/importacao")({ component: ImportacaoPage });

function ImportacaoPage() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: hist = [] } = useQuery({
    queryKey: ["importacoes"],
    queryFn: async () => (await supabase.from("importacoes").select("*").order("executado_em", { ascending: false }).limit(20)).data ?? [],
  });

  const importar = useMutation({
    mutationFn: async () => {
      const url = loadWebhooks().importacao;
      setLoading(true);
      const res = await callWebhook(url, { source: "google_sheets", triggered_at: new Date().toISOString() });
      // Otimista: registra a tentativa
      await supabase.from("importacoes").insert({ origem: "google_sheets", total_linhas: 0, novos_registros: 0, registros_atualizados: 0, erros: 0 });
      return res;
    },
    onSuccess: () => { toast.success("Importação solicitada ao n8n"); qc.invalidateQueries({ queryKey: ["importacoes"] }); },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setLoading(false),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Importação</h1>
        <p className="text-muted-foreground mt-1">Sincronize alunos e turmas a partir do Google Sheets via n8n.</p>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <div className="size-16 rounded-2xl bg-primary/10 text-primary grid place-items-center">
            <FileSpreadsheet className="size-8" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Importar do Google Sheets</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Aciona o webhook configurado no n8n para puxar os dados da sua planilha.
            </p>
          </div>
          <Button size="lg" onClick={() => importar.mutate()} disabled={loading}>
            <Upload className="size-4 mr-2" />
            {loading ? "Importando..." : "Importar Google Sheets"}
          </Button>
          <p className="text-xs text-muted-foreground">
            URL configurada em <Link to="/configuracoes" className="underline">Configurações</Link>.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle className="font-display text-lg">Histórico</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Linhas</TableHead>
                  <TableHead>Novos</TableHead>
                  <TableHead>Atualizados</TableHead>
                  <TableHead>Erros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hist.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Sem importações ainda.</TableCell></TableRow> :
                  (hist as any[]).map(h => (
                    <TableRow key={h.id}>
                      <TableCell>{formatDate(h.executado_em?.slice(0, 10))}</TableCell>
                      <TableCell>{h.origem}</TableCell>
                      <TableCell>{h.total_linhas}</TableCell>
                      <TableCell>{h.novos_registros}</TableCell>
                      <TableCell>{h.registros_atualizados}</TableCell>
                      <TableCell>{h.erros}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
