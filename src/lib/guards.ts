import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "cajero";

async function rolesOf(userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}

/** Staff area: signed in AND has a staff role. */
export async function requireStaff(): Promise<{ staffRole: StaffRole }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect({ to: "/personal" });
  const roles = await rolesOf(user.id);
  if (roles.includes("admin")) return { staffRole: "admin" };
  if (roles.includes("cajero")) return { staffRole: "cajero" };
  throw redirect({ to: "/cliente" });
}

/** Client area: signed in as a club member (staff go to their panel). */
export async function requireClient() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect({ to: "/ingresar" });
  const roles = await rolesOf(user.id);
  if (roles.length) throw redirect({ to: "/admin" });
}

export function adminOnly({ context }: { context: { staffRole?: StaffRole } }) {
  if (context.staffRole !== "admin") throw redirect({ to: "/admin/escanear" });
}
