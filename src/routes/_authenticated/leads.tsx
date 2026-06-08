import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/leads")({
  component: LeadsPage,
});

type Lead = {
  id: string;
  nome: string | null;
  telefone: string;
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

  if (valor?.includes("matriculado")) {
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

function LeadsPage() {
  const [busca, setBusca] = useState("");

  const {
    data: leads = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("atualizado_em", { ascending: false });

      if (error) throw error;

      return (data ?? []) as Lead[];
    },
  });

  const leadsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return leads;

    return leads.filter((lead) => {
      const textoBusca = [
        lead.nome,
        lead.telefone,
        lead.origem,
        lead.ultima_mensagem,
        lead.data_ultima_mensagem,
        lead.intencao,
        lead.prioridade,
        lead.resumo_ia,
        lead.historico,
        lead.status,
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Leads</h1>
        <p className="mt-1 text-muted-foreground">
          Leads captados automaticamente pelo WhatsApp.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
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
                  <TableHead>Atualizado em</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Carregando leads...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-destructive"
                    >
                      Erro ao carregar leads.
                    </TableCell>
                  </TableRow>
                ) : leadsFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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

                      <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                        {lead.ultima_mensagem ?? "—"}
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
    </div>
  );
}