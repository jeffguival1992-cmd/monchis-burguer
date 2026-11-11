import { displayName } from "@/lib/format";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CreditCard, Gift, History, UserRound } from "lucide-react";
import { toast } from "sonner";
import mascot from "@/assets/monchis-dinosaurio.jpeg.asset.json";
import { DemoSwitcher, Logo } from "@/components/monchis/Brand";
import { LoyaltyCard } from "@/components/monchis/LoyaltyCard";
import { ProfileForm, profileComplete } from "@/components/monchis/ProfileForm";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente")({
  head: () => ({
    meta: [
      { title: "Mi tarjeta Monchis — Loyalty Club" },
      { name: "description", content: "Consulta tus puntos, tu QR de socio, recompensas y mensajes de Monchis Burguers." },
      { property: "og:title", content: "Mi tarjeta Monchis" },
      { property: "og:description", content: "Tus puntos y premios Monchis en el celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cliente,
});

type Tab = "card" | "points" | "rewards" | "inbox" | "profile";

function Cliente() {
  const hydrated = useStore((s) => s.hydrated);
  const customers = useStore((s) => s.customers);
  const currentId = useStore((s) => s.currentCustomerId);
  const setCurrent = useStore((s) => s.setCurrentCustomer);
  const [tab, setTab] = useState<Tab>("card");
  const customer = customers.find((c) => c.id === (currentId ?? "c1")) ?? customers[0]!;
  const notifications = useStore((s) => s.notifications);
  const unread = notifications.filter((n) => n.customerId === customer.id && !n.read).length;

  if (!hydrated) return <div className="flex min-h-screen items-center justify-center"><img src={mascot.url} alt="" className="h-24 w-24 rounded-full object-cover animate-float" /></div>;

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-4">
      <header className="flex items-center justify-between gap-2">
        <Logo small />
        <DemoSwitcher />
      </header>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Viendo como:</span>
        <select value={customer.id} onChange={(e) => setCurrent(e.target.value)} className="flex-1 rounded-lg border border-input bg-card px-2 py-1.5 text-foreground">
          {customers.map((c) => <option key={c.id} value={c.id}>{displayName(c)} · {c.code}</option>)}
        </select>
      </div>
      <h1 className="mt-5 text-3xl">¡Hola, {customer.name.split(" ")[0] || "socio"}! 👋</h1>

      {!profileComplete(customer) && tab !== "profile" && (
        <button onClick={() => setTab("profile")} className="mt-4 w-full rounded-3xl border border-accent bg-accent/10 p-4 text-left">
          <p className="font-display text-lg text-accent">Completa tu perfil</p>
          <p className="text-sm text-muted-foreground">Agrega tu nombre, correo y cumpleaños para recibir regalos especiales.</p>
        </button>
      )}
      <div className="mt-4 animate-rise" key={tab}>
        {tab === "card" && <CardTab customerId={customer.id} />}
        {tab === "points" && <PointsTab customerId={customer.id} />}
        {tab === "rewards" && <RewardsTab customerId={customer.id} />}
        {tab === "inbox" && <InboxTab customerId={customer.id} />}
        {tab === "profile" && <div className="rounded-3xl border border-border bg-card p-5"><p className="font-display mb-3 text-xl">Mi perfil</p><ProfileForm key={customer.id} customer={customer} onDone={() => setTab("card")} /></div>}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {([["card", "Tarjeta", CreditCard], ["points", "Puntos", History], ["rewards", "Premios", Gift], ["inbox", "Bandeja", Bell], ["profile", "Perfil", UserRound]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("relative flex flex-col items-center gap-1 py-3 text-xs font-semibold", tab === id ? "text-primary" : "text-muted-foreground")}>
              <Icon className="h-5 w-5" />{label}
              {id === "inbox" && unread > 0 && <span className="absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{unread}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function useCustomer(id: string) {
  return useStore((s) => s.customers.find((c) => c.id === id)!);
}

function CardTab({ customerId }: { customerId: string }) {
  const c = useCustomer(customerId);
  const movements = useStore((s) => s.movements).filter((m) => m.customerId === customerId).slice(0, 3);
  return (
    <div className="space-y-4">
      <LoyaltyCard customer={c} />
      <p className="text-center text-xs text-muted-foreground">Muestra tu QR en caja en cada compra · USD 1 = 1 punto</p>
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="font-display text-lg">Últimos movimientos</p>
        <MovementList items={movements} />
      </div>
      <Button asChild variant="outline" className="w-full"><Link to="/admin/escanear">Ir a caja para sumar puntos →</Link></Button>
    </div>
  );
}

function MovementList({ items }: { items: ReturnType<typeof useStore.getState>["movements"] }) {
  if (!items.length) return <p className="py-4 text-center text-sm text-muted-foreground">Aún no hay movimientos.</p>;
  return (
    <ul className="divide-y divide-border">
      {items.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{m.description}</p>
            <p className="text-xs text-muted-foreground">{fmtDate(m.date)}</p>
          </div>
          <span className={cn("font-display text-lg", m.points > 0 ? "text-success" : m.points < 0 ? "text-destructive" : "text-accent")}>
            {m.type === "stamp" ? "+1 🍔" : `${m.points > 0 ? "+" : ""}${m.points}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PointsTab({ customerId }: { customerId: string }) {
  const c = useCustomer(customerId);
  const movements = useStore((s) => s.movements).filter((m) => m.customerId === customerId);
  const purchases = useStore((s) => s.purchases).filter((p) => p.customerId === customerId);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[["Disponibles", c.points, "text-primary"], ["Acumulados", c.totalEarned, "text-success"], ["Usados", c.totalUsed, "text-accent"]].map(([l, v, cl]) => (
          <div key={l as string} className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className={cn("font-display text-3xl", cl as string)}>{v}</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="font-display text-lg">Compras realizadas ({purchases.length})</p>
        {purchases.length ? (
          <ul className="divide-y divide-border">
            {purchases.map((p) => (
              <li key={p.id} className="flex justify-between py-2.5 text-sm">
                <span><b>{p.orderNumber}</b><br /><span className="text-xs text-muted-foreground">{fmtDate(p.date)}</span></span>
                <span className="text-right font-semibold">USD {p.amount.toFixed(2)}<br /><span className="text-xs text-success">+{p.points} pts</span></span>
              </li>
            ))}
          </ul>
        ) : <p className="py-4 text-center text-sm text-muted-foreground">Aún no tienes compras.</p>}
      </div>
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="font-display text-lg">Historial de puntos</p>
        <MovementList items={movements} />
      </div>
    </div>
  );
}

function RewardsTab({ customerId }: { customerId: string }) {
  const c = useCustomer(customerId);
  const rewards = useStore((s) => s.rewards).filter((r) => r.active);
  const settings = useStore((s) => s.settings);
  const redeem = useStore((s) => s.redeem);
  const [selected, setSelected] = useState<string | null>(null);
  const r = rewards.find((x) => x.id === selected);
  const doRedeem = () => {
    if (!r) return;
    const res = redeem(c.id, r.id);
    if (!res.ok) toast.error(res.error); else setSelected(null);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Tienes <b className="text-primary">{c.points} puntos</b>{settings.mode === "stamps" ? ` y ${c.stamps}/${settings.stampsGoal} sellos` : ""}. Toca un premio para canjearlo.</p>
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((rw) => {
          const can = c.points >= rw.cost || (settings.mode === "stamps" && rw.id === "r1" && c.stamps >= settings.stampsGoal);
          return (
            <button key={rw.id} onClick={() => setSelected(rw.id)} className={cn("rounded-3xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5", selected === rw.id ? "border-primary shadow-glow" : "border-border", !can && "opacity-60")}>
              <span className="text-4xl">{rw.emoji}</span>
              <p className="mt-2 font-bold leading-tight">{rw.name}</p>
              <p className="text-xs text-muted-foreground">{rw.description}</p>
              <p className={cn("font-display mt-2 text-xl", can ? "text-accent" : "text-muted-foreground")}>{rw.cost} pts</p>
              {!can && <p className="text-[11px] text-muted-foreground">Te faltan {rw.cost - c.points}</p>}
            </button>
          );
        })}
      </div>
      {r && (
        <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-md animate-rise px-4">
          <div className="rounded-3xl border border-primary bg-card p-4 shadow-glow">
            <p className="font-bold">{r.emoji} {r.name} · {r.cost} pts</p>
            <p className="text-xs text-muted-foreground">Te quedarán {Math.max(0, c.points - r.cost)} puntos</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>Cancelar</Button>
              <Button variant="hero" onClick={doRedeem}>CANJEAR</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InboxTab({ customerId }: { customerId: string }) {
  const items = useStore((s) => s.notifications).filter((n) => n.customerId === customerId);
  const markRead = useStore((s) => s.markRead);
  const icon = { promo: "📣", offer: "🔥", birthday: "🎂", reward: "🎁" };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Mensajes simulados enviados por Monchis</p>
        {items.some((n) => !n.read) && <button onClick={() => markRead(customerId)} className="text-xs font-bold text-primary">Marcar leídos</button>}
      </div>
      {items.length === 0 && <p className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Tu bandeja está vacía.</p>}
      {items.map((n) => (
        <div key={n.id} className={cn("flex gap-3 rounded-3xl border bg-card p-4", n.read ? "border-border" : "border-primary/60")}>
          <span className="text-3xl">{icon[n.type]}</span>
          <div>
            <p className="font-bold">{n.title} {!n.read && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-primary" />}</p>
            <p className="text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{fmtDate(n.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
