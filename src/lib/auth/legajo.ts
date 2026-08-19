import type { User } from "@supabase/supabase-js";

import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { type AppUserRole, normalizeRole } from "@/lib/auth/roles";
import type { AdminSupabaseClient } from "@/lib/supabase/academicAdmin";

const LEGAJO_ROLES: AppUserRole[] = ["alumno", "tutor", "docente", "no_docente"];

function randomSixDigits() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, "0");
}

export function roleUsesLegajo(role: AppUserRole | "desconocido") {
  return LEGAJO_ROLES.includes(role as AppUserRole);
}

export function getLegajoPrefix(role: AppUserRole) {
  if (role === "alumno") {
    return "A";
  }

  if (role === "docente") {
    return "D";
  }

  if (role === "no_docente") {
    return "N";
  }

  if (role === "tutor") {
    return "T";
  }

  return "M";
}

export function getLegajoFromUser(user: Pick<User, "app_metadata" | "user_metadata"> | { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
  const appLegajo = user.app_metadata?.legajo;

  if (typeof appLegajo === "string" && appLegajo.trim().length > 0) {
    return appLegajo.trim().toUpperCase();
  }

  const userLegajo = user.user_metadata?.legajo;

  if (typeof userLegajo === "string" && userLegajo.trim().length > 0) {
    return userLegajo.trim().toUpperCase();
  }

  return null;
}

export async function generateUniqueLegajo(
  supabase: AdminSupabaseClient,
  role: AppUserRole,
) {
  const users = await listAllAuthUsers(supabase);

  const existingLegajos = new Set(
    users
      .map((user) => getLegajoFromUser(user))
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  );

  const prefix = getLegajoPrefix(role);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = `${prefix}${randomSixDigits()}`;

    if (!existingLegajos.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("No se pudo generar un legajo único.");
}

export function getRoleFromLegajoCarrier(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  return normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);
}

export async function findAuthUserByLegajo(
  supabase: AdminSupabaseClient,
  legajo: string,
) {
  const normalizedLegajo = legajo.trim().toUpperCase();
  const users = await listAllAuthUsers(supabase);

  return users.find((user) => getLegajoFromUser(user) === normalizedLegajo) ?? null;
}
