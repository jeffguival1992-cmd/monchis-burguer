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
      { name: "description", content: "Regístrate en segundos y recibe tu tarjeta digital Monchis con puntos de bienvenida." },
      { property: "og:title", content: "Únete a Monchis Loyalty Club" },
      { property: "og:description", content: "Tu tarjeta digital con QR y puntos de bienvenida." },
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
  const [f, setF] = useState({ name: "", email: "", phone: "", birthdate: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

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
      <div className="relative mt-10 rounded-3xl border border-border bg-card p-6 pt-16 animate-rise">
        <img src={mascot.url} alt="Dino Monchis" width={1024} height={1024} className="absolute -top-14 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full object-cover animate-float" />
        <h1 className="text-center text-3xl">¡Únete al club!</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Recibe <b className="text-accent">{welcome} puntos</b> de regalo al registrarte.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field id="name" label="Nombre completo"><Input id="name" value={f.name} onChange={set("name")} placeholder="Ej. Laura Méndez" autoComplete="name" /></Field>
          <Field id="email" label="Correo electrónico"><Input id="email" type="email" value={f.email} onChange={set("email")} placeholder="laura@mail.com" autoComplete="email" /></Field>
          <Field id="phone" label="Número de celular"><Input id="phone" type="tel" value={f.phone} onChange={set("phone")} placeholder="0991234567" autoComplete="tel" /></Field>
          <Field id="birthdate" label="Fecha de nacimiento"><Input id="birthdate" type="date" value={f.birthdate} onChange={set("birthdate")} max="2020-12-31" /></Field>
          {error && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="xl" className="w-full">UNIRME A MONCHIS</Button>
          <button type="button" className="w-full text-xs text-muted-foreground underline" onClick={() => setF({ name: "Laura Méndez", email: `laura${Math.floor(Math.random() * 999)}@mail.com`, phone: "0991234567", birthdate: "1998-04-12" })}>
            Rellenar con datos de prueba
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
