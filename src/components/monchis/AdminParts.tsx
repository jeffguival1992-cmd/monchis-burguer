import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoyaltyCard } from "@/components/monchis/LoyaltyCard";
import { PurchaseDialog } from "@/components/monchis/PurchaseDialog";
import { initials, matchCustomer } from "@/lib/format";
import { tierOf, useStore } from "@/lib/store";
import type { Customer } from "@/lib/mock-data";

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl sm:text-4xl">{title}</h1>{sub && <p className="text-sm text-muted-foreground">{sub}</p>}</div>
      {children}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-5 ${className}`}>{title && <p className="font-display mb-3 text-xl">{title}</p>}{children}</div>;
}

export function Avatar({ name }: { name: string }) {
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flame text-sm font-extrabold text-primary-foreground">{initials(name)}</span>;
}

export function CustomerSearch({ onPick, limit = 6 }: { onPick: (c: Customer) => void; limit?: number }) {
  const customers = useStore((s) => s.customers);
  const [q, setQ] = useState("");
  const res = q.trim() ? customers.filter((c) => matchCustomer(c, q)).slice(0, limit) : [];
  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, correo, teléfono o código (MON-1001)" className="h-12 pl-9" />
      </div>
      {q.trim() && (
        <ul className="mt-2 divide-y divide-border rounded-2xl border border-border">
          {res.length === 0 && <li className="p-3 text-sm text-muted-foreground">Sin resultados.</li>}
          {res.map((c) => (
            <li key={c.id}>
              <button onClick={() => { onPick(c); setQ(""); }} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted">
                <Avatar name={c.name} />
                <span className="min-w-0 flex-1"><b className="block truncate">{c.name}</b><span className="text-xs text-muted-foreground">{c.code} · {c.phone}</span></span>
                <span className="font-display text-primary">{c.points} pts</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function IdentifiedCustomer({ customerId, onClear }: { customerId: string; onClear?: () => void }) {
  const c = useStore((s) => s.customers.find((x) => x.id === customerId));
  const mode = useStore((s) => s.settings.mode);
  const [open, setOpen] = useState(false);
  if (!c) return null;
  return (
    <div className="animate-pop space-y-4">
      <LoyaltyCard customer={c} compact />
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Puntos", c.points], [mode === "stamps" ? "Sellos" : "Nivel", mode === "stamps" ? c.stamps : tierOf(c.totalEarned).name], ["Visitas", c.visits]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl bg-muted p-2"><p className="font-display text-xl">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{c.email} · {c.phone}</p>
      <Button variant="hero" size="xl" className="w-full" onClick={() => setOpen(true)}>REGISTRAR COMPRA</Button>
      {onClear && <Button variant="ghost" className="w-full" onClick={onClear}>Atender a otro cliente</Button>}
      <PurchaseDialog customer={c} open={open} onOpenChange={setOpen} />
    </div>
  );
}
