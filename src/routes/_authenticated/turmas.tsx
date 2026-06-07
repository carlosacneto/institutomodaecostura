import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
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
};

function TurmasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);

  const { data: turmas = [], isLoading } = useQuery({
    queryKey: ["turmas-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turmas")
        .select("*")
        .order("nome");

      if (error) throw error;

      return (data ?? []) as Turma[];
    },
  });

  const deleteTurma = useMutation({
    mutationFn: async (turma: Turma) => {
      const { error } = await supabase.rpc("excluir_turma_segura", {
        p_turma_id: turma.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Turma excluída com sucesso");
      qc.invalidateQueries({ queryKey: ["turmas-full"] });
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
          turmas.map((t) => (
            <Card key={t.id} className="border-border/60 shadow-[var(--shadow-soft)]">
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-semibold">{t.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.curso ?? "—"}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className={t.status === "ativa" ? "bg-success/15 text-success" : ""}
                >
                  {t.status}
                </Badge>
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
                  <span className="text-muted-foreground">Professor(a):</span>{" "}
                  {t.professor ?? "—"}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
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
                    onClick={() => handleDelete(t)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <TurmaForm
        open={open}
        onOpenChange={setOpen}
        turma={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["turmas-full"] })}
      />
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

  useMemo(() => {
    setForm(turma ?? { status: "ativa" });
  }, [turma]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome?.trim().toUpperCase(),
        curso: form.curso?.trim() || null,
        professor: form.professor?.trim() || null,
        dias_semana: form.dias_semana?.trim() || null,
        horario: form.horario?.trim() || null,
        status: form.status || "ativa",
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

          <div className="space-y-2 sm:col-span-2">
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