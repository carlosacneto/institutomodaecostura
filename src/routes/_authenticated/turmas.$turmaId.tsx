import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/turmas/$turmaId")({
  component: TurmaDetalhePage,
});

type Turma = {
  id: string;
  nome: string;
  curso: string | null;
  dias_semana: string | null;
  horario: string | null;
  professor: string | null;
  status: string;
};

type Aluno = {
  id: string;
  id_planilha: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  valor_mensalidade: number | null;
  dia_vencimento: number | null;
  status: string | null;
};

function TurmaDetalhePage() {
  const { turmaId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["turma-detalhe", turmaId],
    queryFn: async () => {
      const { data: turma, error: turmaError } = await supabase
        .from("turmas")
        .select("*")
        .eq("id", turmaId)
        .single();

      if (turmaError) throw turmaError;

      const { data: vinculos, error: vinculosError } = await supabase
        .from("aluno_turmas")
        .select("aluno_id")
        .eq("turma_id", turmaId);

      if (vinculosError) throw vinculosError;

      const alunoIds = (vinculos ?? []).map((v) => v.aluno_id);

      if (alunoIds.length === 0) {
        return {
          turma: turma as Turma,
          alunos: [] as Aluno[],
        };
      }

      const { data: alunos, error: alunosError } = await supabase
        .from("alunos")
        .select(
          "id, id_planilha, nome, telefone, email, cpf, valor_mensalidade, dia_vencimento, status"
        )
        .in("id", alunoIds)
        .order("nome");

      if (alunosError) throw alunosError;

      return {
        turma: turma as Turma,
        alunos: (alunos ?? []) as Aluno[],
      };
    },
  });

  const turma = data?.turma;
  const alunos = data?.alunos ?? [];
  const alunosAtivos = alunos.filter((aluno) => aluno.status === "ativo");
  const receitaPrevista = alunosAtivos.reduce(
    (soma, aluno) => soma + Number(aluno.valor_mensalidade ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/turmas">
              <ArrowLeft className="mr-2 size-4" />
              Voltar para turmas
            </Link>
          </Button>

          <div>
            <h1 className="font-display text-3xl font-semibold">
              {isLoading ? "Carregando turma..." : turma?.nome}
            </h1>

            <p className="mt-1 text-muted-foreground">
              Lista de alunos vinculados a esta turma.
            </p>
          </div>
        </div>

        {turma && (
          <Badge
            variant="secondary"
            className={turma.status === "ativa" ? "bg-success/15 text-success" : ""}
          >
            {turma.status}
          </Badge>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alunos vinculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 font-display text-3xl font-semibold">
              <Users className="size-6 text-primary" />
              {isLoading ? "—" : alunos.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alunos ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-semibold">
              {isLoading ? "—" : alunosAtivos.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-semibold">
              {isLoading ? "—" : formatBRL(receitaPrevista)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {turma?.horario ?? "—"}
            </div>
            <p className="text-sm text-muted-foreground">
              {turma?.dias_semana ?? "Dias não informados"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="font-display">
            Alunos da turma {turma?.nome ?? ""}
          </CardTitle>

          {turma && (
            <p className="text-sm text-muted-foreground">
              Curso: {turma.curso ?? "—"} · Professor(a):{" "}
              {turma.professor ?? "—"}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Venc.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Carregando alunos...
                    </TableCell>
                  </TableRow>
                ) : alunos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum aluno vinculado a esta turma.
                    </TableCell>
                  </TableRow>
                ) : (
                  alunos.map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell>
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {aluno.id_planilha ?? "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>{aluno.email ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">
                          {aluno.telefone ?? "—"}
                        </div>
                      </TableCell>

                      <TableCell>{aluno.cpf ?? "—"}</TableCell>

                      <TableCell>
                        {formatBRL(Number(aluno.valor_mensalidade ?? 0))}
                      </TableCell>

                      <TableCell>
                        {aluno.dia_vencimento
                          ? `Dia ${aluno.dia_vencimento}`
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            aluno.status === "ativo"
                              ? "bg-success/15 text-success"
                              : ""
                          }
                        >
                          {aluno.status ?? "—"}
                        </Badge>
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