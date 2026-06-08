const formatBRL = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));
const formatDate = (iso) => iso ? (/* @__PURE__ */ new Date(iso + (iso.length === 10 ? "T00:00:00" : ""))).toLocaleDateString("pt-BR") : "—";
const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
export {
  formatDate as a,
  formatBRL as f,
  today as t
};
