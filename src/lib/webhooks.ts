import { z } from "zod";

const KEY = "atelier-webhooks";

const Schema = z.object({
  importacao: z.string().url().or(z.literal("")).default(""),
  cobrancaIndividual: z.string().url().or(z.literal("")).default(""),
  cobrancaLote: z.string().url().or(z.literal("")).default(""),
  envioWhatsAppCrm: z.string().url().or(z.literal("")).default(""),
});

export type WebhookConfig = z.infer<typeof Schema>;

const empty: WebhookConfig = {
  importacao: "",
  cobrancaIndividual: "",
  cobrancaLote: "",
  envioWhatsAppCrm: "https://n8n.institutomodaecostura.com.br/webhook/enviar-whatsapp-crm",
};

export function loadWebhooks(): WebhookConfig {
  if (typeof window === "undefined") return empty;

  try {
    const raw = localStorage.getItem(KEY);

    if (!raw) return empty;

    const parsed = Schema.parse(JSON.parse(raw));

    return {
      ...empty,
      ...parsed,
    };
  } catch {
    return empty;
  }
}

export function saveWebhooks(cfg: WebhookConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export async function callWebhook(url: string, payload: unknown) {
  if (!url) {
    throw new Error("URL do webhook não configurada. Vá em Configurações.");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "cors",
  });

  if (!res.ok) {
    throw new Error(`Webhook falhou: ${res.status}`);
  }

  return res.text();
}