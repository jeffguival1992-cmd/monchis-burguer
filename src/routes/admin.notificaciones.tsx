import { displayName } from "@/lib/format";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageTitle, Panel } from "@/components/monchis/AdminParts";
import { SimBadge } from "@/components/monchis/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate } from "@/lib/format";
import type { Notification } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones — Panel Monchis" }, { name: "description", content: "Envía mensajes simulados a los socios Monchis." }, { property: "og:title", content: "Notificaciones — Panel Monchis" }, { property: "og:description", content: "Mensajes para socios." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Notificaciones,
});

const TEMPLATES: Record<Notification["type"], { label: string; title: string; message: string }> = {
  promo: { label: "📣 Promoción", title: "Promo del día", message: "¡Hola {nombre}! Hoy tienes una promoción especial en MONCHIS BURGUERS. ¡Te esperamos!" },
  offer: { label: "🔥 Oferta especial", title: "2x1 en Combos", message: "{nombre}, solo hoy: 2x1 en Combo Monchis de 15:00 a 18:00." },
  birthday: { label: "🎂 Cumpleaños", title: "¡Feliz cumpleaños!", message: "¡Feliz cumple, {nombre}! Te regalamos una hamburguesa este mes." },
  reward: { label: "🎁 Recompensa", title: "Tienes un premio", message: "{nombre}, ya tienes puntos para canjear una recompensa. ¡Ven por ella!" },
};

function Notificaciones() {
  const { customers, notifications, sendNotification } = useStore();
  const [type, setType] = useState<Notification["type"]>("promo");
  const [title, setTitle] = useState(TEMPLATES.promo.title);
  const [message, setMessage] = useState(TEMPLATES.promo.message);
  const [audience, setAudience] = useState<"all" | "one" | "rich">("all");
  const [one, setOne] = useState("c1");

  const pick = (t: Notification["type"]) => { setType(t); setTitle(TEMPLATES[t].title); setMessage(TEMPLATES[t].message); };
  const targets = audience === "all" ? customers.map((c) => c.id) : audience === "one" ? [one] : customers.filter((c) => c.points >= 150).map((c) => c.id);
  const send = () => {
    if (!title.trim() || !message.trim()) { toast.error("Escribe un título y un mensaje."); return; }
    const n = sendNotification({ customerIds: targets, type, title, message });
    toast.success(`Mensaje enviado a ${n} bandeja${n > 1 ? "s" : ""} (simulado)`);
  };
  const name = (id: string) => customers.find((c) => c.id === id)?.name;

  return (
    <>
      <PageTitle title="Notificaciones" sub="Los mensajes llegan a la bandeja interna del cliente. No se envía nada real."><SimBadge /></PageTitle>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Nuevo mensaje">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TEMPLATES) as Notification["type"][]).map((t) => (
              <button key={t} onClick={() => pick(t)} className={cn("rounded-2xl border p-3 text-left text-sm font-semibold", type === t ? "border-primary bg-primary/10" : "border-border")}>{TEMPLATES[t].label}</button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
            <div><Label>Mensaje <span className="text-muted-foreground">(usa {"{nombre}"})</span></Label><Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Destinatarios</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {([["all", "Todos"], ["rich", "Con 150+ pts"], ["one", "Un cliente"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setAudience(v)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", audience === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{l}</button>
                ))}
              </div>
              {audience === "one" && (
                <select value={one} onChange={(e) => setOne(e.target.value)} className="mt-2 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {customers.map((c) => <option key={c.id} value={c.id}>{displayName(c)}</option>)}
                </select>
              )}
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={send}>Enviar a {targets.length} cliente{targets.length !== 1 ? "s" : ""}</Button>
          </div>
        </Panel>
        <Panel title="Enviados recientemente">
          <ul className="max-h-[520px] divide-y divide-border overflow-y-auto">
            {notifications.slice(0, 30).map((n) => (
              <li key={n.id} className="py-2.5 text-sm"><b>{n.title}</b> → {name(n.customerId)}<p className="text-xs text-muted-foreground">{n.message}</p><p className="text-[11px] text-muted-foreground">{fmtDate(n.date)} · {n.read ? "Leído" : "No leído"}</p></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
