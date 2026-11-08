import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, ScanLine, LayoutDashboard, Smartphone } from "lucide-react";
import burger from "@/assets/burger-hero.jpg";
import mascot from "@/assets/mascot.png";
import { DemoSwitcher, Logo, SimBadge } from "@/components/monchis/Brand";
import { Button } from "@/components/ui/button";
import { useStore, type Role } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monchis Loyalty Club — Come, acumula y disfruta" },
      { name: "description", content: "Tarjeta de fidelidad digital de Monchis Burguers: acumula puntos con cada compra y canjea premios." },
      { property: "og:title", content: "Monchis Loyalty Club" },
      { property: "og:description", content: "Come, acumula y disfruta con la tarjeta digital de Monchis Burguers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});

const demos: { role: Role; title: string; desc: string; icon: typeof Smartphone; to: "/cliente" | "/admin/escanear" | "/admin" }[] = [
  { role: "cliente", title: "DEMO CLIENTE", desc: "Tarjeta digital, puntos, premios y bandeja de mensajes.", icon: Smartphone, to: "/cliente" },
  { role: "cajero", title: "DEMO CAJERO", desc: "Escanea el QR, registra la compra y entrega puntos en segundos.", icon: ScanLine, to: "/admin/escanear" },
  { role: "admin", title: "DEMO ADMINISTRADOR", desc: "Dashboard, clientes, recompensas, notificaciones y ajustes.", icon: LayoutDashboard, to: "/admin" },
];

function Portal() {
  const setRole = useStore((s) => s.setRole);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Logo />
        <DemoSwitcher />
      </header>

      <section className="relative mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[2rem]">
          <img src={burger} alt="Hamburguesa doble Monchis con tocino y papas" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
          <div className="relative grid gap-8 p-6 py-12 sm:p-12 md:grid-cols-[1.2fr_1fr] md:py-20">
            <div className="animate-rise">
              <p className="text-xs font-extrabold tracking-[0.35em] text-primary">MONCHIS LOYALTY CLUB</p>
              <h1 className="mt-3 text-5xl leading-[0.95] sm:text-7xl">COME,<br /><span className="text-primary">ACUMULA</span><br /><span className="text-accent">Y DISFRUTA</span></h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">Tu tarjeta de fidelidad vive en tu celular. Sin apps, sin papel: escanea, suma puntos y llévate burgers gratis.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl"><Link to="/registro">UNIRME A MONCHIS <ArrowRight className="ml-1 h-5 w-5" /></Link></Button>
                <Button asChild variant="outline" size="xl"><Link to="/cliente">Ya soy socio</Link></Button>
              </div>
            </div>
            <div className="flex items-end justify-center md:justify-end">
              <div className="animate-pop rounded-3xl border border-border bg-card/90 p-5 text-center backdrop-blur">
                <p className="font-display text-lg">QR de bienvenida</p>
                <p className="mb-3 text-xs text-muted-foreground">Así lo verías en la mesa del local</p>
                <Link to="/registro" className="block rounded-2xl bg-foreground p-3">
                  <QRCodeSVG value="https://monchis.club/registro" size={150} bgColor="transparent" />
                </Link>
                <p className="mt-2 text-xs text-muted-foreground">Toca el QR para simular el escaneo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">Prueba la plataforma</h2>
          <img src={mascot} alt="" width={1024} height={1024} loading="lazy" className="h-20 w-20 animate-float" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {demos.map((d, i) => (
            <button key={d.role} onClick={() => { setRole(d.role); navigate({ to: d.to }); }} className="group animate-rise rounded-3xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-glow" style={{ animationDelay: `${i * 0.08}s` }}>
              <d.icon className="h-9 w-9 text-primary" />
              <p className="font-display mt-4 text-2xl">{d.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
              <p className="mt-4 flex items-center gap-1 text-sm font-bold text-accent">Entrar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></p>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-2">
          <div>
            <SimBadge real />
            <p className="mt-2 text-sm text-muted-foreground">Generación de QR, lectura con cámara o imagen, cálculo de puntos, canjes, historial y datos guardados en este navegador.</p>
          </div>
          <div>
            <SimBadge />
            <p className="mt-2 text-sm text-muted-foreground">Clientes, compras y empleados de ejemplo, y notificaciones que solo aparecen en la bandeja interna (no se envía nada real).</p>
          </div>
        </div>
      </section>
    </div>
  );
}
