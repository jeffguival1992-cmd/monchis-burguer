import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, ScanLine, Gift, Smartphone } from "lucide-react";
import burger from "@/assets/burger-hero.jpg";
import mascot from "@/assets/monchis-dino.png.asset.json";
import { Logo } from "@/components/monchis/Brand";
import { Button } from "@/components/ui/button";

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

const steps = [
  { title: "REGÍSTRATE", desc: "Solo tu cédula y celular. Recibes puntos de bienvenida al instante.", icon: Smartphone },
  { title: "MUESTRA TU QR", desc: "En caja escaneamos tu tarjeta digital y sumas 1 punto por cada dólar.", icon: ScanLine },
  { title: "CANJEA PREMIOS", desc: "Burgers, papas y bebidas gratis. ¡Cada 8 sellos, una burger de regalo!", icon: Gift },
];

function Portal() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/admin">Personal</Link></Button>
          <Button asChild variant="hero" size="sm"><Link to="/cliente">Mi tarjeta</Link></Button>
        </div>
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
                <p className="font-display text-lg">Escanea y únete</p>
                <p className="mb-3 text-xs text-muted-foreground">Disponible en todas nuestras mesas</p>
                <Link to="/registro" className="block rounded-2xl bg-foreground p-3">
                  <QRCodeSVG value="https://monchis.club/registro" size={150} bgColor="transparent" />
                </Link>
                <p className="mt-2 text-xs text-muted-foreground">O toca el código para registrarte</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl">¿Cómo funciona?</h2>
          <img src={mascot.url} alt="" width={1024} height={1024} loading="lazy" className="h-20 w-20 object-contain drop-shadow-lg animate-float" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((d, i) => (
            <div key={d.title} className="animate-rise rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-glow" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-flame font-display text-xl text-primary-foreground">{i + 1}</span><d.icon className="h-8 w-8 text-primary" /></div>
              <p className="font-display mt-4 text-2xl">{d.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-loyalty-card p-8 text-center text-primary-foreground shadow-glow">
          <p className="font-display text-3xl sm:text-4xl">COME, ACUMULA Y DISFRUTA</p>
          <Button asChild size="xl" className="bg-foreground text-background hover:bg-foreground/90"><Link to="/registro">CREAR MI CUENTA GRATIS</Link></Button>
        </div>
      </section>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Monchis Burguers · Monchis Loyalty Club</footer>
    </div>
  );
}
