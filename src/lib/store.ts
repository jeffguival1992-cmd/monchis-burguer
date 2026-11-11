import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { buildSeed, type Customer, type Movement, type Notification, type Purchase, type Redemption, type Seed } from "./mock-data";

export type Role = "cliente" | "cajero" | "admin";
export type Celebration = { kind: "points" | "reward" | "welcome" | "stamp"; title: string; message: string } | null;

type State = Seed & {
  role: Role;
  currentCustomerId: string | null;
  selectedCustomerId: string | null;
  celebration: Celebration;
  hydrated: boolean;
  setRole: (r: Role) => void;
  setCurrentCustomer: (id: string | null) => void;
  selectCustomer: (id: string | null) => void;
  clearCelebration: () => void;
  register: (d: { cedula: string; phone: string }) => { ok: true; customer: Customer } | { ok: false; error: string };
  updateProfile: (id: string, d: { name: string; email: string; birthdate: string }) => { ok: true } | { ok: false; error: string };
  registerPurchase: (d: { customerId: string; amount: number; orderNumber: string; branchId: string }) => { ok: true; points: number } | { ok: false; error: string };
  redeem: (customerId: string, rewardId: string) => { ok: true } | { ok: false; error: string };
  sendNotification: (d: { customerIds: string[]; type: Notification["type"]; title: string; message: string }) => number;
  markRead: (customerId: string) => void;
  setMode: (m: "points" | "stamps") => void;
  updateSettings: (s: Partial<Seed["settings"]>) => void;
  toggleReward: (id: string) => void;
  reset: () => void;
};

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;
export const now = () => new Date().toISOString();

export function findByQr(customers: Customer[], text: string) {
  const code = text.trim().replace(/^MONCHIS:/i, "").toUpperCase();
  return customers.find((c) => c.code.toUpperCase() === code) ?? null;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      role: "cliente",
      currentCustomerId: null,
      selectedCustomerId: null,
      celebration: null,
      hydrated: false,
      setRole: (role) => set({ role }),
      setCurrentCustomer: (currentCustomerId) => set({ currentCustomerId }),
      selectCustomer: (selectedCustomerId) => set({ selectedCustomerId }),
      clearCelebration: () => set({ celebration: null }),

      register: (d) => {
        const s = get();
        const cedula = d.cedula.replace(/\D/g, "");
        const phone = d.phone.replace(/\s/g, "");
        if (!/^\d{10}$/.test(cedula)) return { ok: false, error: "La cédula debe tener 10 dígitos." };
        if (!/^09\d{8}$/.test(phone)) return { ok: false, error: "Ingresa un celular válido (09xxxxxxxx)." };
        if (s.customers.some((c) => c.cedula === cedula)) return { ok: false, error: "Ya existe un socio con esa cédula." };
        const n = s.customers.length + 1;
        const bonus = s.settings.welcomePoints;
        const customer: Customer = {
          id: uid("c"), code: `MON-${String(1000 + n)}`, cedula, name: "", email: "", phone,
          birthdate: "", points: bonus, totalEarned: bonus, totalUsed: 0, stamps: 0, visits: 0,
          joinedAt: now(), branchId: s.branches[0]?.id ?? "b1",
        };
        const mv: Movement = { id: uid("m"), customerId: customer.id, type: "bonus", points: bonus, description: "Bono de bienvenida", date: now() };
        const nt: Notification = { id: uid("n"), customerId: customer.id, type: "reward", title: "¡Bienvenido al club!", message: `¡Hola! Te regalamos ${bonus} puntos de bienvenida.`, date: now(), read: false };
        set({
          customers: [customer, ...s.customers], movements: [mv, ...s.movements], notifications: [nt, ...s.notifications],
          currentCustomerId: customer.id,
          celebration: { kind: "welcome", title: "¡BIENVENIDO A MONCHIS!", message: `Tu tarjeta está lista. Ganaste ${bonus} puntos de bienvenida.` },
        });
        return { ok: true, customer };
      },

      updateProfile: (id, d) => {
        const email = d.email.trim().toLowerCase();
        if (!d.name.trim()) return { ok: false, error: "Ingresa tu nombre." };
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Correo electrónico no válido." };
        if (email && get().customers.some((c) => c.id !== id && c.email === email)) return { ok: false, error: "Ese correo ya está registrado." };
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, name: d.name.trim(), email, birthdate: d.birthdate } : c)) }));
        return { ok: true };
      },

      registerPurchase: ({ customerId, amount, orderNumber, branchId }) => {
        const s = get();
        const c = s.customers.find((x) => x.id === customerId);
        if (!c) return { ok: false, error: "Cliente no encontrado." };
        if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Ingresa un valor de compra mayor a 0." };
        if (amount > 1000) return { ok: false, error: "El valor máximo por compra es USD 1000." };
        if (!orderNumber.trim()) return { ok: false, error: "Ingresa el número de pedido." };
        if (s.purchases.some((p) => p.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase())) return { ok: false, error: "Ese número de pedido ya fue registrado." };
        const stampsMode = s.settings.mode === "stamps";
        const pts = stampsMode ? 0 : Math.floor(amount * s.settings.pointsPerUsd);
        const p: Purchase = { id: uid("p"), customerId, amount, orderNumber: orderNumber.trim(), branchId, points: pts, date: now(), employeeId: s.employees[s.role === "admin" ? 0 : 1]?.id ?? "e1" };
        let stamps = c.stamps;
        const movements: Movement[] = [];
        const notifications: Notification[] = [];
        let celebration: Celebration;
        if (stampsMode) {
          stamps += 1;
          movements.push({ id: uid("m"), customerId, type: "stamp", points: 0, description: `Sello por pedido ${p.orderNumber}`, date: now() });
          if (stamps >= s.settings.stampsGoal) {
            celebration = { kind: "reward", title: "¡LO LOGRASTE!", message: "TU PREMIO MONCHIS TE ESPERA: hamburguesa gratis." };
            notifications.push({ id: uid("n"), customerId, type: "reward", title: "¡Tarjeta de sellos completa!", message: "Reclama tu hamburguesa gratis en caja.", date: now(), read: false });
          } else celebration = { kind: "stamp", title: "¡GENIAL!", message: `Ganaste 1 sello. Llevas ${stamps} de ${s.settings.stampsGoal}.` };
        } else {
          movements.push({ id: uid("m"), customerId, type: "earn", points: pts, description: `Compra ${p.orderNumber} · USD ${amount.toFixed(2)}`, date: now() });
          celebration = { kind: "points", title: "¡GENIAL!", message: `ACABAS DE GANAR ${pts} PUNTOS` };
        }
        set({
          purchases: [p, ...s.purchases],
          movements: [...movements, ...s.movements],
          notifications: [...notifications, ...s.notifications],
          customers: s.customers.map((x) => x.id === customerId ? { ...x, points: x.points + pts, totalEarned: x.totalEarned + pts, stamps, visits: x.visits + 1 } : x),
          celebration,
        });
        return { ok: true, points: pts };
      },

      redeem: (customerId, rewardId) => {
        const s = get();
        const c = s.customers.find((x) => x.id === customerId);
        const r = s.rewards.find((x) => x.id === rewardId);
        if (!c || !r) return { ok: false, error: "Datos no válidos." };
        if (!r.active) return { ok: false, error: "Esta recompensa no está disponible." };
        const stampReward = s.settings.mode === "stamps" && r.id === "r1";
        if (stampReward) {
          if (c.stamps < s.settings.stampsGoal) return { ok: false, error: `Necesitas ${s.settings.stampsGoal} sellos.` };
        } else if (c.points < r.cost) return { ok: false, error: `Te faltan ${r.cost - c.points} puntos.` };
        const cost = stampReward ? 0 : r.cost;
        const red: Redemption = { id: uid("x"), customerId, rewardId, cost, date: now(), code: `PREMIO-${Math.random().toString(36).slice(2, 7).toUpperCase()}` };
        set({
          redemptions: [red, ...s.redemptions],
          movements: [{ id: uid("m"), customerId, type: "redeem", points: -cost, description: `Canje: ${r.name}${stampReward ? " (sellos)" : ""}`, date: now() }, ...s.movements],
          customers: s.customers.map((x) => x.id === customerId ? { ...x, points: x.points - cost, totalUsed: x.totalUsed + cost, stamps: stampReward ? 0 : x.stamps } : x),
          celebration: { kind: "reward", title: "¡LO LOGRASTE!", message: `TU PREMIO MONCHIS TE ESPERA · ${r.name} · Código ${red.code}` },
        });
        return { ok: true };
      },

      sendNotification: ({ customerIds, type, title, message }) => {
        const s = get();
        const list = customerIds.map((id) => {
          const c = s.customers.find((x) => x.id === id)!;
          return { id: uid("n"), customerId: id, type, title, message: message.replace(/\{nombre\}/gi, c.name.split(" ")[0] || "socio"), date: now(), read: false } as Notification;
        });
        set({ notifications: [...list, ...s.notifications] });
        return list.length;
      },
      markRead: (customerId) => set((s) => ({ notifications: s.notifications.map((n) => (n.customerId === customerId ? { ...n, read: true } : n)) })),
      setMode: (mode) => set((s) => ({ settings: { ...s.settings, mode } })),
      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      toggleReward: (id) => set((s) => ({ rewards: s.rewards.map((r) => (r.id === id ? { ...r, active: !r.active } : r)) })),
      reset: () => set({ ...buildSeed(), currentCustomerId: null, selectedCustomerId: null, celebration: null }),
    }),
    {
      name: "monchis-loyalty-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ celebration, hydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);

export function tierOf(totalEarned: number) {
  if (totalEarned >= 900) return { name: "Dino Legend", next: null as number | null };
  if (totalEarned >= 500) return { name: "Oro", next: 900 };
  if (totalEarned >= 200) return { name: "Plata", next: 500 };
  return { name: "Bronce", next: 200 };
}
