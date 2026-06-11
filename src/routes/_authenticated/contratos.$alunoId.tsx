import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/contratos/$alunoId")({
  component: ContratoPage,
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
  email: string | null;
  telefone: string | null;
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
  if (valor == null) return "R$ ________";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(normalizarValor(valor));
}

function formatDateBR(value: string | null | undefined) {
  if (!value) return "____/____/________";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatDateExtenso(value: string | null | undefined) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "São Bernardo do Campo, ____ de __________________ de ______.";
  }

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  const ano = date.getFullYear();

  return `São Bernardo do Campo, ${dia} de ${mes} de ${ano}.`;
}

function formatCpf(cpf: string | null | undefined) {
  if (!cpf) return "____________________";

  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) return cpf;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatTelefone(telefone: string | null | undefined) {
  if (!telefone) return "____________________";

  const digits = telefone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

function getTurmas(aluno: Aluno | undefined) {
  const turmas = aluno?.aluno_turmas
    ?.map((item) => item.turmas?.nome)
    .filter(Boolean);

  if (turmas && turmas.length > 0) {
    return turmas.join(", ");
  }

  return "____________________";
}

function valorOuLinha(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : "____________________";
}

function ContratoPage() {
  const { alunoId } = Route.useParams();

  const {
    data: aluno,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contrato", alunoId],
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

  const matricula = aluno?.id_planilha ?? aluno?.id?.slice(0, 8) ?? "________";
  const nomeAluno = aluno?.nome ?? "____________________";
  const rgAluno = aluno?.rg ?? "____________________";
  const cpfAluno = formatCpf(aluno?.cpf);
  const telefoneAluno = formatTelefone(aluno?.telefone);
  const nascimentoAluno = formatDateBR(aluno?.data_nascimento);
  const cepAluno = aluno?.cep ?? "________";
  const enderecoAluno =
    aluno?.endereco ?? "____________________________________________";

  const cursoAluno = valorOuLinha(aluno?.curso);
  const turmaAluno = getTurmas(aluno);
  const duracaoCurso = valorOuLinha(aluno?.duracao_curso);
  const promocao = valorOuLinha(aluno?.promocao);
  const inicioAulas = formatDateBR(aluno?.inicio_aulas);
  const valorInscricao = formatBRL(aluno?.valor_inscricao);
  const dataInscricao = formatDateBR(aluno?.data_inscricao);
  const valorMensalidade = formatBRL(aluno?.valor_mensalidade);
  const vencimentoMensalidade = aluno?.dia_vencimento
    ? `dia ${aluno.dia_vencimento} de cada mês`
    : "dia ____ de cada mês";

  const dataContrato = formatDateExtenso(
    aluno?.data_inscricao ?? aluno?.data_matricula
  );

  return (
    <div className="space-y-6">
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 5mm;
          }

          @media print {
            html,
            body {
              width: 210mm;
              min-height: 297mm;
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

            .print-page {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              max-width: none !important;
              width: 100% !important;
            }

            .contract-paper {
              padding: 0 !important;
              margin: 0 !important;
              font-size: 10pt !important;
              line-height: 1.04 !important;
              color: black !important;
            }

            .contract-paper h1 {
              font-size: 8.2pt !important;
              line-height: 1.05 !important;
              margin: 0 0 2px 0 !important;
            }

            .contract-paper h2 {
              font-size: 7.2pt !important;
              line-height: 1.05 !important;
              margin: 2px 0 !important;
            }

            .contract-paper section {
              margin: 0 !important;
              padding: 0 !important;
            }

            .contract-paper p {
              margin: 1px 0 !important;
            }

            .contract-paper ol {
              margin: 0 !important;
              padding-left: 11px !important;
            }

            .contract-paper li {
              margin: 0.5px 0 !important;
            }

            .contract-paper .space-y-6,
            .contract-paper .space-y-4,
            .contract-paper .space-y-2 {
              gap: 0 !important;
            }

            .contract-paper strong {
              font-weight: 700 !important;
            }

            .assinaturas {
              margin-top: 5px !important;
            }

            .assinaturas p {
              margin-bottom: 14px !important;
            }

            .assinaturas-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 24px !important;
            }

            .assinatura-linha {
              padding-top: 2px !important;
              border-top: 1px solid black !important;
              text-align: center !important;
            }

            .page-break {
              page-break-before: auto !important;
            }
          }
        `}
      </style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/contratos">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para contratos
          </Link>
        </Button>

        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 size-4" />
          Imprimir contrato
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-muted-foreground">
          Carregando contrato...
        </div>
      ) : isError || !aluno ? (
        <div className="rounded-lg border bg-card p-8 text-destructive">
          Não foi possível carregar os dados do aluno.
        </div>
      ) : (
        <article className="print-page mx-auto max-w-4xl rounded-xl border bg-white p-8 shadow-[var(--shadow-soft)]">
          <div className="contract-paper space-y-6 text-[15px] leading-relaxed text-black">
            <section className="text-center">
              <h1 className="text-lg font-bold uppercase">
                Contrato de Prestação de Serviços de Ensino Matrícula {matricula}
              </h1>
            </section>

            <section className="text-justify">
              <p>
                <strong>{nomeAluno}</strong>, o contratante, aqui denominado
                responsável, RG: <strong>{rgAluno}</strong>, CPF:{" "}
                <strong>{cpfAluno}</strong>, nascido(a):{" "}
                <strong>{nascimentoAluno}</strong>, Telefones:{" "}
                <strong>{telefoneAluno}</strong>, reside CEP:{" "}
                <strong>{cepAluno}</strong> - <strong>{enderecoAluno}</strong> -
                ATELIÊ FASHION SP SERVIÇOS E COMÉRCIO, sediada à Rua Marechal
                Deodoro nº 2078, Centro, cidade São Bernardo do Campo, estado SP,
                inscrita no CNPJ/MF sob o nº 14.513.682/0001-40, contratada,
                aqui denominada escola, firmam o presente contrato mediante as
                condições e cláusulas a seguir:
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-center font-bold uppercase">
                Condições
              </h2>

              <ol className="space-y-1 uppercase">
                <li>
                  <strong>I. Curso:</strong> {cursoAluno}.
                </li>

                <li>
                  <strong>II. Turma:</strong> {turmaAluno}.
                </li>

                <li>
                  <strong>III. Duração do curso:</strong> {duracaoCurso}.
                </li>

                <li>
                  <strong>IV. Promoção:</strong> {promocao}.
                </li>

                <li>
                  <strong>V. Início das aulas:</strong> {inicioAulas}.
                </li>

                <li>
                  <strong>VI. Valor da inscrição:</strong> {valorInscricao} Data:{" "}
                  {dataInscricao}.
                </li>

                <li>
                  <strong>VII. Valor mensalidades:</strong> {valorMensalidade},
                  com vencimento {vencimentoMensalidade}, salvo cláusula 26 de
                  reajuste de mensalidade.
                </li>
              </ol>
            </section>

            <section className="space-y-2 text-justify">
              <p>
                <strong>1.</strong> A frequência às aulas deve ser nos dias e
                horários estipulados no contrato.
              </p>

              <p>
                <strong>2.</strong> Faltas às aulas terão a reposição de até 6
                seis aulas no curso total, passando disso será cobrado R$25,00
                por aula.
              </p>

              <p>
                <strong>3.</strong> Equipamentos: em caso de dúvida sobre uso,
                solicite o auxílio dos professores que irão orientá-lo
                adequadamente.
              </p>

              <p>
                <strong>4.</strong> Os dados cadastrais devem ser atualizados
                sempre que houver mudança de endereço ou telefone.
              </p>

              <p>
                <strong>5.</strong> Política, Economia, Esporte, Religião e Raça
                não devem ser discutidas em sala de aula.
              </p>

              <p>
                <strong>6.</strong> Devolução de valores: a escola não realiza
                devolução quando houver cancelamento do curso por iniciativa do
                aluno.
              </p>

              <p>
                <strong>7.</strong> Acompanhantes devem aguardar na sala de
                espera.
              </p>

              <p>
                <strong>8.</strong> Os materiais didáticos e de consumo devem ser
                adquiridos pelo aluno conforme a lista de materiais. A falta de
                algum item acarretará atraso ou paralisação no programa do curso
                e queda da qualidade de ensino.
              </p>

              <p>
                <strong>9.</strong> A rescisão de contrato deve ser feita por
                escrito e pessoalmente, devendo estar em dia com os pagamentos
                até a data do pedido. Será cobrada multa rescisória
                correspondente a uma mensalidade sem desconto.
              </p>

              <p>
                <strong>10.</strong> Autorizo o uso de imagem e material entre
                fotos e documentos, para ser utilizada em divulgação do Instituto
                Moda e Costura, Ateliê Fashion SP Serviços e Comércio Ltda,
                situada na Rua Marechal Deodoro nº 2078, São Bernardo do Campo —
                SP, e parceiros, sendo estas destinadas à divulgação ao público
                em geral. A presente autorização é concedida a título gratuito,
                abrangendo o uso da imagem acima mencionada em todo território
                nacional, das seguintes formas: redes sociais, outdoor, busdoor,
                folhetos em geral, folder de apresentação, mídia eletrônica,
                painéis, vídeos, televisão, cinema, programa de rádio, entre
                outros. Por esta ser a expressão de minha vontade, declaro que
                autorizo o uso acima descrito sem que nada haja a ser reclamado a
                título de direitos conexos à minha imagem ou a qualquer outro, e
                assino a presente autorização.
              </p>

              <p>
                <strong>11.</strong> Trabalhos e lições serão executados sob a
                orientação da professora em sala de aula.
              </p>

              <p>
                <strong>12.</strong> O programa de aulas do curso faz parte deste
                contrato e poderá sofrer atualizações e melhorias no transcorrer
                do curso. Peças que não são da programação serão consideradas
                peças extras, não substituindo as peças da programação.
              </p>

              <p>
                <strong>13.</strong> O sistema de ensino individualizado permite
                que o aluno desenvolva o aprendizado de acordo com seus
                interesses pessoais dentro dos temas propostos. O tempo de
                duração informado no programa de aulas poderá sofrer alteração de
                acordo com o desenvolvimento individual. O aluno deverá cumprir
                com os módulos descritos no programa para concluir o curso.
              </p>

              <p>
                <strong>14.</strong> Os cursos com sistema de ensino coletivo
                seguirão o programa de aulas de acordo com os temas propostos,
                tendo definidas datas de início e término das aulas conforme o
                número de módulos do programa.
              </p>

              <p>
                <strong>15.</strong> A conclusão do programa de curso completo
                confere ao aluno Assistência Técnica por 1 ano e gratuita nos
                temas abordados no programa. O Certificado de Conclusão é o
                documento que confere esse benefício.
              </p>

              <p>
                <strong>16.</strong> O TCC - Trabalho de Conclusão do Curso faz
                parte do programa de aulas e sua entrega é obrigatória para que
                haja avaliação de conclusão do curso. A não entrega do TCC é
                considerada desistência do curso, vigorando a cláusula 9 deste
                contrato.
              </p>

              <p>
                <strong>17.</strong> Os materiais e peças solicitados no TCC
                devem ser entregues ao atendimento no dia do pedido da conclusão
                do curso. O aluno deve estar em dia com os pagamentos à escola.
              </p>

              <p>
                <strong>18.</strong> O Certificado de Conclusão é emitido para o
                aluno que obtiver nota mínima 7,0. O aluno que não atingir a nota
                mínima realizará reciclagem nas matérias necessárias. Nos cursos
                fechados de turma coletiva haverá reprovação para nota inferior a
                7,0 e frequência menor que 75% das aulas, sendo nestes casos
                necessária a realização de novo curso completo.
              </p>

              <p>
                <strong>19.</strong> Os trabalhos e peças confeccionadas para o
                TCC devem ser apresentados no final do curso ou no decorrer para
                correção.
              </p>

              <p>
                <strong>20.</strong> As transferências de turma, curso ou
                horário poderão ser efetuadas junto ao atendimento sem taxa de
                serviços vigentes.
              </p>

              <p>
                <strong>21.</strong> Os pagamentos das mensalidades são efetuados
                através de boleto bancário ou Pix. Caso não esteja de posse do
                boleto até dia 1º do mês, solicite segunda via.
              </p>

              <p>
                <strong>22.</strong> O vencimento das mensalidades ocorre dia 1º
                de cada mês e a escola fornece boleto com prazo prorrogado até
                dia 10. Após esse prazo haverá cobrança de multa de 10% pelo
                atraso no pagamento.
              </p>

              <p>
                <strong>23.</strong> O atraso no pagamento: após o dia 20 do mês
                de vencimento, o aluno com mensalidade em atraso deverá
                comparecer ao atendimento para pagamento da mensalidade ou
                posicionamento do mesmo. A falta desse procedimento poderá
                ocasionar a disponibilização da vaga para uma nova matrícula, sem
                prejuízo da cláusula 9 deste contrato.
              </p>

              <p>
                <strong>24.</strong> As férias dos professores ocorrem duas vezes
                ao ano, nos meses de julho e dezembro. As aulas serão paralisadas
                por 15 dias nesses períodos sem direito a reposição.
              </p>

              <p>
                <strong>25.</strong> O comércio de produtos e serviços não é
                permitido nas dependências da escola.
              </p>

              <p>
                <strong>26.</strong> O reajuste de mensalidades será efetuado
                anualmente no mês de janeiro com base nos custos internos,
                reajustes salariais e índices inflacionários acumulados no ano
                anterior, independentemente do mês em que o aluno ingresse na
                escola.
              </p>

              <p>
                <strong>27.</strong> As partes elegem o foro da cidade de São
                Bernardo do Campo como único competente para dirimir qualquer
                questão oriunda do presente, em detrimento de qualquer outro por
                mais privilegiado que possa ser.
              </p>
            </section>

            <section className="space-y-6 text-justify">
              <p>
                O aluno declara que recebeu juntamente com uma cópia deste
                contrato, o programa completo do curso e a lista de materiais que
                deverá providenciar para utilização nas aulas e realização dos
                trabalhos durante o desenvolvimento do curso.
              </p>

              <p>{dataContrato}</p>

              <div className="assinaturas">
                <p className="mb-8 font-semibold">Assinaturas:</p>

                <div className="assinaturas-grid grid gap-12 sm:grid-cols-2">
                  <div className="text-center">
                    <div className="assinatura-linha border-t border-black pt-2">
                      Responsável: Instituto Moda e Costura
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="assinatura-linha border-t border-black pt-2">
                      Aluno/Responsável: {nomeAluno}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      )}
    </div>
  );
}