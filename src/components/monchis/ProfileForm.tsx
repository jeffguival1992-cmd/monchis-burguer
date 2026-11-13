import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/lib/types";
import { useStore } from "@/lib/store";

export const profileComplete = (c: Customer) => Boolean(c.name.trim() && c.email && c.birthdate);

export function ProfileForm({ customer, onDone }: { customer: Customer; onDone?: () => void }) {
  const update = useStore((s) => s.updateProfile);
  const [f, setF] = useState({ name: customer.name, email: customer.email, birthdate: customer.birthdate });
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = update(customer.id, f);
    if (!r.ok) { setError(r.error); return; }
    setError(""); toast.success("¡Perfil actualizado!"); onDone?.();
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><Label htmlFor="p-name">Nombre completo</Label><Input id="p-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej. Laura Méndez" autoComplete="name" /></div>
      <div className="space-y-1.5"><Label htmlFor="p-email">Correo electrónico</Label><Input id="p-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="laura@mail.com" autoComplete="email" /></div>
      <div className="space-y-1.5"><Label htmlFor="p-birth">Fecha de nacimiento</Label><Input id="p-birth" type="date" value={f.birthdate} max="2020-12-31" onChange={(e) => setF({ ...f, birthdate: e.target.value })} /></div>
      <p className="text-xs text-muted-foreground">Cédula {customer.cedula} · Celular {customer.phone}</p>
      {error && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
      <Button type="submit" variant="hero" className="w-full">GUARDAR PERFIL</Button>
    </form>
  );
}
