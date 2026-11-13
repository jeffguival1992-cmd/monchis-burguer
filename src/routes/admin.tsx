import { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { requireStaff } from "@/lib/guards";
import { Bell, Gift, LayoutDashboard, ListOrdered, LogOut, Menu, ReceiptText, ScanLine, Settings, Users, X } from "lucide-react";
import mascot from "@/assets/monchis-dino.png.asset.json";
import { Logo } from "@/components/monchis/Brand";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Monchis — Loyalty Club" },
      { name: "description", content: "Panel del negocio Monchis Burguers: escanea QR, registra compras y gestiona clientes." },
      { property: "og:title", content: "Panel Monchis Loyalty Club" },
      { property: "og:description", content: "Gestiona la fidelización de Monchis Burguers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  beforeLoad: () => requireStaff(),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, admin: true },
  { to: "/admin/escanear", label: "Escanear QR", icon: ScanLine },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/compra", label: "Registrar compra", icon: ReceiptText },
  { to: "/admin/recompensas", label: "Recompensas", icon: Gift, admin: true },
  { to: "/admin/movimientos", label: "Movimientos", icon: ListOrdered },
  { to: "/admin/notificaciones", label: "Notificaciones", icon: Bell, admin: true },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings, admin: true },
] as const;

function AdminLayout() {
  const { staffRole: role } = Route.useRouteContext();
  const hydrated = useStore((s) => s.hydrated && s.role !== null && s.role !== "cliente");
  const me = useStore((s) => s.employees.find((e) => e.id === s.userId));
  const signOut = useStore((s) => s.signOut);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = nav.filter((n) => role === "admin" || !("admin" in n));
  const logout = async () => { await signOut(); navigate({ to: "/personal", replace: true }); };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar p-4">
      <Logo small />
      <nav className="mt-8 flex-1 space-y-1">
        {items.map((n) => (
          <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">
            <n.icon className="h-4 w-4" />{n.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3">
        <img src={mascot.url} alt="" className="h-9 w-9 object-contain drop-shadow-lg" />
        <div className="min-w-0 flex-1 text-xs"><p className="truncate font-bold">{me?.name ?? "Personal"}</p><p className="text-muted-foreground">{role === "admin" ? "Administrador" : "Cajero"}</p></div>
        <button onClick={logout} aria-label="Cerrar sesión" className="text-muted-foreground hover:text-primary"><LogOut className="h-4 w-4" /></button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="animate-rise">{sidebar}</div>
          <button className="flex-1 bg-background/70" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X className="ml-auto mr-4 mt-4 h-6 w-6" /></button>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu className="h-6 w-6" /></button>
          <p className="hidden text-sm font-semibold text-muted-foreground lg:block">Panel del negocio · {role === "admin" ? "Administrador" : "Cajero"}</p>
          <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-primary">Ver sitio</Link>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          {hydrated ? <Outlet /> : <div className="flex justify-center py-20"><img src={mascot.url} alt="" className="h-20 w-20 object-contain drop-shadow-lg animate-float" /></div>}
        </main>
      </div>
    </div>
  );
}
