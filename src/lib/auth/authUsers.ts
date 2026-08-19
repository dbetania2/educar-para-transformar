import type { User } from "@supabase/supabase-js";

import type { AdminSupabaseClient } from "@/lib/supabase/academicAdmin";

const AUTH_USERS_PAGE_SIZE = 1000;

export async function listAllAuthUsers(supabase: AdminSupabaseClient) {
  const users: User[] = [];

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
}
