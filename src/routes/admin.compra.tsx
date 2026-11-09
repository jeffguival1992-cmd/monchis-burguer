import { createFileRoute } from "@tanstack/react-router";
import { CustomerSearch, IdentifiedCustomer, PageTitle, Panel } from "@/components/monchis/AdminParts";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/compra")({
  head: () => ({ meta: [{ title: "Registrar compra — Panel Monchis" }, { name: "description", content: "Registra compras y entrega puntos a socios Monchis." }, { property: "og:title", content: "Registrar compra — Panel Monchis" }, { property: "og:description", content: "Entrega puntos al instante." }] }),
  component: Compra,
});

function Compra() {
  const selected = useStore((s) => s.selectedCustomerId);
  const select = useStore((s) => s.selectCustomer);
  const mode = useStore((s) => s.settings.mode);
  return (
    <>
      <PageTitle title="Registrar compra" sub={mode === "stamps" ? "Modo sellos: cada compra suma 1 sello." : "Modo puntos: USD 1 = 1 punto."} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="1. Busca al cliente"><CustomerSearch onPick={(c) => select(c.id)} /></Panel>
        <Panel title="2. Registra la compra">
          {selected ? <IdentifiedCustomer customerId={selected} onClear={() => select(null)} /> : <p className="py-10 text-center text-sm text-muted-foreground">Selecciona un cliente primero.</p>}
        </Panel>
      </div>
    </>
  );
}
