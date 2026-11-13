export type Customer = {
  id: string; code: string; cedula: string; name: string; email: string; phone: string; birthdate: string;
  points: number; totalEarned: number; totalUsed: number; stamps: number; visits: number; joinedAt: string; branchId: string;
};
export type Employee = { id: string; name: string; role: "Administrador" | "Cajero" | "Personal"; branchId: string };
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
