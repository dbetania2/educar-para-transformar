import { NextResponse } from "next/server";

import {
  adminBootstrapSecret,
  getAdminBootstrapStatus,
} from "@/lib/auth/adminBootstrap";
import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleFromUser } from "@/lib/auth/roles";
import { supabaseSecretKey } from "@/lib/supabase/env";

type BootstrapPayload = {
  fullName: string;
  email: string;
  password: string;
  bootstrapSecret?: string;
};

function isValidPayload(payload: unknown): payload is BootstrapPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.fullName === "string" &&
    candidate.fullName.trim().length >= 3 &&
    typeof candidate.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    typeof candidate.password === "string" &&
    candidate.password.trim().length >= 6 &&
    (typeof candidate.bootstrapSecret === "undefined" ||
      typeof candidate.bootstrapSecret === "string")
  );
}

export async function POST(request: Request) {
  if (!supabaseSecretKey) {
    return NextResponse.json(
      { error: "Falta configurar SUPABASE_SECRET_KEY para crear el primer administrador." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload inválido para bootstrap administrativo." },
      { status: 400 },
    );
  }

  const bootstrapStatus = getAdminBootstrapStatus();

  if (!bootstrapStatus.enabled) {
    return NextResponse.json(
      {
        error: bootstrapStatus.lockedReason,
        code: "ADMIN_BOOTSTRAP_LOCKED",
        bootstrap: bootstrapStatus,
      },
      { status: 503 },
    );
  }

  if (
    bootstrapStatus.requiresSecret &&
    body.bootstrapSecret?.trim() !== adminBootstrapSecret
  ) {
    return NextResponse.json(
      {
        error: "La clave de bootstrap administrativo es inválida.",
        code: "ADMIN_BOOTSTRAP_INVALID_SECRET",
      },
      { status: 403 },
    );
  }

  const supabase = createAdminClient();
  let users;

  try {
    users = await listAllAuthUsers(supabase);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo validar el estado actual de usuarios." },
      { status: 500 },
    );
  }

  const hasAdministrativeUser = users.some(
    (user) => getRoleFromUser(user) === "administrativo",
  );

  if (hasAdministrativeUser) {
    return NextResponse.json(
      { error: "Ya existe un usuario administrativo. Usá el login normal." },
      { status: 409 },
    );
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: body.email.trim().toLowerCase(),
    password: body.password,
    email_confirm: true,
    app_metadata: {
      role: "administrativo",
    },
    user_metadata: {
      role: "administrativo",
      full_name: body.fullName.trim(),
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo crear el primer administrador." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? body.email.trim().toLowerCase(),
      fullName: body.fullName.trim(),
      role: "administrativo",
    },
  });
}
