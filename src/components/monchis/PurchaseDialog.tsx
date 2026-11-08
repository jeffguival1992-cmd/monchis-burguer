import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export function PurchaseDialog({ customer, open, onOpenChange }: { customer: Customer | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const branches = useStore((s) => s.branches);
  const settings = useStore((s) => s.settings);
  const registerPurchase = useStore((s) => s.registerPurchase);
  const [amount, setAmount] = useState("");
  const [order, setOrder] = useState("");
  const [branch, setBranch] = useState("b1");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setAmount(""); setOrder(`ORD-${Math.floor(6000 + Math.random() * 3999)}`); setError(""); }
  }, [open]);

  const pts = Math.floor((parseFloat(amount) || 0) * settings.pointsPerUsd);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const r = registerPurchase({ customerId: customer.id, amount: parseFloat(amount), orderNumber: order, branchId: branch });
    if (!r.ok) { setError(r.error); return; }
    toast.success(settings.mode === "stamps" ? `Sello entregado a ${customer.name}` : `${r.points} puntos entregados a ${customer.name}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Registrar compra</DialogTitle>
          <DialogDescription>{customer?.name} · {customer?.code}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor de la compra (USD)</Label>
            <Input id="amount" autoFocus inputMode="decimal" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15.00" className="mt-1 h-14 text-2xl font-bold" />
            <div className="mt-2 flex gap-2">
              {[5, 10, 15, 25].map((v) => (
                <button type="button" key={v} onClick={() => setAmount(String(v))} className="flex-1 rounded-xl border border-border py-1.5 text-sm font-semibold hover:border-primary hover:text-primary">${v}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="order">N.º de pedido</Label>
              <Input id="order" value={order} onChange={(e) => setOrder(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="branch">Sucursal</Label>
              <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-2xl bg-muted p-4 text-center">
            {settings.mode === "stamps" ? (
              <p className="font-display text-2xl text-accent">+1 sello 🍔</p>
            ) : (
              <p className="font-display text-3xl text-accent">+{pts} puntos</p>
            )}
            <p className="text-xs text-muted-foreground">Regla: USD 1 = {settings.pointsPerUsd} punto{settings.pointsPerUsd > 1 ? "s" : ""} · modo {settings.mode === "stamps" ? "sellos" : "puntos"}</p>
          </div>
          {error && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="xl" className="w-full">CONFIRMAR Y ENTREGAR</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
