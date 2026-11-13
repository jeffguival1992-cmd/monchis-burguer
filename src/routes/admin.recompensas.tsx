import { adminOnly } from "@/lib/guards";
import { createFileRoute } from "@tanstack/react-router";
import { PageTitle, Panel } from "@/components/monchis/AdminParts";
import { Switch } from "@/components/ui/switch";
import { fmtDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/recompensas")({
  head: () => ({ meta: [{ title: "Recompensas — Panel Monchis" }, { name: "description", content: "Catálogo de premios y canjes del club Monchis." }, { property: "og:title", content: "Recompensas — Panel Monchis" }, { property: "og:description", content: "Catálogo de premios." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  beforeLoad: adminOnly,
  component: Recompensas,
});

function Recompensas() {
  const { rewards, redemptions, customers, toggleReward } = useStore();
  const count = (id: string) => redemptions.filter((r) => r.rewardId === id).length;
  return (
    <>
      <PageTitle title="Recompensas" sub="Activa o pausa premios del catálogo." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((r) => (
          <div key={r.id} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-start justify-between"><span className="text-4xl">{r.emoji}</span><Switch checked={r.active} onCheckedChange={() => toggleReward(r.id)} /></div>
            <p className="mt-3 font-bold">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.description}</p>
            <p className="font-display mt-2 text-2xl text-accent">{r.cost} pts</p>
            <p className="text-xs text-muted-foreground">{count(r.id)} canjes · {r.active ? "Activa" : "Pausada"}</p>
          </div>
        ))}
      </div>
      <Panel title="Canjes históricos" className="mt-6">
        <ul className="divide-y divide-border">
          {redemptions.map((x) => {
            const r = rewards.find((y) => y.id === x.rewardId);
            return (
              <li key={x.id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span>{r?.emoji} <b>{r?.name}</b> · {customers.find((c) => c.id === x.customerId)?.name}<br /><span className="font-mono text-xs text-muted-foreground">{x.code}</span></span>
                <span className="text-right"><span className="font-display text-destructive">-{x.cost}</span><br /><span className="text-xs text-muted-foreground">{fmtDate(x.date)}</span></span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
