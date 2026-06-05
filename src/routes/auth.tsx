import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Scissors } from "lucide-react";

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
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo!");
    navigate({ to: "/dashboard" });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Cadastro realizado! Você já pode entrar.");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary-foreground/15 grid place-items-center backdrop-blur">
            <Scissors className="size-5" />
          </div>
          <span className="font-display text-xl font-semibold">Atelier</span>
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-semibold leading-tight">
            Gestão completa <br/>da sua escola <br/><em className="not-italic text-primary-foreground/80">de costura.</em>
          </h1>
          <p className="text-primary-foreground/80 max-w-md">
            Alunos, turmas, mensalidades e cobranças automatizadas — num só lugar, com a calma de um bom atelier.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© Atelier · {new Date().getFullYear()}</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md shadow-[var(--shadow-lift)] border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Acessar painel</CardTitle>
            <CardDescription>Entre com seu e-mail e senha para gerenciar a escola.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-l">E-mail</Label>
                    <Input id="email-l" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-l">Senha</Label>
                    <Input id="password-l" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-s">E-mail</Label>
                    <Input id="email-s" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-s">Senha (mín. 6)</Label>
                    <Input id="password-s" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button>
                </form>
              </TabsContent>
            </Tabs>
            <p className="mt-6 text-xs text-muted-foreground text-center">
              Ao continuar você concorda com os termos do atelier.{" "}
              <Link to="/dashboard" className="underline">Voltar</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
