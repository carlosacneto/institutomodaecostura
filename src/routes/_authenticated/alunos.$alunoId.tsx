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
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Receipt,
  User,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/alunos/$alunoId")({
  component: AlunoDetalhePage,
});

type Turma = {
  id: string;
  nome: string;
};

type AlunoTurma = {
  turma_id: string;
  turmas: Turma | null;
};

type Aluno = {
  id: string;
  id_planilha: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  cep: string | null;
  endereco: string | null;
  data_nascimento: string | null;
  dia_vencimento: number | null;
  status: string | null;
  data_matricula: string | null;
  observacoes: string | null;
  turma_id: string | null;
  valor_mensalidade: number | null;
  curso: string | null;
  duracao_curso: string | null;
  promocao: string | null;
  valor_inscricao: number | null;
  data_inscricao: string | null;
  inicio_aulas: string | null;
  aluno_turmas?: AlunoTurma[];
};

type Mensalidade = {
  id: string;
  aluno_id: string | null;
  nome_aluno: string | null;
  telefone: string | null;
  turma: string | null;
  valor: number | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  status: string | null;
  observacoes: string | null;
};

function normalizarValor(valor: number | null | undefined): number {
  if (valor == null) return 0;
  return valor >= 1000 ? valor / 100 : valor;
}

function formatBRL(valor: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(normalizarValor(valor));
}

function formatDateBR(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatCpf(cpf: string | null | undefined) {
  if (!cpf) return "—";

  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) return cpf;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatTelefone(telefone: string | null | undefined) {
  if (!telefone) return "—";

  const digits = telefone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

function statusAlunoClass(status: string | null | undefined) {
  const valor = status?.toLowerCase();

  if (valor === "ativo") {
    return "bg-success/15 text-success";
  }

  if (valor === "inativo") {
    return "bg-muted text-muted-foreground";
  }

  if (valor === "trancado" || valor === "aberto") {
    return "bg-warning/20 text-warning-foreground";
  }

  return "bg-muted text-muted-foreground";
}

function statusMensalidadeClass(status: string | null | undefined) {
  const valor = status?.toLowerCase();

  if (valor === "pago") {
    return "bg-success/15 text-success";
  }

  if (valor === "atrasado") {
    return "bg-destructive/15 text-destructive";
  }

  if (valor === "pendente" || valor === "aberto") {
    return "bg-warning/20 text-warning-foreground";
  }

  return "bg-muted text-muted-foreground";
}

function valorTexto(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : "—";
}

function AlunoDetalhePage() {
  const { alunoId } = Route.useParams();

  const {
    data: aluno,
    isLoading: carregandoAluno,
    isError: erroAluno,
  } = useQuery({
    queryKey: ["aluno-detalhe", alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select(`
          *,
          aluno_turmas (
            turma_id,
            turmas (
              id,
              nome
            )
          )
        `)
        .eq("id", alunoId)
        .single();

      if (error) throw error;

      return data as Aluno;
    },
    enabled: Boolean(alunoId),
  });

  const {
    data: mensalidades = [],
    isLoading: carregandoMensalidades,
    isError: erroMensalidades,
  } = useQuery({
    queryKey: ["aluno-mensalidades", alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mensalidades")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data_vencimento", { ascending: false });

      if (error) throw error;

      return (data ?? []) as Mensalidade[];
    },
    enabled: Boolean(alunoId),
  });

  const mensalidadesPagas = mensalidades.filter(
    (m) => m.status?.toLowerCase() === "pago"
  );

  const mensalidadesEmAberto = mensalidades.filter(
    (m) => m.status?.toLowerCase() !== "pago"
  );

  const totalPago = mensalidadesPagas.reduce(
    (soma, mensalidade) => soma + normalizarValor(mensalidade.valor),
    0
  );

  const totalEmAberto = mensalidadesEmAberto.reduce(
    (soma, mensalidade) => soma + normalizarValor(mensalidade.valor),
    0
  );

  const totalGeral = mensalidades.reduce(
    (soma, mensalidade) => soma + normalizarValor(mensalidade.valor),
    0
  );

  const turmas =
    aluno?.aluno_turmas
      ?.map((item) => item.turmas?.nome)
      .filter(Boolean)
      .join(", ") || "—";

  if (carregandoAluno) {
    return (
      <div className="rounded-lg border bg-card p-8 text-muted-foreground">
        Carregando dados do aluno...
      </div>
    );
  }

  if (erroAluno || !aluno) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/alunos">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para alunos
          </Link>
        </Button>

        <div className="rounded-lg border bg-card p-8 text-destructive">
          Não foi possível carregar os dados do aluno.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/alunos">
              <ArrowLeft className="mr-2 size-4" />
              Voltar para alunos
            </Link>
          </Button>

          <div>
            <h1 className="font-display text-3xl font-semibold">
              {aluno.nome}
            </h1>

            <p className="mt-1 text-muted-foreground">
              Perfil completo do aluno e histórico financeiro.
            </p>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link to="/contratos/$alunoId" params={{ alunoId: aluno.id }}>
            <FileText className="mr-2 size-4" />
            Ver contrato
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="size-4" />
              Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Badge className={statusAlunoClass(aluno.status)}>
              {aluno.status ?? "—"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="size-4" />
              Total pago
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">{formatBRL(totalPago)}</div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="size-4" />
              Em aberto
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold text-destructive">
              {formatBRL(totalEmAberto)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <GraduationCap className="size-4" />
              Mensalidade
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">
              {aluno.valor_mensalidade != null
                ? formatBRL(aluno.valor_mensalidade)
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Dados cadastrais</CardTitle>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Matrícula / ID
                </dt>
                <dd>{aluno.id_planilha ?? "—"}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  CPF
                </dt>
                <dd>{formatCpf(aluno.cpf)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  RG
                </dt>
                <dd>{aluno.rg ?? "—"}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Nascimento
                </dt>
                <dd>{formatDateBR(aluno.data_nascimento)}</dd>
              </div>

              <div>
                <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Phone className="size-3" />
                  Telefone
                </dt>
                <dd>{formatTelefone(aluno.telefone)}</dd>
              </div>

              <div>
                <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Mail className="size-3" />
                  E-mail
                </dt>
                <dd>{aluno.email ?? "—"}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  CEP
                </dt>
                <dd>{aluno.cep ?? "—"}</dd>
              </div>

              <div>
                <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <CalendarDays className="size-3" />
                  Matrícula
                </dt>
                <dd>{formatDateBR(aluno.data_matricula)}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <MapPin className="size-3" />
                  Endereço
                </dt>
                <dd>{aluno.endereco ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Dados do curso</CardTitle>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Curso
                </dt>
                <dd>{valorTexto(aluno.curso)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Duração
                </dt>
                <dd>{valorTexto(aluno.duracao_curso)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Turmas
                </dt>
                <dd>{turmas}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Início das aulas
                </dt>
                <dd>{formatDateBR(aluno.inicio_aulas)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Valor inscrição
                </dt>
                <dd>
                  {aluno.valor_inscricao != null
                    ? formatBRL(aluno.valor_inscricao)
                    : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Data inscrição
                </dt>
                <dd>{formatDateBR(aluno.data_inscricao)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Dia vencimento
                </dt>
                <dd>
                  {aluno.dia_vencimento ? `Dia ${aluno.dia_vencimento}` : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Promoção
                </dt>
                <dd>{valorTexto(aluno.promocao)}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Observações
                </dt>
                <dd>{valorTexto(aluno.observacoes)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>Histórico financeiro</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Mensalidades</div>
              <div className="text-xl font-semibold">
                {mensalidades.length}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Valor total</div>
              <div className="text-xl font-semibold">
                {formatBRL(totalGeral)}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">Pendências</div>
              <div className="text-xl font-semibold text-destructive">
                {mensalidadesEmAberto.length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {carregandoMensalidades ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Carregando histórico financeiro...
                    </TableCell>
                  </TableRow>
                ) : erroMensalidades ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-destructive"
                    >
                      Erro ao carregar mensalidades.
                    </TableCell>
                  </TableRow>
                ) : mensalidades.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma mensalidade encontrada para este aluno.
                    </TableCell>
                  </TableRow>
                ) : (
                  mensalidades.map((mensalidade) => (
                    <TableRow key={mensalidade.id}>
                      <TableCell>
                        {formatDateBR(mensalidade.data_vencimento)}
                      </TableCell>

                      <TableCell>
                        {formatDateBR(mensalidade.data_pagamento)}
                      </TableCell>

                      <TableCell>{formatBRL(mensalidade.valor)}</TableCell>

                      <TableCell>
                        {mensalidade.forma_pagamento ?? "—"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={statusMensalidadeClass(
                            mensalidade.status
                          )}
                        >
                          {mensalidade.status ?? "—"}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                        {mensalidade.observacoes ?? "—"}
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