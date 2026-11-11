import { Link } from "@tanstack/react-router";
import logo from "@/assets/monchis-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className, small }: { className?: string; small?: boolean }) {
  return (
    <Link to="/" aria-label="Monchis Burguers — Inicio" className={cn("flex shrink-0 items-center", className)}>
      <img src={logo.url} alt="Monchis Burguers" width={900} height={612} className={cn("object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]", small ? "h-14 w-auto" : "h-20 w-auto sm:h-24")} />
    </Link>
  );
}
