export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-EC", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const fmtUsd = (n: number) => `USD ${n.toFixed(2)}`;
export const initials = (name: string) => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export function matchCustomer(c: { name: string; email: string; phone: string; code: string; cedula?: string }, q: string) {
  const s = q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!s) return true;
  const hay = `${c.name} ${c.email} ${c.phone} ${c.code} ${c.cedula ?? ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return hay.includes(s);
}

export const displayName = (c: { name: string; code: string }) => c.name.trim() || `Socio ${c.code}`;
