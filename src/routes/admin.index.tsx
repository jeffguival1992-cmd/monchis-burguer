import { displayName } from "@/lib/format";
import { adminOnly } from "@/lib/guards";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Gift, ReceiptText, Star, UserPlus, Users } from "lucide-react";
import { Avatar, PageTitle, Panel } from "@/components/monchis/AdminParts";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Panel Monchis" }, { name: "description", content: "Indicadores del programa de fidelización Monchis." }, { property: "og:title", content: "Dashboard — Panel Monchis" }, { property: "og:description", content: "Indicadores del club." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  beforeLoad: adminOnly,
  component: Dashboard,
});

function Dashboard() {
  const { customers, movements, purchases, redemptions } = useStore();
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const kpis = [
    { label: "Total clientes", value: customers.length, icon: Users },
    { label: "Clientes nuevos (7d)", value: customers.filter((c) => c.joinedAt > weekAgo).length, icon: UserPlus },
    { label: "Puntos entregados", value: movements.filter((m) => m.points > 0).reduce((a, m) => a + m.points, 0), icon: Star },
    { label: "Compras registradas", value: purchases.length, icon: ReceiptText },
    { label: "Recompensas canjeadas", value: redemptions.length, icon: Gift },
  ];
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const key = d.toISOString().slice(0, 10);
    const ps = purchases.filter((p) => p.date.slice(0, 10) === key);
    return { day: d.toLocaleDateString("es-EC", { weekday: "short" }), ventas: +ps.reduce((a, p) => a + p.amount, 0).toFixed(2), compras: ps.length };
  });
  const top = [...customers].sort((a, b) => b.visits - a.visits).slice(0, 5);
  const name = (id: string) => customers.find((c) => c.id === id)?.name ?? "—";
  return (
    <>
      <PageTitle title="Dashboard" sub="Así va el Monchis Loyalty Club">
        <Button asChild variant="hero"><Link to="/admin/escanear">Escanear cliente</Link></Button>
      </PageTitle>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((k, i) => (
          <div key={k.label} className="animate-rise rounded-3xl border border-border bg-card p-4" style={{ animationDelay: `${i * 0.05}s` }}>
            <k.icon className="h-5 w-5 text-primary" />
            <p className="font-display mt-2 text-3xl">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Ventas últimos 7 días (USD)" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="ventas" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Clientes frecuentes">
          <ul className="space-y-3">
            {top.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="font-display w-4 text-accent">{i + 1}</span><Avatar name={displayName(c)} />
                <span className="min-w-0 flex-1"><b className="block truncate text-sm">{displayName(c)}</b><span className="text-xs text-muted-foreground">{c.visits} visitas</span></span>
                <span className="font-display text-primary">{c.points}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Actividad reciente" className="mt-6">
        <ul className="divide-y divide-border">
          {movements.slice(0, 8).map((m) => (
            <li key={m.id} className="flex justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate"><b>{name(m.customerId)}</b> · {m.description}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(m.date)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
