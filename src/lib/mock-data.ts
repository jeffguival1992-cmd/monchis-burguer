export type Customer = {
  id: string; code: string; name: string; email: string; phone: string; birthdate: string;
  points: number; totalEarned: number; totalUsed: number; stamps: number; visits: number; joinedAt: string; branchId: string;
};
export type Employee = { id: string; name: string; role: "Administrador" | "Cajero"; branchId: string };
export type Branch = { id: string; name: string; address: string };
export type Purchase = { id: string; customerId: string; amount: number; orderNumber: string; branchId: string; points: number; date: string; employeeId: string };
export type Reward = { id: string; name: string; description: string; cost: number; emoji: string; active: boolean };
export type Movement = { id: string; customerId: string; type: "earn" | "redeem" | "bonus" | "stamp"; points: number; description: string; date: string };
export type Redemption = { id: string; customerId: string; rewardId: string; cost: number; date: string; code: string };
export type Notification = { id: string; customerId: string; type: "promo" | "offer" | "birthday" | "reward"; title: string; message: string; date: string; read: boolean };
export type Settings = { mode: "points" | "stamps"; pointsPerUsd: number; stampsGoal: number; welcomePoints: number };
export type Seed = {
  customers: Customer[]; employees: Employee[]; branches: Branch[]; purchases: Purchase[]; rewards: Reward[];
  movements: Movement[]; redemptions: Redemption[]; notifications: Notification[]; settings: Settings;
};

const BASE = new Date("2026-11-08T18:00:00Z").getTime();
const daysAgo = (d: number, h = 0) => new Date(BASE - d * 864e5 - h * 36e5).toISOString();

const people: [string, number, number, number][] = [
  // name, points, earned, stamps
  ["María González", 250, 380, 5], ["Carlos Pérez", 120, 160, 3], ["Daniela López", 580, 720, 7],
  ["Andrés Torres", 75, 75, 1], ["Juan Martínez", 950, 1240, 6], ["Valentina Ríos", 310, 410, 4],
  ["Sebastián Mora", 45, 45, 2], ["Camila Vera", 205, 305, 3], ["Mateo Salazar", 640, 890, 6],
  ["Isabella Cedeño", 130, 130, 2], ["Diego Andrade", 88, 188, 1], ["Luciana Paredes", 420, 520, 5],
  ["Nicolás Jaramillo", 15, 15, 0], ["Sofía Castillo", 760, 960, 7], ["Emilio Zambrano", 190, 240, 4],
];

export function buildSeed(): Seed {
  const branches: Branch[] = [
    { id: "b1", name: "Monchis Centro", address: "Av. 9 de Octubre 412" },
    { id: "b2", name: "Monchis Samborondón", address: "Km 2.5 Vía Samborondón" },
  ];
  const employees: Employee[] = [
    { id: "e1", name: "Jeffo Guillén", role: "Administrador", branchId: "b1" },
    { id: "e2", name: "Ana Cajas", role: "Cajero", branchId: "b1" },
    { id: "e3", name: "Luis Mendoza", role: "Cajero", branchId: "b2" },
  ];
  const customers: Customer[] = people.map(([name, points, earned, stamps], i) => {
    const [f, l] = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" ");
    return {
      id: `c${i + 1}`, code: `MON-${1001 + i}`, name, email: `${f}.${l}@mail.com`, phone: `09${String(81234560 + i * 1371).slice(0, 8)}`,
      birthdate: `199${i % 10}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
      points, totalEarned: earned, totalUsed: earned - points, stamps, visits: Math.max(1, Math.round(earned / 18)),
      joinedAt: daysAgo(i < 4 ? i + 1 : 20 + i * 6), branchId: i % 2 ? "b2" : "b1",
    };
  });
  const rewards: Reward[] = [
    { id: "r1", name: "Hamburguesa gratis", description: "Nuestra Monchis clásica", cost: 150, emoji: "🍔", active: true },
    { id: "r2", name: "Papas gratis", description: "Papas crocantes medianas", cost: 60, emoji: "🍟", active: true },
    { id: "r3", name: "Bebida gratis", description: "Cualquier bebida 16 oz", cost: 40, emoji: "🥤", active: true },
    { id: "r4", name: "Combo Monchis", description: "Burger + papas + bebida", cost: 250, emoji: "🎁", active: true },
    { id: "r5", name: "Hamburguesa especial", description: "La Dino Doble con tocino", cost: 320, emoji: "🦖", active: true },
    { id: "r6", name: "Postre Monchis", description: "Brownie con helado", cost: 80, emoji: "🍨", active: true },
    { id: "r7", name: "Aros de cebolla", description: "Porción de onion rings", cost: 70, emoji: "🧅", active: true },
    { id: "r8", name: "Malteada XL", description: "Vainilla, chocolate o fresa", cost: 110, emoji: "🥛", active: false },
  ];
  const amounts = [15, 22.5, 9.75, 31, 12, 18.4, 27, 8.5, 44, 16];
  const buyers = [0, 1, 2, 4, 5, 8, 4, 3, 13, 11];
  const purchases: Purchase[] = amounts.map((a, i) => ({
    id: `p${i + 1}`, customerId: `c${buyers[i] + 1}`, amount: a, orderNumber: `ORD-${5200 + i}`, branchId: i % 2 ? "b2" : "b1",
    points: Math.floor(a), date: daysAgo(Math.floor(i / 2), i * 2), employeeId: i % 2 ? "e3" : "e2",
  }));
  const redemptionDefs: [number, string, number][] = [[4, "r4", 3], [2, "r1", 5], [8, "r5", 7], [13, "r2", 9], [0, "r3", 11]];
  const redemptions: Redemption[] = redemptionDefs.map(([c, r, d], i) => ({
    id: `x${i + 1}`, customerId: `c${c + 1}`, rewardId: r, cost: rewards.find((x) => x.id === r)!.cost, date: daysAgo(d), code: `PREMIO-${1000 + i}`,
  }));
  const movements: Movement[] = [
    ...purchases.map((p, i) => ({ id: `m${i + 1}`, customerId: p.customerId, type: "earn" as const, points: p.points, description: `Compra ${p.orderNumber} · USD ${p.amount.toFixed(2)}`, date: p.date })),
    ...redemptions.map((r, i) => ({ id: `m${11 + i}`, customerId: r.customerId, type: "redeem" as const, points: -r.cost, description: `Canje: ${rewards.find((x) => x.id === r.rewardId)!.name}`, date: r.date })),
    ...[0, 1, 2, 3, 12].map((c, i) => ({ id: `m${16 + i}`, customerId: `c${c + 1}`, type: "bonus" as const, points: i === 4 ? 15 : 20, description: i === 2 ? "Bono de cumpleaños" : "Bono de bienvenida", date: daysAgo(i + 1, 3) })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const notifications: Notification[] = [
    { id: "n1", customerId: "c1", type: "promo", title: "Martes de Monchis", message: "¡Hola María! Hoy tienes una promoción especial en MONCHIS BURGUERS. ¡Te esperamos!", date: daysAgo(0, 4), read: false },
    { id: "n2", customerId: "c1", type: "reward", title: "Recompensa disponible", message: "Ya puedes canjear una Hamburguesa gratis con tus puntos.", date: daysAgo(2), read: true },
    { id: "n3", customerId: "c3", type: "birthday", title: "¡Feliz cumpleaños!", message: "Daniela, tu combo de cumpleaños te espera esta semana.", date: daysAgo(1), read: false },
  ];
  return { customers, employees, branches, purchases, rewards, movements, redemptions, notifications, settings: { mode: "points", pointsPerUsd: 1, stampsGoal: 8, welcomePoints: 20 } };
}
