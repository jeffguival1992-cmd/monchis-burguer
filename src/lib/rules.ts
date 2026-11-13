// Business rules shared by the UI. The database enforces the same rules.
export const CEDULA_DOMAIN = "socios.monchis.app";
export const cedulaEmail = (cedula: string) => `${cedula.replace(/\D/g, "")}@${CEDULA_DOMAIN}`;
export const pointsFor = (amountUsd: number, pointsPerUsd = 1) => Math.max(0, Math.floor(amountUsd * pointsPerUsd));

export function validateSignup(d: { cedula: string; phone: string; password: string }): string | null {
  if (!/^\d{10}$/.test(d.cedula)) return "La cédula debe tener 10 dígitos.";
  if (!/^09\d{8}$/.test(d.phone)) return "Ingresa un celular válido (09xxxxxxxx).";
  if (d.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  return null;
}

export function authErrorEs(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) return "Ya existe una cuenta con esa cédula. Inicia sesión.";
  if (m.includes("invalid login")) return "Datos incorrectos. Revisa e intenta de nuevo.";
  if (m.includes("pwned") || m.includes("weak") || m.includes("known")) return "Esa contraseña es muy común. Elige otra más segura.";
  if (m.includes("password")) return "La contraseña no es válida (mínimo 8 caracteres).";
  return "No pudimos completar la acción. Intenta de nuevo.";
}
