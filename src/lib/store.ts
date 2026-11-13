import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Customer, Movement, Notification, Seed } from "./types";

export type Role = "cliente" | "cajero" | "admin";
export type Celebration = { kind: "points" | "reward" | "welcome" | "stamp"; title: string; message: string } | null;
type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

type State = Seed & {
  role: Role | null;
  userId: string | null;
  currentCustomerId: string | null;
  selectedCustomerId: string | null;
  celebration: Celebration;
  hydrated: boolean;
  load: () => Promise<void>;
  signOut: () => Promise<void>;
  selectCustomer: (id: string | null) => void;
  celebrate: (c: Celebration) => void;
  clearCelebration: () => void;
  updateProfile: (d: { name: string; email: string; birthdate: string }) => Promise<Result>;
  registerPurchase: (d: { customerId: string; amount: number; orderNumber: string; branchId: string }) => Promise<Result<{ points: number }>>;
  redeem: (customerId: string, rewardId: string) => Promise<Result<{ code: string }>>;
  sendNotification: (d: { customerIds: string[]; type: Notification["type"]; title: string; message: string }) => Promise<Result<{ count: number }>>;
  markRead: () => Promise<void>;
  updateSettings: (s: Seed["settings"]) => Promise<Result>;
  saveReward: (r: { id?: string; name: string; description: string; cost: number; emoji: string; active: boolean }) => Promise<Result>;
};

const empty: Seed = {
  customers: [], employees: [], branches: [], purchases: [], rewards: [], movements: [], redemptions: [], notifications: [],
  settings: { mode: "points", pointsPerUsd: 1, stampsGoal: 8, welcomePoints: 20 },
};

const errMsg = (e: { message?: string } | null | undefined) => e?.message?.replace(/^.*?: /, "") || "Ocurrió un error. Intenta de nuevo.";

export function findByQr(customers: Customer[], text: string) {
  const code = text.trim().replace(/^MONCHIS:/i, "").toUpperCase();
  return customers.find((c) => c.code.toUpperCase() === code) ?? null;
}

export const useStore = create<State>()((set, get) => ({
  ...empty,
  role: null,
  userId: null,
  currentCustomerId: null,
  selectedCustomerId: null,
  celebration: null,
  hydrated: false,

  load: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [settings, rewards, branches] = await Promise.all([
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("rewards").select("*").order("cost"),
      supabase.from("branches").select("*").order("id"),
    ]);
    const base = {
      settings: settings.data ? { mode: settings.data.mode as "points" | "stamps", pointsPerUsd: settings.data.points_per_usd, stampsGoal: settings.data.stamps_goal, welcomePoints: settings.data.welcome_points } : empty.settings,
      rewards: (rewards.data ?? []).map((r) => ({ id: r.id, name: r.name, description: r.description, cost: r.cost, emoji: r.emoji, active: r.active })),
      branches: branches.data ?? [],
    };
    if (!user) { set({ ...empty, ...base, role: null, userId: null, currentCustomerId: null, hydrated: true }); return; }

    // Row-level security returns only what this user may see (own card for clients, everything for staff).
    const [roles, customers, purchases, movements, redemptions, notifications, staff] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("customers").select("*").order("joined_at", { ascending: false }),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("movements").select("*").order("created_at", { ascending: false }),
      supabase.from("redemptions").select("*").order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }),
      supabase.from("staff").select("*"),
    ]);
    const roleList = (roles.data ?? []).map((r) => r.role);
    const role: Role = roleList.includes("admin") ? "admin" : roleList.includes("cajero") ? "cajero" : "cliente";
    const cs: Customer[] = (customers.data ?? []).map((c) => ({
      id: c.id, code: c.code, cedula: c.cedula, name: c.name, email: c.email, phone: c.phone, birthdate: c.birthdate,
      points: c.points, totalEarned: c.total_earned, totalUsed: c.total_used, stamps: c.stamps, visits: c.visits, joinedAt: c.joined_at, branchId: c.branch_id ?? "b1",
    }));
    set({
      ...base,
      role, userId: user.id, hydrated: true,
      currentCustomerId: (customers.data ?? []).find((c) => c.user_id === user.id)?.id ?? null,
      customers: cs,
      purchases: (purchases.data ?? []).map((p) => ({ id: p.id, customerId: p.customer_id, amount: Number(p.amount), orderNumber: p.order_number, branchId: p.branch_id ?? "b1", points: p.points, date: p.created_at, employeeId: p.employee_id ?? "" })),
      movements: (movements.data ?? []).map((m) => ({ id: m.id, customerId: m.customer_id, type: m.type as Movement["type"], points: m.points, description: m.description, date: m.created_at })),
      redemptions: (redemptions.data ?? []).map((r) => ({ id: r.id, customerId: r.customer_id, rewardId: r.reward_id, cost: r.cost, date: r.created_at, code: r.code })),
      notifications: (notifications.data ?? []).map((n) => ({ id: n.id, customerId: n.customer_id, type: n.type as Notification["type"], title: n.title, message: n.message, date: n.created_at, read: n.read })),
      employees: (staff.data ?? []).map((s) => ({ id: s.user_id, name: s.name, role: "Personal" as const, branchId: s.branch_id ?? "b1" })),
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ ...empty, role: null, userId: null, currentCustomerId: null, selectedCustomerId: null, hydrated: false });
  },
  selectCustomer: (selectedCustomerId) => set({ selectedCustomerId }),
  celebrate: (celebration) => set({ celebration }),
  clearCelebration: () => set({ celebration: null }),

  updateProfile: async (d) => {
    const { error } = await supabase.rpc("update_my_profile", { _name: d.name, _email: d.email, _birthdate: d.birthdate });
    if (error) return { ok: false, error: errMsg(error) };
    await get().load();
    return { ok: true };
  },

  registerPurchase: async ({ customerId, amount, orderNumber, branchId }) => {
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Ingresa un valor de compra mayor a 0." };
    const { data, error } = await supabase.rpc("register_purchase", { _customer_id: customerId, _amount: amount, _order: orderNumber, _branch: branchId });
    if (error) return { ok: false, error: errMsg(error) };
    const r = data as { points: number; stamps: number; goal: number; mode: string };
    await get().load();
    set({
      celebration: r.mode === "stamps"
        ? r.stamps >= r.goal ? { kind: "reward", title: "¡LO LOGRASTE!", message: "TU PREMIO MONCHIS TE ESPERA: hamburguesa gratis." } : { kind: "stamp", title: "¡GENIAL!", message: `Ganaste 1 sello. Llevas ${r.stamps} de ${r.goal}.` }
        : { kind: "points", title: "¡GENIAL!", message: `ACABAS DE GANAR ${r.points} PUNTOS` },
    });
    return { ok: true, points: r.points };
  },

  redeem: async (customerId, rewardId) => {
    const { data, error } = await supabase.rpc("redeem_reward", { _customer_id: customerId, _reward_id: rewardId });
    if (error) return { ok: false, error: errMsg(error) };
    const r = data as { code: string; name: string };
    await get().load();
    set({ celebration: { kind: "reward", title: "¡LO LOGRASTE!", message: `TU PREMIO MONCHIS TE ESPERA · ${r.name} · Código ${r.code}` } });
    return { ok: true, code: r.code };
  },

  sendNotification: async ({ customerIds, type, title, message }) => {
    const { data, error } = await supabase.rpc("send_notifications", { _customer_ids: customerIds, _type: type, _title: title, _message: message });
    if (error) return { ok: false, error: errMsg(error) };
    await get().load();
    return { ok: true, count: data as number };
  },

  markRead: async () => {
    await supabase.rpc("mark_my_notifications_read");
    await get().load();
  },

  updateSettings: async (s) => {
    const { error } = await supabase.from("settings").update({ mode: s.mode, points_per_usd: s.pointsPerUsd, stamps_goal: s.stampsGoal, welcome_points: s.welcomePoints }).eq("id", 1);
    if (error) return { ok: false, error: errMsg(error) };
    await get().load();
    return { ok: true };
  },

  saveReward: async (r) => {
    if (!r.name.trim()) return { ok: false, error: "Ingresa el nombre del premio." };
    if (!Number.isInteger(r.cost) || r.cost <= 0) return { ok: false, error: "El costo debe ser mayor a 0." };
    const row = { name: r.name.trim(), description: r.description.trim(), cost: r.cost, emoji: r.emoji || "🎁", active: r.active };
    const { error } = r.id ? await supabase.from("rewards").update(row).eq("id", r.id) : await supabase.from("rewards").insert(row);
    if (error) return { ok: false, error: errMsg(error) };
    await get().load();
    return { ok: true };
  },
}));

export function tierOf(totalEarned: number) {
  if (totalEarned >= 900) return { name: "Dino Legend", next: null as number | null };
  if (totalEarned >= 500) return { name: "Oro", next: 900 };
  if (totalEarned >= 200) return { name: "Plata", next: 500 };
  return { name: "Bronce", next: 200 };
}
