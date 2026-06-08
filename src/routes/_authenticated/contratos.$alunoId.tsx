import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/contratos/$alunoId")({
  component: ContratoPage,
});

type Aluno = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  status: string | null;
};

function ContratoPage() {
  const { alunoId } = Route.useParams();

  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["contrato", alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("id,nome,email,telefone,cpf,status")
        .eq("id", alunoId)
        .single();

      if (error) throw error;
      return data as Aluno;
    },
    enabled: Boolean(alunoId),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/contratos">
              <ArrowLeft className="mr-2 size-4" /> Voltar para contratos
            </Link>
          </Button>

          <div>
            <h1 className="font-display text-3xl font-semibold">
              {isLoading ? "Carregando contrato..." : aluno?.nome ?? "Contrato do aluno"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Visualização do contrato individual do aluno.
            </p>
          </div>
        </div>

        <Button size="sm" onClick={() => window.print()}>
          Imprimir contrato
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Dados do aluno</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando dados do aluno...</p>
            ) : isError || !aluno ? (
              <p className="text-destructive">Não foi possível carregar o aluno.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Nome</div>
                  <div className="text-lg font-semibold">{aluno.nome}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">CPF</div>
                  <div>{aluno.cpf ?? "—"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Telefone</div>
                  <div>{aluno.telefone ?? "—"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">E-mail</div>
                  <div>{aluno.email ?? "—"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <Badge variant="secondary">{aluno.status ?? "—"}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Dados da escola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Instituição</div>
                Instituto Moda e Costura
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Descrição</div>
                Escola de Costura
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Endereço</div>
                Rua da Moda, 123 · Centro · São Paulo, SP
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Contato</div>
                contato@modaecostura.com · (11) 4000-1234
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
