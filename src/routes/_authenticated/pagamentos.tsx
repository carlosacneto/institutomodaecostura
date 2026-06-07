import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pagamentos")({
  component: PagamentosPage,
});

type Pagamento = {
  id: string;
  aluno_id: string | null;
  nome_aluno: string | null;
  telefone: string | null;
  turma: string | null;
  valor: number | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  status: string | null;
  observacoes: string | null;
};

function PagamentosPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mensalidades")
        .select("*")
        .eq("status", "pago")
        .order("data_pagamento", { ascending: false });

      if (error) throw error;

      return (data ?? []) as Pagamento[];
    },
  });

  const total = data.reduce((s, p) => s + Number(p.valor || 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Pagamentos</h1>
        <p className="text-muted-foreground mt-1">
          Histórico completo de pagamentos recebidos.
        </p>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="font-display text-lg flex justify-between">
            <span>
              {data.length} pagamento{data.length === 1 ? "" : "s"}
            </span>
            <span className="text-primary">{formatBRL(total)}</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data pagamento</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
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
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum pagamento registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.data_pagamento ? formatDate(p.data_pagamento) : "—"}
                      </TableCell>

                      <TableCell className="font-medium">
                        {p.nome_aluno ?? "—"}
                      </TableCell>

                      <TableCell>{p.telefone ?? "—"}</TableCell>

                      <TableCell>{p.turma ?? "—"}</TableCell>

                      <TableCell>{formatBRL(Number(p.valor ?? 0))}</TableCell>

                      <TableCell>
                        <Badge className="bg-success/15 text-success">
                          pago
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {p.observacoes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}