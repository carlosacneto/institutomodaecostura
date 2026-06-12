import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard" });
      }
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Bem-vindo!");

    navigate({ to: "/dashboard" });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      return toast.error(error.message);
    }

    toast.success("Cadastro realizado! Você já pode entrar.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-primary/90 to-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/20 p-1 shadow-sm ring-1 ring-white/30 backdrop-blur">
            <img
              src="/logo-instituto.png"
              alt="Instituto Moda e Costura"
              className="size-10 rounded-full object-cover"
            />
          </div>

          <span className="font-display text-xl font-semibold">
            Instituto Moda e Costura
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-5xl font-semibold leading-tight">
            Gestão completa <br />
            da sua escola <br />
            <em className="not-italic text-primary-foreground/80">
              de costura.
            </em>
          </h1>

          <p className="max-w-md text-primary-foreground/80">
            Alunos, turmas, mensalidades e cobranças automatizadas — num só
            lugar, com a calma de uma boa escola.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/70">
          © Instituto Moda e Costura ·  2010
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-border/60 shadow-[var(--shadow-lift)]">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Acessar painel
            </CardTitle>

            <CardDescription>
              Entre com seu e-mail e senha para gerenciar a escola.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-l">E-mail</Label>
                    <Input
                      id="email-l"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-l">Senha</Label>
                    <Input
                      id="password-l"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-s">E-mail</Label>
                    <Input
                      id="email-s"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-s">Senha (mín. 6)</Label>
                    <Input
                      id="password-s"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Ao continuar você concorda com os termos do Instituto Moda e
              Costura.{" "}
              <Link to="/dashboard" className="underline">
                Voltar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}