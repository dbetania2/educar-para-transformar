import type { User } from "@supabase/supabase-js";

import type { AdminSupabaseClient } from "@/lib/supabase/academicAdmin";

const AUTH_USERS_PAGE_SIZE = 1000;

export async function listAllAuthUsers(supabase: AdminSupabaseClient) {
  const users: User[] = [];

  try {
    for (let page = 1; page < 100; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: AUTH_USERS_PAGE_SIZE,
      });

      if (error) {
        throw new Error(error.message ?? "No se pudieron listar los usuarios.");
      }

      users.push(...(data.users ?? []));

      if ((data.users ?? []).length < AUTH_USERS_PAGE_SIZE) {
        break;
      }
    }

    return users;
  } catch (error) {
    // Si la API GoTrue de Supabase falla en lote (ej. "Database error finding users"),
    // intentamos una paginación unitaria tolerante a fallos para rescatar los usuarios válidos.
    console.warn("Fallo listUsers en lote, aplicando recuperación unitaria tolerante:", error);

    const safeUsers: User[] = [];
    let consecutiveErrors = 0;

    for (let page = 1; page <= 500; page += 1) {
      const { data, error: singleError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1,
      });

      if (singleError) {
        consecutiveErrors += 1;
        // Si hay más de 5 errores consecutivos al paginar individualmente, asumimos que terminó el listado
        if (consecutiveErrors >= 5) {
          break;
        }
        continue;
      }

      consecutiveErrors = 0;
      const user = data?.users?.[0];
      if (!user) {
        break;
      }

      safeUsers.push(user);
    }

    if (safeUsers.length > 0) {
      return safeUsers;
    }

    throw error;
  }
}
