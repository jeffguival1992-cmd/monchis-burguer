import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "@/lib/store";

const maria = () => useStore.getState().customers.find((c) => c.id === "c1")!;

describe("loyalty rules", () => {
  beforeEach(() => useStore.getState().reset());

  it("USD 15 purchase gives 15 points", () => {
    const before = maria().points;
    const r = useStore.getState().registerPurchase({ customerId: "c1", amount: 15, orderNumber: "T-1", branchId: "b1" });
    expect(r).toEqual({ ok: true, points: 15 });
    expect(maria().points).toBe(before + 15);
  });

  it("8 stamps complete a free burger", () => {
    useStore.getState().setMode("stamps");
    useStore.setState((s) => ({ customers: s.customers.map((c) => (c.id === "c1" ? { ...c, stamps: 7 } : c)) }));
    useStore.getState().registerPurchase({ customerId: "c1", amount: 5, orderNumber: "T-2", branchId: "b1" });
    expect(maria().stamps).toBe(8);
    expect(useStore.getState().redeem("c1", "r1").ok).toBe(true);
    expect(maria().stamps).toBe(0);
  });

  it("redeeming deducts reward cost and rejects insufficient points", () => {
    const before = maria().points; // 250
    expect(useStore.getState().redeem("c1", "r1").ok).toBe(true);
    expect(maria().points).toBe(before - 150);
    expect(useStore.getState().redeem("c1", "r5").ok).toBe(false);
  });

  it("quick sign-up needs only a 10-digit cédula and phone, then profile can be completed", () => {
    const st = useStore.getState();
    expect(st.register({ cedula: "123", phone: "0991234567" }).ok).toBe(false);
    const r = st.register({ cedula: "0955555555", phone: "0991234567" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.customer.name).toBe("");
    expect(useStore.getState().register({ cedula: "0955555555", phone: "0990000000" }).ok).toBe(false);
    expect(useStore.getState().updateProfile(r.customer.id, { name: "Laura Méndez", email: "laura@mail.com", birthdate: "1998-04-12" }).ok).toBe(true);
    expect(useStore.getState().customers.find((c) => c.id === r.customer.id)?.name).toBe("Laura Méndez");
  });
});
