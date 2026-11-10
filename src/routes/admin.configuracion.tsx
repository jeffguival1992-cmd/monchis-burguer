import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageTitle, Panel } from "@/components/monchis/AdminParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/configuracion")({
  head: () => ({ meta: [{ title: "Configuración — Panel Monchis" }, { name: "description", content: "Reglas del programa de fidelización Monchis." }, { property: "og:title", content: "Configuración — Panel Monchis" }, { property: "og:description", content: "Reglas del club." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Configuracion,
});

function Configuracion() {
  const { settings, setMode, updateSettings, branches, employees, reset } = useStore();
  const num = (k: "pointsPerUsd" | "stampsGoal" | "welcomePoints", min: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(min, Math.floor(Number(e.target.value) || min));
    updateSettings({ [k]: v });
  };
  return (
    <>
      <PageTitle title="Configuración" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Tipo de programa">
          <div className="grid grid-cols-2 gap-3">
            {([["points", "⭐ Sistema de puntos", "USD → puntos canjeables"], ["stamps", "🍔 Sistema de sellos", "1 sello por compra"]] as const).map(([m, l, d]) => (
              <button key={m} onClick={() => { setMode(m); toast.success(`Modo ${m === "points" ? "puntos" : "sellos"} activado`); }} className={cn("rounded-2xl border p-4 text-left", settings.mode === m ? "border-primary bg-primary/10" : "border-border")}>
                <p className="font-bold">{l}</p><p className="text-xs text-muted-foreground">{d}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div><Label>Puntos por USD 1</Label><Input type="number" min={1} value={settings.pointsPerUsd} onChange={num("pointsPerUsd", 1)} className="mt-1" /></div>
            <div><Label>Sellos para premio</Label><Input type="number" min={2} value={settings.stampsGoal} onChange={num("stampsGoal", 2)} className="mt-1" /></div>
            <div><Label>Puntos bienvenida</Label><Input type="number" min={0} value={settings.welcomePoints} onChange={num("welcomePoints", 0)} className="mt-1" /></div>
          </div>
        </Panel>
        <Panel title="Sucursales y equipo">
          {branches.map((b) => <p key={b.id} className="text-sm"><b>{b.name}</b> · <span className="text-muted-foreground">{b.address}</span></p>)}
          <ul className="mt-3 space-y-1 text-sm">{employees.map((e) => <li key={e.id}>{e.name} — <span className="text-muted-foreground">{e.role}, {branches.find((b) => b.id === e.branchId)?.name}</span></li>)}</ul>
        </Panel>
        <Panel title="Datos de la demo">
          <p className="mb-3 text-sm text-muted-foreground">Todo se guarda en este navegador. Reinicia para volver a los datos originales.</p>
          <Button variant="destructive" onClick={() => { if (confirm("¿Reiniciar la demo?")) { reset(); toast.success("Demo reiniciada"); } }}>REINICIAR DEMO</Button>
        </Panel>
      </div>
    </>
  );
}
