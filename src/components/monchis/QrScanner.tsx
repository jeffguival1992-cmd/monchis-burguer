import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Html5QrcodeT = import("html5-qrcode").Html5Qrcode;

export function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<Html5QrcodeT | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cb = useRef(onResult);
  cb.current = onResult;

  const stop = async () => {
    const s = ref.current;
    ref.current = null;
    setActive(false);
    if (s) { try { await s.stop(); s.clear(); } catch { /* already stopped */ } }
  };

  const start = async () => {
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("qr-reader", { verbose: false });
      ref.current = s;
      setActive(true);
      await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, (text) => { cb.current(text); stop(); }, () => {});
    } catch (e) {
      setActive(false);
      ref.current = null;
      setError("No pudimos acceder a la cámara. Revisa los permisos o usa la búsqueda manual / carga de imagen.");
      console.warn(e);
    }
  };

  const scanFile = async (f: File) => {
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("qr-file", { verbose: false });
      const text = await s.scanFile(f, false);
      cb.current(text);
    } catch {
      setError("No encontramos un QR válido en esa imagen.");
    }
  };

  useEffect(() => () => { stop(); }, []);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-dashed border-primary/50 bg-muted">
        <div id="qr-reader" className="h-full w-full [&_video]:h-full [&_video]:object-cover" />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Camera className="h-12 w-12 text-primary" />
            <p className="text-sm text-muted-foreground">Apunta la cámara al QR de la tarjeta del cliente</p>
          </div>
        )}
      </div>
      <div id="qr-file" className="hidden" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {active ? (
          <Button variant="secondary" size="lg" onClick={stop}><CameraOff className="mr-2 h-4 w-4" />Detener</Button>
        ) : (
          <Button variant="hero" size="lg" onClick={start}><Camera className="mr-2 h-4 w-4" />Activar cámara</Button>
        )}
        <Button variant="outline" size="lg" onClick={() => fileRef.current?.click()}><ImageUp className="mr-2 h-4 w-4" />Subir imagen QR</Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) scanFile(f); e.target.value = ""; }} />
      </div>
      {error && <p className="mt-3 rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
