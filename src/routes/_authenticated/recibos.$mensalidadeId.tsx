import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recibos/$mensalidadeId")({
  component: ReciboPage,
});

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
  if (!value) return "____/____/____";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getMesAno(value: string | null | undefined) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "Recibo de Mensalidade";
  }

  const mes = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  const ano = date.getFullYear();

  const mesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);

  return `Recibo de ${mesFormatado} ${ano}`;
}

function getTurmas(aluno: Aluno | null | undefined, mensalidade: Mensalidade) {
  const turmasAluno = aluno?.aluno_turmas
    ?.map((item) => item.turmas?.nome)
    .filter(Boolean);

  if (turmasAluno && turmasAluno.length > 0) {
    return turmasAluno.join(", ");
  }

  if (mensalidade.turma) {
    return mensalidade.turma;
  }

  return "____________________";
}

function ReciboBox({
  mensalidade,
  aluno,
}: {
  mensalidade: Mensalidade;
  aluno: Aluno | null;
}) {
  const nomeAluno =
    aluno?.nome ?? mensalidade.nome_aluno ?? "____________________________";

  const turma = getTurmas(aluno, mensalidade);

  const ra = aluno?.id_planilha ?? "________";

  const dataPagamento =
    mensalidade.data_pagamento ?? mensalidade.data_vencimento ?? null;

  const titulo = getMesAno(dataPagamento);

  const valor = formatBRL(mensalidade.valor);

  return (
    <section className="recibo-box">
      <div className="recibo-logo">
        <img
          src="/logo-instituto.png"
          alt="Instituto Moda e Costura"
          className="recibo-logo-img"
        />
      </div>

      <h2>{titulo}</h2>

      <div className="recibo-tabela">
        <div className="cell">
          <strong>NOME:</strong> {nomeAluno}
        </div>

        <div className="cell">
          <strong>TURMA:</strong> {turma}
        </div>

        <div className="cell">
          <strong>R.A:</strong> {ra}
        </div>

        <div className="cell">
          <strong>DATA:</strong> {formatDateBR(dataPagamento)}
        </div>

        <div className="cell cell-valor">
          <strong>Mensalidade:</strong> {valor}
        </div>

        <div className="cell cell-visto">
          <strong>Visto do Instituto:</strong>
        </div>
      </div>

      <div className="recibo-rodape">
        <p>
          Rua: Marechal Deodoro, 2078 salas 01 e 02 – Centro São Bernardo do
          Campo
        </p>
        <p>Ateliê Fashion SP</p>
        <p>CNPJ: 14.513.682/0001-40</p>
      </div>
    </section>
  );
}

function ReciboPage() {
  const { mensalidadeId } = Route.useParams();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recibo", mensalidadeId],
    queryFn: async () => {
      const { data: mensalidade, error: mensalidadeError } = await supabase
        .from("mensalidades")
        .select("*")
        .eq("id", mensalidadeId)
        .single();

      if (mensalidadeError) throw mensalidadeError;

      const mensalidadeTyped = mensalidade as Mensalidade;

      let aluno: Aluno | null = null;

      if (mensalidadeTyped.aluno_id) {
        const { data: alunoData, error: alunoError } = await supabase
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
          .eq("id", mensalidadeTyped.aluno_id)
          .single();

        if (alunoError) throw alunoError;

        aluno = alunoData as Aluno;
      }

      return {
        mensalidade: mensalidadeTyped,
        aluno,
      };
    },
    enabled: Boolean(mensalidadeId),
  });

  return (
    <div className="space-y-6">
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          .recibo-page {
            background: white;
            color: black;
          }

          .recibo-paper {
            width: 210mm;
            max-width: 100%;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 12mm;
            color: black;
          }

          .recibo-box {
            width: 100%;
            margin: 0 auto 16mm auto;
            font-family: Arial, Helvetica, sans-serif;
            color: black;
          }

          .recibo-logo {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 4mm;
          }

          .recibo-logo-img {
            width: 24mm;
            height: 24mm;
            object-fit: contain;
            display: block;
          }

          .recibo-box h2 {
            text-align: center;
            font-size: 12pt;
            font-weight: 700;
            margin: 0 0 4mm 0;
          }

          .recibo-tabela {
            display: grid;
            grid-template-columns: 1fr 0.7fr;
            border-top: 1px solid black;
            border-left: 1px solid black;
          }

          .cell {
            min-height: 14mm;
            border-right: 1px solid black;
            border-bottom: 1px solid black;
            padding: 2mm;
            font-size: 8.5pt;
          }

          .cell strong {
            font-weight: 700;
          }

          .cell-valor {
            min-height: 16mm;
          }

          .cell-visto {
            min-height: 16mm;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            font-size: 8pt;
          }

          .recibo-rodape {
            margin-top: 3mm;
            font-size: 7.5pt;
            line-height: 1.35;
          }

          .recibo-rodape p {
            margin: 0;
          }

          @media print {
            body {
              background: white !important;
            }

            aside,
            header,
            .no-print {
              display: none !important;
            }

            main {
              padding: 0 !important;
              margin: 0 !important;
              max-width: none !important;
              width: 100% !important;
            }

            .recibo-page {
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }

            .recibo-paper {
              width: auto !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }

            .recibo-box {
              break-inside: avoid;
              page-break-inside: avoid;
              margin-bottom: 14mm !important;
            }

            .recibo-logo-img {
              width: 22mm !important;
              height: 22mm !important;
            }
          }
        `}
      </style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pagamentos">
              <ArrowLeft className="mr-2 size-4" />
              Voltar para pagamentos
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/alunos">Voltar para alunos</Link>
          </Button>
        </div>

        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Imprimir recibo
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-muted-foreground">
          Carregando recibo...
        </div>
      ) : isError || !data ? (
        <div className="rounded-lg border bg-card p-8 text-destructive">
          Não foi possível carregar o recibo.
        </div>
      ) : (
        <article className="recibo-page rounded-xl border bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="recibo-paper">
            <ReciboBox mensalidade={data.mensalidade} aluno={data.aluno} />

            <ReciboBox mensalidade={data.mensalidade} aluno={data.aluno} />
          </div>
        </article>
      )}
    </div>
  );
}