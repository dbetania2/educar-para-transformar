import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

type ContactPayload = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function isValidPayload(payload: unknown): payload is ContactPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.fullName === "string" &&
    candidate.fullName.trim().length >= 3 &&
    typeof candidate.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    typeof candidate.phone === "string" &&
    /^\d{8,15}$/.test(candidate.phone.trim()) &&
    typeof candidate.subject === "string" &&
    candidate.subject.trim().length >= 4 &&
    typeof candidate.message === "string" &&
    candidate.message.trim().length >= 10
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload de contacto inválido." },
      { status: 400 },
    );
  }

  if (!supabaseSecretKey) {
    return NextResponse.json(
      { error: "El formulario de contacto no está disponible en este momento." },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: body.fullName.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
    subject: body.subject.trim(),
    message: body.message.trim(),
  });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo guardar el mensaje de contacto." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
