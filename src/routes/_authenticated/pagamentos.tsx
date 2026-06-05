import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pagamentos")({ component: PagamentosPage });

function PagamentosPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => (await supabase.from("pagamentos").select("*, alunos(nome)").order("data_pagamento", { ascending: false })).data ?? [],
  });

  const total = (data as any[]).reduce((s, p) => s + Number(p.valor_pago || 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Pagamentos</h1>
        <p className="text-muted-foreground mt-1">Histórico completo de pagamentos recebidos.</p>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle className="font-display text-lg flex justify-between">
          <span>{data.length} pagamento{data.length === 1 ? "" : "s"}</span>
          <span className="text-primary">{formatBRL(total)}</span>
        </CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow> :
                  data.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum pagamento registrado.</TableCell></TableRow> :
                  (data as any[]).map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.data_pagamento)}</TableCell>
                      <TableCell className="font-medium">{p.alunos?.nome ?? "—"}</TableCell>
                      <TableCell>{formatBRL(p.valor_pago)}</TableCell>
                      <TableCell><Badge variant="secondary">{p.forma_pagamento ?? "—"}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.observacoes ?? "—"}</TableCell>
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
