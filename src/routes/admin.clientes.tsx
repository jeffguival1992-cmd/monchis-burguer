import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Avatar, PageTitle, Panel } from "@/components/monchis/AdminParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate, matchCustomer } from "@/lib/format";
import { tierOf, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Panel Monchis" }, { name: "description", content: "Socios del Monchis Loyalty Club." }, { property: "og:title", content: "Clientes — Panel Monchis" }, { property: "og:description", content: "Gestiona los socios del club." }] }),
  component: Clientes,
});

const TIERS = ["Todos", "Bronce", "Plata", "Oro", "Dino Legend"];

function Clientes() {
  const customers = useStore((s) => s.customers);
  const select = useStore((s) => s.selectCustomer);
  const setCurrent = useStore((s) => s.setCurrentCustomer);
  const setRole = useStore((s) => s.setRole);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("Todos");
  const [sort, setSort] = useState<"points" | "name" | "recent">("points");
  const list = customers
    .filter((c) => matchCustomer(c, q) && (tier === "Todos" || tierOf(c.totalEarned).name === tier))
    .sort((a, b) => sort === "points" ? b.points - a.points : sort === "name" ? a.name.localeCompare(b.name) : b.joinedAt.localeCompare(a.joinedAt));
  return (
    <>
      <PageTitle title="Clientes" sub={`${customers.length} socios registrados`} />
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="max-w-xs" />
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="points">Más puntos</option><option value="name">Nombre</option><option value="recent">Más recientes</option>
          </select>
          <div className="flex flex-wrap gap-1">
            {TIERS.map((t) => <button key={t} onClick={() => setTier(t)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", tier === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{t}</button>)}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Cliente</th><th>Código</th><th>Nivel</th><th>Puntos</th><th>Desde</th><th /></tr></thead>
            <tbody className="divide-y divide-border">
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5"><div className="flex items-center gap-3"><Avatar name={c.name} /><div><b>{c.name}</b><p className="text-xs text-muted-foreground">{c.email}</p></div></div></td>
                  <td className="font-mono">{c.code}</td>
                  <td>{tierOf(c.totalEarned).name}</td>
                  <td className="font-display text-lg text-primary">{c.points}</td>
                  <td className="text-xs text-muted-foreground">{fmtDate(c.joinedAt)}</td>
                  <td className="space-x-1 text-right">
                    <Button size="sm" onClick={() => { select(c.id); navigate({ to: "/admin/compra" }); }}>Compra</Button>
                    <Button size="sm" variant="outline" onClick={() => { setCurrent(c.id); setRole("cliente"); navigate({ to: "/cliente" }); }}>Ver tarjeta</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Ningún cliente coincide.</p>}
        </div>
      </Panel>
    </>
  );
}
