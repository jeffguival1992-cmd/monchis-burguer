import { Link, useNavigate } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import mascot from "@/assets/mascot.png";
import { useStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <img src={mascot} alt="Mascota Monchis" width={1024} height={1024} className={small ? "h-9 w-9" : "h-11 w-11"} />
      <span className="leading-none">
        <span className={cn("font-display block text-foreground", small ? "text-lg" : "text-xl")}>MONCHIS</span>
        <span className="block text-[10px] font-bold tracking-[0.25em] text-primary">BURGUERS</span>
      </span>
    </Link>
  );
}

const roles: { id: Role; label: string; to: "/cliente" | "/admin/escanear" | "/admin" }[] = [
  { id: "cliente", label: "Cliente", to: "/cliente" },
  { id: "cajero", label: "Cajero", to: "/admin/escanear" },
  { id: "admin", label: "Admin", to: "/admin" },
];

export function DemoSwitcher({ className }: { className?: string }) {
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const reset = useStore((s) => s.reset);
  const navigate = useNavigate();
  return (
    <div className={cn("flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 text-xs backdrop-blur", className)}>
      <span className="hidden px-2 font-semibold text-muted-foreground sm:inline">DEMO</span>
      {roles.map((r) => (
        <button
          key={r.id}
          onClick={() => { setRole(r.id); navigate({ to: r.to }); }}
          className={cn("rounded-full px-3 py-1.5 font-semibold transition-colors", role === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {r.label}
        </button>
      ))}
      <button
        title="Reiniciar demo"
        onClick={() => { if (confirm("¿Restaurar todos los datos originales de la demo?")) { reset(); toast.success("Demo reiniciada"); navigate({ to: "/" }); } }}
        className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function SimBadge({ real }: { real?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", real ? "bg-success/15 text-success" : "bg-accent/15 text-accent")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", real ? "bg-success" : "bg-accent")} />
      {real ? "Funciona de verdad" : "Simulado"}
    </span>
  );
}
