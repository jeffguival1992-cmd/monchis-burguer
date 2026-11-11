import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import mascot from "@/assets/monchis-dinosaurio.jpeg.asset.json";
import { Logo } from "@/components/monchis/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Únete a Monchis Loyalty Club" },
      { name: "description", content: "Crea tu cuenta Monchis en segundos con tu cédula y celular." },
      { property: "og:title", content: "Únete a Monchis Loyalty Club" },
      { property: "og:description", content: "Registro rápido con cédula y celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registro,
});

function Registro() {
  const register = useStore((s) => s.register);
  const setRole = useStore((s) => s.setRole);
  const welcome = useStore((s) => s.settings.welcomePoints);
  const navigate = useNavigate();
  const [f, setF] = useState({ cedula: "", phone: "" });
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = register(f);
    if (!r.ok) { setError(r.error); return; }
    setRole("cliente");
    navigate({ to: "/cliente" });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 py-5">
      <Logo />
      <div className="relative mt-14 rounded-3xl border border-border bg-card p-6 pt-16 animate-rise">
        <img src={mascot.url} alt="Dino Monchis" width={1254} height={1254} className="absolute -top-14 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full object-cover animate-float" />
        <h1 className="text-center text-3xl">¡Únete al club!</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Solo 2 datos y recibes <b className="text-accent">{welcome} puntos</b> de regalo.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5"><Label htmlFor="cedula">Cédula</Label><Input id="cedula" inputMode="numeric" maxLength={10} value={f.cedula} onChange={(e) => setF({ ...f, cedula: e.target.value.replace(/\D/g, "") })} placeholder="0912345678" className="h-12 text-lg" /></div>
          <div className="space-y-1.5"><Label htmlFor="phone">Número de celular</Label><Input id="phone" type="tel" inputMode="numeric" maxLength={10} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} placeholder="0991234567" autoComplete="tel" className="h-12 text-lg" /></div>
          {error && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="xl" className="w-full">CREAR MI CUENTA</Button>
          <p className="text-center text-xs text-muted-foreground">Luego podrás completar tu perfil.</p>
          <button type="button" className="w-full text-xs text-muted-foreground underline" onClick={() => setF({ cedula: String(Math.floor(1e9 + Math.random() * 8e8)).padStart(10, "0"), phone: "0991234567" })}>
            Rellenar con datos de prueba
          </button>
        </form>
      </div>
    </div>
  );
}
