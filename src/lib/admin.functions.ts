import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Admin-only: set a new password for a client who forgot theirs (clients have no email to reset it).
export const resetCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { customerId: string; password: string }) => {
    if (typeof d?.customerId !== "string" || typeof d?.password !== "string") throw new Error("Datos no válidos.");
    if (d.password.length < 8 || d.password.length > 72) throw new Error("La clave debe tener entre 8 y 72 caracteres.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("No autorizado.");
    const { data: c } = await context.supabase.from("customers").select("user_id").eq("id", data.customerId).maybeSingle();
    if (!c?.user_id) throw new Error("Cliente no encontrado.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(c.user_id, { password: data.password });
    if (error) throw new Error("No se pudo cambiar la clave. Usa una clave menos común.");
    return { ok: true };
  });
