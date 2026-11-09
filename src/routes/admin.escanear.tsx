import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CustomerSearch, IdentifiedCustomer, PageTitle, Panel } from "@/components/monchis/AdminParts";
import { SimBadge } from "@/components/monchis/Brand";
import { QrScanner } from "@/components/monchis/QrScanner";
import mascot from "@/assets/mascot.png";
import { findByQr, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/escanear")({
  head: () => ({ meta: [{ title: "Escanear QR — Panel Monchis" }, { name: "description", content: "Identifica al cliente escaneando su QR Monchis." }, { property: "og:title", content: "Escanear QR — Panel Monchis" }, { property: "og:description", content: "Identifica clientes en segundos." }] }),
  component: Escanear,
});

function Escanear() {
  const selected = useStore((s) => s.selectedCustomerId);
  const select = useStore((s) => s.selectCustomer);
  const onScan = (text: string) => {
    const c = findByQr(useStore.getState().customers, text);
    if (!c) { toast.error("QR no reconocido. Usa un QR generado por Monchis."); return; }
    select(c.id);
    toast.success(`Cliente identificado: ${c.name}`);
  };
  return (
    <>
      <PageTitle title="Escanear QR" sub="Identifica al cliente, registra la compra y entrega puntos."><SimBadge real /></PageTitle>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <QrScanner onResult={onScan} />
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Búsqueda alternativa</p>
            <CustomerSearch onPick={(c) => select(c.id)} />
          </div>
        </Panel>
        <Panel title="Cliente">
          {selected ? <IdentifiedCustomer customerId={selected} onClear={() => select(null)} /> : (
            <div className="flex flex-col items-center py-12 text-center">
              <img src={mascot} alt="" className="h-28 w-28 animate-float" />
              <p className="mt-3 font-semibold">Esperando cliente…</p>
              <p className="text-sm text-muted-foreground">Escanea su QR o búscalo por nombre, correo, teléfono o código.</p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
