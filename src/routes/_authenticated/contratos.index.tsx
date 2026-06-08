import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/contratos/")({
  component: ContratosPage,
});

type Aluno = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  status: string;
};

function ContratosPage() {
  const {
    data: alunos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contratos", "alunos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("id,nome,email,telefone,cpf,status")
        .order("nome");

      if (error) throw error;

      return data as Aluno[];
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Contratos</h1>
          <p className="mt-1 text-muted-foreground">
            Gere contratos para os alunos cadastrados.
          </p>
        </div>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr]">
            <div className="text-sm text-muted-foreground">
              Clique em "Gerar contrato" para criar um contrato de matrícula
              para o aluno.
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-destructive"
                    >
                      Erro ao carregar alunos.
                    </TableCell>
                  </TableRow>
                ) : alunos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum aluno encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  alunos.map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell className="font-medium">
                        {aluno.nome}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        <div>{aluno.email ?? "—"}</div>
                        <div>{aluno.telefone ?? "—"}</div>
                      </TableCell>

                      <TableCell>{aluno.cpf ?? "—"}</TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {aluno.status ?? "—"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button asChild>
                          <Link
                            to="/contratos/$alunoId"
                            params={{ alunoId: String(aluno.id) }}
                          >
                            Gerar contrato
                          </Link>
                        </Button>
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