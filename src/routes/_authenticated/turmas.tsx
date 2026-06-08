import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserPlus,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/turmas")({
  component: TurmasPage,
});

type Turma = {
  id: string;
  nome: string;
  curso: string | null;
  dias_semana: string | null;
  horario: string | null;
  professor: string | null;
  status: string;
  limite_vagas: number | null;
};

type Aluno = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: string | null;
};

type AlunoTurma = {
  id: string;
  aluno_id: string;
  turma_id: string;
  status: string | null;
  alunos: Aluno | null;
};

type VinculoTurma = {
  turma_id: string;
  aluno_id: string;
};

function TurmasPage() {
  const qc = useQueryClient();
  const supabaseAny = supabase as any;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);

  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [alunoParaAdicionar, setAlunoParaAdicionar] = useState("");

  const { data: turmas = [], isLoading } = useQuery({
    queryKey: ["turmas-full"],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("turmas")
        .select("*")
        .order("nome");

      if (error) throw error;

      return (data ?? []) as Turma[];
    },
  });

  const { data: vinculosTurmas = [] } = useQuery({
    queryKey: ["contagem-alunos-por-turma"],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("aluno_turmas")
        .select("turma_id, aluno_id");

      if (error) throw error;

      return (data ?? []) as VinculoTurma[];
    },
  });

  const quantidadeAlunosPorTurma = useMemo(() => {
    const contagem = new Map<string, number>();

    vinculosTurmas.forEach((vinculo) => {
      const quantidadeAtual = contagem.get(vinculo.turma_id) ?? 0;
      contagem.set(vinculo.turma_id, quantidadeAtual + 1);
    });

    return contagem;
  }, [vinculosTurmas]);

  const { data: todosAlunos = [], isLoading: carregandoAlunos } = useQuery({
    queryKey: ["alunos-para-turmas"],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("alunos")
        .select("id, nome, telefone, email, status")
        .order("nome");

      if (error) throw error;

      return (data ?? []) as Aluno[];
    },
  });

  const {
    data: alunosDaTurma = [],
    isLoading: carregandoAlunosDaTurma,
    isError: erroAlunosDaTurma,
  } = useQuery({
    queryKey: ["alunos-da-turma", turmaSelecionada?.id],
    enabled: !!turmaSelecionada?.id,
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from("aluno_turmas")
        .select(
          `
          id,
          aluno_id,
          turma_id,
          status,
          alunos (
            id,
            nome,
            telefone,
            email,
            status
          )
        `
        )
        .eq("turma_id", turmaSelecionada?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data ?? []) as AlunoTurma[];
    },
  });

  const alunosDisponiveis = useMemo(() => {
    const idsAlunosNaTurma = new Set(
      alunosDaTurma.map((vinculo) => vinculo.aluno_id)
    );

    return todosAlunos.filter((aluno) => !idsAlunosNaTurma.has(aluno.id));
  }, [todosAlunos, alunosDaTurma]);

  const deleteTurma = useMutation({
    mutationFn: async (turma: Turma) => {
      const { error } = await supabaseAny.rpc("excluir_turma_segura", {
        p_turma_id: turma.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Turma excluída com sucesso");
      qc.invalidateQueries({ queryKey: ["turmas-full"] });
      qc.invalidateQueries({ queryKey: ["alunos-para-turmas"] });
      qc.invalidateQueries({ queryKey: ["contagem-alunos-por-turma"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const adicionarAlunoNaTurma = useMutation({
    mutationFn: async () => {
      if (!turmaSelecionada) {
        throw new Error("Nenhuma turma selecionada.");
      }

      if (!alunoParaAdicionar) {
        throw new Error("Selecione um aluno para adicionar.");
      }

      const limiteVagas = turmaSelecionada.limite_vagas ?? 8;
      const quantidadeAtual = alunosDaTurma.length;

      if (quantidadeAtual >= limiteVagas) {
        throw new Error(
          `A turma ${turmaSelecionada.nome} já atingiu o limite de ${limiteVagas} vagas.`
        );
      }

      const { error } = await supabaseAny.from("aluno_turmas").insert({
        aluno_id: alunoParaAdicionar,
        turma_id: turmaSelecionada.id,
        status: "ativo",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aluno incluído na turma");
      setAlunoParaAdicionar("");
      qc.invalidateQueries({
        queryKey: ["alunos-da-turma", turmaSelecionada?.id],
      });
      qc.invalidateQueries({ queryKey: ["alunos-para-turmas"] });
      qc.invalidateQueries({ queryKey: ["contagem-alunos-por-turma"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const removerAlunoDaTurma = useMutation({
    mutationFn: async (vinculo: AlunoTurma) => {
      const { error } = await supabaseAny
        .from("aluno_turmas")
        .delete()
        .eq("id", vinculo.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aluno removido da turma");
      qc.invalidateQueries({
        queryKey: ["alunos-da-turma", turmaSelecionada?.id],
      });
      qc.invalidateQueries({ queryKey: ["alunos-para-turmas"] });
      qc.invalidateQueries({ queryKey: ["contagem-alunos-por-turma"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  function handleDelete(turma: Turma) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a turma ${turma.nome}?\n\nEssa ação vai remover a turma dos alunos vinculados a ela.`
    );

    if (!confirmar) return;

    deleteTurma.mutate(turma);
  }

  function abrirDetalhesTurma(turma: Turma) {
    setTurmaSelecionada(turma);
    setAlunoParaAdicionar("");
  }

  function fecharDetalhesTurma() {
    setTurmaSelecionada(null);
    setAlunoParaAdicionar("");
  }

  function getQuantidadeAlunos(turmaId: string) {
    return quantidadeAlunosPorTurma.get(turmaId) ?? 0;
  }

  function getLimiteVagas(turma: Turma) {
    return turma.limite_vagas ?? 8;
  }

  function getVagasDisponiveis(turma: Turma) {
    const quantidadeAlunos = getQuantidadeAlunos(turma.id);
    const limiteVagas = getLimiteVagas(turma);

    return Math.max(limiteVagas - quantidadeAlunos, 0);
  }

  function turmaEstaLotada(turma: Turma) {
    return getQuantidadeAlunos(turma.id) >= getLimiteVagas(turma);
  }

  const limiteTurmaSelecionada = turmaSelecionada
    ? getLimiteVagas(turmaSelecionada)
    : 8;

  const turmaSelecionadaLotada = turmaSelecionada
    ? alunosDaTurma.length >= limiteTurmaSelecionada
    : false;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Turmas</h1>
          <p className="text-muted-foreground mt-1">
            Cursos, horários e professores.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4 mr-2" />
          Nova turma
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : turmas.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhuma turma ainda. Crie a primeira.
          </p>
        ) : (
          turmas.map((t) => {
            const quantidadeAlunos = getQuantidadeAlunos(t.id);
            const limiteVagas = getLimiteVagas(t);
            const vagasDisponiveis = getVagasDisponiveis(t);
            const lotada = turmaEstaLotada(t);

            return (
              <Card
                key={t.id}
                onClick={() => abrirDetalhesTurma(t)}
                className="cursor-pointer border-border/60 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="flex-row items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {t.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.curso ?? "—"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        t.status === "ativa" ? "bg-success/15 text-success" : ""
                      }
                    >
                      {t.status}
                    </Badge>

                    <Badge
                      variant={lotada ? "destructive" : "outline"}
                      className="gap-1"
                    >
                      <Users className="size-3" />
                      {quantidadeAlunos}/{limiteVagas} alunos
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Dias:</span>{" "}
                    {t.dias_semana ?? "—"}
                  </p>

                  <p>
                    <span className="text-muted-foreground">Horário:</span>{" "}
                    {t.horario ?? "—"}
                  </p>

                  <p>
                    <span className="text-muted-foreground">
                      Professor(a):
                    </span>{" "}
                    {t.professor ?? "—"}
                  </p>

                  <p>
                    <span className="text-muted-foreground">Vagas:</span>{" "}
                    {lotada
                      ? "Turma lotada"
                      : `${vagasDisponiveis} vaga${
                          vagasDisponiveis === 1 ? "" : "s"
                        } disponível${vagasDisponiveis === 1 ? "" : "is"}`}
                  </p>

                  <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    Clique no card para ver os alunos da turma
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditing(t);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4 mr-1" />
                      Editar
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteTurma.isPending}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(t);
                      }}
                    >
                      <Trash2 className="size-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <TurmaForm
        open={open}
        onOpenChange={setOpen}
        turma={editing}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["turmas-full"] });
          qc.invalidateQueries({ queryKey: ["contagem-alunos-por-turma"] });
        }}
      />

      <Dialog open={!!turmaSelecionada} onOpenChange={fecharDetalhesTurma}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Turma — {turmaSelecionada?.nome}
            </DialogTitle>
          </DialogHeader>

          {turmaSelecionada && (
            <div className="space-y-6">
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div>
                  <strong>Curso:</strong> {turmaSelecionada.curso ?? "—"}
                </div>

                <div>
                  <strong>Status:</strong> {turmaSelecionada.status ?? "—"}
                </div>

                <div>
                  <strong>Dias:</strong> {turmaSelecionada.dias_semana ?? "—"}
                </div>

                <div>
                  <strong>Horário:</strong> {turmaSelecionada.horario ?? "—"}
                </div>

                <div>
                  <strong>Limite de vagas:</strong> {limiteTurmaSelecionada}
                </div>

                <div>
                  <strong>Vagas disponíveis:</strong>{" "}
                  {Math.max(limiteTurmaSelecionada - alunosDaTurma.length, 0)}
                </div>

                <div className="sm:col-span-2">
                  <strong>Professor(a):</strong>{" "}
                  {turmaSelecionada.professor ?? "—"}
                </div>
              </div>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      Alunos matriculados
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {alunosDaTurma.length}/{limiteTurmaSelecionada} aluno
                      {alunosDaTurma.length === 1 ? "" : "s"} nesta turma.
                    </p>
                  </div>

                  <Badge
                    variant={turmaSelecionadaLotada ? "destructive" : "secondary"}
                  >
                    {turmaSelecionadaLotada
                      ? "Turma lotada"
                      : `${Math.max(
                          limiteTurmaSelecionada - alunosDaTurma.length,
                          0
                        )} vaga${
                          Math.max(
                            limiteTurmaSelecionada - alunosDaTurma.length,
                            0
                          ) === 1
                            ? ""
                            : "s"
                        } disponível${
                          Math.max(
                            limiteTurmaSelecionada - alunosDaTurma.length,
                            0
                          ) === 1
                            ? ""
                            : "is"
                        }`}
                  </Badge>
                </div>

                <div className="rounded-lg border">
                  {carregandoAlunosDaTurma ? (
                    <p className="p-4 text-sm text-muted-foreground">
                      Carregando alunos...
                    </p>
                  ) : erroAlunosDaTurma ? (
                    <p className="p-4 text-sm text-destructive">
                      Erro ao carregar alunos da turma.
                    </p>
                  ) : alunosDaTurma.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">
                      Nenhum aluno matriculado nesta turma.
                    </p>
                  ) : (
                    <div className="divide-y">
                      {alunosDaTurma.map((vinculo) => (
                        <div
                          key={vinculo.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-4"
                        >
                          <div className="space-y-1">
                            <div className="font-medium">
                              {vinculo.alunos?.nome ?? "Aluno sem nome"}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {vinculo.alunos?.telefone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="size-3" />
                                  {vinculo.alunos.telefone}
                                </span>
                              )}

                              {vinculo.alunos?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="size-3" />
                                  {vinculo.alunos.email}
                                </span>
                              )}
                            </div>

                            <Badge variant="secondary">
                              {vinculo.status ?? "ativo"}
                            </Badge>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={removerAlunoDaTurma.isPending}
                            onClick={() => {
                              const confirmar = window.confirm(
                                `Remover ${
                                  vinculo.alunos?.nome ?? "este aluno"
                                } da turma ${turmaSelecionada.nome}?`
                              );

                              if (!confirmar) return;

                              removerAlunoDaTurma.mutate(vinculo);
                            }}
                          >
                            <X className="mr-1 size-4" />
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-3 rounded-lg border p-4">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Incluir aluno nesta turma
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {turmaSelecionadaLotada
                      ? "Esta turma atingiu o limite máximo de alunos."
                      : "Selecione um aluno já cadastrado para vincular a esta turma."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Select
                    value={alunoParaAdicionar}
                    onValueChange={setAlunoParaAdicionar}
                    disabled={
                      carregandoAlunos ||
                      adicionarAlunoNaTurma.isPending ||
                      alunosDisponiveis.length === 0 ||
                      turmaSelecionadaLotada
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          turmaSelecionadaLotada
                            ? "Turma lotada"
                            : alunosDisponiveis.length === 0
                              ? "Nenhum aluno disponível"
                              : "Selecione um aluno"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {alunosDisponiveis.map((aluno) => (
                        <SelectItem key={aluno.id} value={aluno.id}>
                          {aluno.nome}
                          {aluno.telefone ? ` — ${aluno.telefone}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => adicionarAlunoNaTurma.mutate()}
                    disabled={
                      !alunoParaAdicionar ||
                      adicionarAlunoNaTurma.isPending ||
                      turmaSelecionadaLotada
                    }
                  >
                    <UserPlus className="mr-2 size-4" />
                    Incluir
                  </Button>
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TurmaForm({
  open,
  onOpenChange,
  turma,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  turma: Turma | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Turma>>({});

  useEffect(() => {
    setForm(turma ?? { status: "ativa", limite_vagas: 8 });
  }, [turma]);

  const save = useMutation({
    mutationFn: async () => {
      const limiteVagas = Number(form.limite_vagas ?? 8);

      const payload = {
        nome: form.nome?.trim().toUpperCase() ?? "",
        curso: form.curso?.trim() || null,
        professor: form.professor?.trim() || null,
        dias_semana: form.dias_semana?.trim() || null,
        horario: form.horario?.trim() || null,
        status: form.status || "ativa",
        limite_vagas:
          Number.isFinite(limiteVagas) && limiteVagas > 0 ? limiteVagas : 8,
      };

      if (turma) {
        const { error } = await supabase
          .from("turmas")
          .update(payload)
          .eq("id", turma.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("turmas").insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Turma salva");
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">
            {turma ? "Editar turma" : "Nova turma"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.nome ?? ""}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: C415"
            />
          </div>

          <div className="space-y-2">
            <Label>Curso</Label>
            <Input
              value={form.curso ?? ""}
              onChange={(e) => setForm({ ...form, curso: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Professor(a)</Label>
            <Input
              value={form.professor ?? ""}
              onChange={(e) => setForm({ ...form, professor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Dias da semana</Label>
            <Input
              placeholder="Seg/Qua"
              value={form.dias_semana ?? ""}
              onChange={(e) =>
                setForm({ ...form, dias_semana: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Horário</Label>
            <Input
              placeholder="19h-21h"
              value={form.horario ?? ""}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Limite de vagas</Label>
            <Input
              type="number"
              min="1"
              max="8"
              value={form.limite_vagas ?? 8}
              onChange={(e) =>
                setForm({
                  ...form,
                  limite_vagas: Math.min(Number(e.target.value || 8), 8),
                })
              }
              placeholder="8"
            />
            <p className="text-xs text-muted-foreground">
              O limite máximo permitido é 8 alunos.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status ?? "ativa"}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="encerrada">Encerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending || !form.nome}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}