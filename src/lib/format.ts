export const formatBRL = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-BR") : "—";

export const today = () => new Date().toISOString().slice(0, 10);
