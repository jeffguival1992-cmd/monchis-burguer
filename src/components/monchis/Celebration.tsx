import { useEffect } from "react";
import mascot from "@/assets/monchis-dino.png.asset.json";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

const CONFETTI = ["🍔", "🍟", "⭐", "🥤", "🎉", "🦖"];

export function CelebrationOverlay() {
  const c = useStore((s) => s.celebration);
  const clear = useStore((s) => s.clearCelebration);
  useEffect(() => {
    if (!c) return;
    const t = setTimeout(clear, 6000);
    return () => clearTimeout(t);
  }, [c, clear]);
  if (!c) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-6 backdrop-blur-md" onClick={clear}>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="pointer-events-none absolute animate-float text-3xl opacity-80" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 90}%`, animationDelay: `${(i % 6) * 0.3}s` }}>
          {CONFETTI[i % CONFETTI.length]}
        </span>
      ))}
      <div className="relative w-full max-w-sm animate-pop rounded-3xl border border-border bg-card p-8 text-center shadow-glow" onClick={(e) => e.stopPropagation()}>
        <img src={mascot.url} alt="" width={1024} height={1024} className="mx-auto -mt-24 h-36 w-36 object-contain drop-shadow-lg animate-float" />
        <h2 className="mt-2 text-4xl text-accent">{c.title}</h2>
        <p className="font-display mt-2 text-xl text-foreground">{c.message}</p>
        <Button variant="hero" size="xl" className="mt-6 w-full" onClick={clear}>¡Monchis!</Button>
      </div>
    </div>
  );
}
