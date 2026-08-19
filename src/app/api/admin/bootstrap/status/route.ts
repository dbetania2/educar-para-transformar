import { NextResponse } from "next/server";

import { getAdminBootstrapStatus } from "@/lib/auth/adminBootstrap";
import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

export async function GET() {
  const bootstrap = getAdminBootstrapStatus();

  if (!supabaseSecretKey) {
    return NextResponse.json({
      requiresBootstrap: true,
      bootstrap,
    });
  }

  const supabase = createAdminClient();
  let users;

  try {
    users = await listAllAuthUsers(supabase);
  } catch {
    return NextResponse.json(
      { error: "No se pudo validar el estado administrativo." },
      { status: 500 },
    );
  }

  const requiresBootstrap = !users.some(
    (user) => getRoleFromUser(user) === "administrativo",
  );

  return NextResponse.json({
    requiresBootstrap,
    bootstrap,
  });
}
