import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { supabaseSecretKey } from "@/lib/supabase/env";

type AdminAccessError = {
  error: NextResponse;
};

type AdminAccessSuccess = {
  user: User;
  supabase: ReturnType<typeof createAdminClient>;
};

type AdminAccessResult = AdminAccessError | AdminAccessSuccess;

export async function ensureAdministrativeAccess(): Promise<AdminAccessError | { user: User }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      error: NextResponse.json(
        { error: "Debés iniciar sesión para acceder a esta sección." },
        { status: 401 },
      ),
    };
  }

  const role = getRoleFromUser(data.user);

  if (role !== "administrativo") {
    return {
      error: NextResponse.json(
        { error: "Solo un usuario administrativo puede gestionar esta sección." },
        { status: 403 },
      ),
    };
  }

  return { user: data.user };
}

export async function getAdminClientWithGuard(): Promise<AdminAccessResult> {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access;
  }

  if (!supabaseSecretKey) {
    return {
      error: NextResponse.json(
        { error: "Falta configurar SUPABASE_SECRET_KEY para la gestión administrativa." },
        { status: 500 },
      ),
    };
  }

  return {
    user: access.user,
    supabase: createAdminClient(),
  };
}
