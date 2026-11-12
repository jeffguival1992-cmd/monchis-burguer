import { displayName } from "@/lib/format";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Expand } from "lucide-react";
import mascot from "@/assets/monchis-dino.png.asset.json";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { Customer } from "@/lib/mock-data";
import { tierOf, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const qrValue = (c: Customer) => `MONCHIS:${c.code}`;

export function LoyaltyCard({ customer, compact }: { customer: Customer; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const settings = useStore((s) => s.settings);
  const rewards = useStore((s) => s.rewards);
  const tier = tierOf(customer.totalEarned);
  const next = rewards.filter((r) => r.active).sort((a, b) => a.cost - b.cost).find((r) => r.cost > customer.points);
  const available = rewards.filter((r) => r.active && r.cost <= customer.points).sort((a, b) => b.cost - a.cost)[0];
  const stampsMode = settings.mode === "stamps";
  const progress = stampsMode ? (customer.stamps / settings.stampsGoal) * 100 : next ? (customer.points / next.cost) * 100 : 100;

  const download = () => {
    const canvas = document.getElementById(`qr-big-${customer.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `monchis-${customer.code}.png`;
    a.click();
  };

  return (
    <>
      <div className={cn("relative overflow-hidden rounded-3xl bg-loyalty-card p-5 text-primary-foreground shadow-glow", compact ? "" : "sm:p-6")}>
        <img src={mascot.url} alt="" width={1024} height={1024} className="pointer-events-none absolute bottom-4 right-4 h-24 w-24 object-contain drop-shadow-lg opacity-95" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-display text-2xl leading-none">MONCHIS</p>
            <p className="text-[10px] font-extrabold tracking-[0.3em]">LOYALTY CLUB</p>
          </div>
          <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-accent">{tier.name}</span>
        </div>
        <div className="relative mt-5 flex items-end gap-4">
          <button onClick={() => setOpen(true)} className="group relative rounded-2xl bg-foreground p-2 transition-transform hover:scale-105" aria-label="Ampliar QR">
            <QRCodeCanvas value={qrValue(customer)} size={compact ? 76 : 96} bgColor="transparent" />
            <Expand className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background p-1 text-primary" />
          </button>
          <div className="min-w-0 pb-1">
            <p className="truncate text-lg font-extrabold">{displayName(customer)}</p>
            <p className="font-mono text-sm font-bold opacity-80">{customer.code}</p>
          </div>
        </div>
        <div className="relative mt-5 max-w-[70%]">
          {stampsMode ? (
            <>
              <p className="text-xs font-bold uppercase opacity-80">Sellos</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {Array.from({ length: settings.stampsGoal }).map((_, i) => (
                  <span key={i} className={cn("flex h-7 w-7 items-center justify-center rounded-full border-2 border-background/60 text-sm", i < customer.stamps ? "bg-background" : "bg-background/10")}>
                    {i < customer.stamps ? "🍔" : ""}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold">{customer.stamps >= settings.stampsGoal ? "¡Hamburguesa gratis lista!" : `${settings.stampsGoal - customer.stamps} sellos para tu burger gratis`}</p>
            </>
          ) : (
            <>
              <p className="font-display text-5xl leading-none">{customer.points}<span className="ml-1 font-sans text-sm font-bold">pts</span></p>
              <Progress value={Math.min(100, progress)} className="mt-3 h-2 bg-background/25 [&>div]:bg-background" />
              <p className="mt-1.5 text-xs font-semibold">
                {available ? `Disponible: ${available.emoji} ${available.name}` : ""}
                {available && next ? " · " : ""}
                {next ? `${next.cost - customer.points} pts para ${next.name}` : ""}
              </p>
            </>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-2xl">Muestra este QR en caja</DialogTitle></DialogHeader>
          <div className="mx-auto rounded-3xl bg-foreground p-5">
            <QRCodeCanvas id={`qr-big-${customer.id}`} value={qrValue(customer)} size={240} marginSize={2} />
          </div>
          <p className="text-center font-mono text-xl font-bold">{customer.code}</p>
          <Button variant="outline" onClick={download}><Download className="mr-2 h-4 w-4" />Descargar mi QR</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
