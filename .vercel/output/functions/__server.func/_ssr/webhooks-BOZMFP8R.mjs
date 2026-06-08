import { o as objectType, s as stringType, l as literalType } from "../_libs/zod.mjs";
const KEY = "atelier-webhooks";
const Schema = objectType({
  importacao: stringType().url().or(literalType("")).default(""),
  cobrancaIndividual: stringType().url().or(literalType("")).default(""),
  cobrancaLote: stringType().url().or(literalType("")).default("")
});
const empty = { importacao: "", cobrancaIndividual: "", cobrancaLote: "" };
function loadWebhooks() {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return Schema.parse(JSON.parse(raw));
  } catch {
    return empty;
  }
}
function saveWebhooks(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}
async function callWebhook(url, payload) {
  if (!url) throw new Error("URL do webhook não configurada. Vá em Configurações.");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "cors"
  });
  if (!res.ok) throw new Error(`Webhook falhou: ${res.status}`);
  return res.text();
}
export {
  callWebhook as c,
  loadWebhooks as l,
  saveWebhooks as s
};
