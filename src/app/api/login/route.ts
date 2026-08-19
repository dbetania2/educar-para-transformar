import { NextResponse } from "next/server";

import { getLegajoFromUser, findAuthUserByLegajo } from "@/lib/auth/legajo";
import { getProtectedHomePathForUser, getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type EmailLoginPayload = {
  email: string;
  password: string;
};

type LegajoLoginPayload = {
  legajo: string;
  dni: string;
};

function isLoginEmailIdentifier(value: string) {
  const trimmed = value.trim();
  const parts = trimmed.split("@");
  const domain = parts[1] ?? "";

  return parts.length === 2 && parts.every(Boolean) && domain.includes(".") && !/\s/.test(trimmed);
}

function isEmailLoginPayload(payload: unknown): payload is EmailLoginPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.email === "string" &&
    isLoginEmailIdentifier(candidate.email) &&
    typeof candidate.password === "string" &&
    candidate.password.trim().length >= 6
  );
}

function isLegajoLoginPayload(payload: unknown): payload is LegajoLoginPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.legajo === "string" &&
    /^[A-Za-z]\d{6}$/.test(candidate.legajo.trim()) &&
    (typeof candidate.dni === "string" && /^\d{8}$/.test(candidate.dni.trim()))
  );
}

async function resolveEmailForLogin(body: EmailLoginPayload | LegajoLoginPayload) {
  if (isEmailLoginPayload(body)) {
    return {
      email: body.email.trim().toLowerCase(),
      password: body.password,
      legajo: null as string | null,
    };
  }

  if (!supabaseSecretKey) {
    throw new Error("Falta configurar SUPABASE_SECRET_KEY para el login por legajo.");
  }

  const adminSupabase = createAdminClient();
  const user = await findAuthUserByLegajo(adminSupabase, body.legajo);

  if (!user?.email) {
    return null;
  }

  return {
    email: user.email.trim().toLowerCase(),
    password: body.dni.trim(),
    legajo: getLegajoFromUser(user),
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isEmailLoginPayload(body) && !isLegajoLoginPayload(body)) {
    return NextResponse.json(
      { error: "Payload de login inválido." },
      { status: 400 },
    );
  }

  let credentials: Awaited<ReturnType<typeof resolveEmailForLogin>>;

  try {
    credentials = await resolveEmailForLogin(body);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo preparar el login." },
      { status: 500 },
    );
  }

  if (!credentials) {
    return NextResponse.json(
      { error: "No existe un usuario asociado a ese legajo." },
      { status: 401 },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo iniciar sesión." },
      { status: 401 },
    );
  }

  const role = getRoleFromUser(data.user);
  const redirectTo = getProtectedHomePathForUser(data.user);

  return NextResponse.json({
    ok: true,
    role,
    redirectTo,
    legajo: credentials.legajo,
    user: {
      id: data.user.id,
      email: data.user.email ?? credentials.email,
    },
  });
}
