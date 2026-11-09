import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, Panel } from "@/components/monchis/AdminParts";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/movimientos")({
  head: () => ({ meta: [{ title: "Movimientos — Panel Monchis" }, { name: "description", content: "Historial de puntos, sellos y canjes." }, { property: "og:title", content: "Movimientos — Panel Monchis" }, { property: "og:description", content: "Historial de operaciones." }] }),
  component: Movimientos,
});

const TYPES = { all: "Todos", earn: "Compras", redeem: "Canjes", bonus: "Bonos", stamp: "Sellos" } as const;

function Movimientos() {
  const movements = useStore((s) => s.movements);
  const customers = useStore((s) => s.customers);
  const [type, setType] = useState<keyof typeof TYPES>("all");
  const [q, setQ] = useState("");
  const name = (id: string) => customers.find((c) => c.id === id)?.name ?? "—";
  const list = movements.filter((m) => (type === "all" || m.type === type) && `${name(m.customerId)} ${m.description}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Movimientos" sub={`${movements.length} operaciones registradas`} />
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente o pedido…" className="max-w-xs" />
          {(Object.keys(TYPES) as (keyof typeof TYPES)[]).map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{TYPES[t]}</button>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-border">
          {list.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate font-semibold">{name(m.customerId)}</p><p className="truncate text-xs text-muted-foreground">{m.description} · {fmtDate(m.date)}</p></div>
              <span className={cn("font-display text-lg", m.points > 0 ? "text-success" : m.points < 0 ? "text-destructive" : "text-accent")}>{m.type === "stamp" ? "+1 sello" : `${m.points > 0 ? "+" : ""}${m.points} pts`}</span>
            </li>
          ))}
          {list.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Sin movimientos.</li>}
        </ul>
      </Panel>
    </>
  );
}
