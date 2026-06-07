import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
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
  const [busca, setBusca] = useState("");

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

  const pagamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return data;

    return data.filter((p) => {
      const textoBusca = [
        p.nome_aluno,
        p.telefone,
        p.turma,
        p.valor,
        p.data_pagamento,
        p.data_vencimento,
        p.status,
        p.observacoes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return textoBusca.includes(termo);
    });
  }, [data, busca]);

  const total = pagamentosFiltrados.reduce(
    (s, p) => s + Number(p.valor || 0),
    0
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Pagamentos</h1>
        <p className="text-muted-foreground mt-1">
          Histórico completo de pagamentos recebidos.
        </p>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="space-y-4">
          <CardTitle className="font-display text-lg flex justify-between">
            <span>
              {pagamentosFiltrados.length} pagamento
              {pagamentosFiltrados.length === 1 ? "" : "s"}
            </span>
            <span className="text-primary">{formatBRL(total)}</span>
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone, turma, valor ou data..."
              className="pl-10"
            />
          </div>
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
                ) : pagamentosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum pagamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagamentosFiltrados.map((p) => (
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