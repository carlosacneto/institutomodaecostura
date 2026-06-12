import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { loadWebhooks, saveWebhooks, type WebhookConfig } from "@/lib/webhooks";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  ssr: false,
  component: ConfigPage,
});

function ConfigPage() {
  const [cfg, setCfg] = useState<WebhookConfig>({
    importacao: "",
    cobrancaIndividual: "",
    cobrancaLote: "",
    envioWhatsAppCrm:
      "https://n8n.institutomodaecostura.com.br/webhook/enviar-whatsapp-crm",
  });

  useEffect(() => {
    setCfg(loadWebhooks());
  }, []);

  function salvar() {
    saveWebhooks(cfg);
    toast.success("Configurações salvas");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          URLs dos webhooks do n8n. Salvas apenas neste navegador.
        </p>
      </header>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="font-display text-lg">Webhooks n8n</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Importação do Google Sheets</Label>
            <Input
              placeholder="https://n8n.../webhook/import"
              value={cfg.importacao}
              onChange={(e) =>
                setCfg({ ...cfg, importacao: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Cobrança individual (WhatsApp)</Label>
            <Input
              placeholder="https://n8n.../webhook/cobranca"
              value={cfg.cobrancaIndividual}
              onChange={(e) =>
                setCfg({ ...cfg, cobrancaIndividual: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Cobrança em lote (WhatsApp)</Label>
            <Input
              placeholder="https://n8n.../webhook/cobranca-lote"
              value={cfg.cobrancaLote}
              onChange={(e) =>
                setCfg({ ...cfg, cobrancaLote: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Envio WhatsApp CRM</Label>
            <Input
              placeholder="https://n8n.../webhook/enviar-whatsapp-crm"
              value={cfg.envioWhatsAppCrm}
              onChange={(e) =>
                setCfg({ ...cfg, envioWhatsAppCrm: e.target.value })
              }
            />
          </div>

          <div className="pt-2">
            <Button onClick={salvar}>Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}