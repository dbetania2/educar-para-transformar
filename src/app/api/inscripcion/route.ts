import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

type InscripcionPayload = {
  studentFullName: string;
  studentDni: string;
  level: string;
  responsibleType: "tutor" | "parents";
  tutorFullName: string;
  tutorDni: string;
  fatherFullName: string;
  fatherDni: string;
  motherFullName: string;
  motherDni: string;
  contactPhone: string;
  email: string;
};

function hasMinLength(value: unknown, min: number) {
  return typeof value === "string" && value.trim().length >= min;
}

function isValidPayload(payload: unknown): payload is InscripcionPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const responsibleType = candidate.responsibleType;

  if (
    !hasMinLength(candidate.studentFullName, 3) ||
    !(typeof candidate.studentDni === "string" && /^\d{8}$/.test(candidate.studentDni.trim())) ||
    !hasMinLength(candidate.level, 3) ||
    !(typeof candidate.contactPhone === "string" && /^\d{8,15}$/.test(candidate.contactPhone.trim())) ||
    !(typeof candidate.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email))
  ) {
    return false;
  }

  if (responsibleType !== "tutor" && responsibleType !== "parents") {
    return false;
  }

  if (responsibleType === "tutor") {
    return (
      hasMinLength(candidate.tutorFullName, 3) &&
      (typeof candidate.tutorDni === "string" && /^\d{8}$/.test(candidate.tutorDni.trim()))
    );
  }

  return (
    hasMinLength(candidate.fatherFullName, 3) &&
    (typeof candidate.fatherDni === "string" && /^\d{8}$/.test(candidate.fatherDni.trim())) &&
    hasMinLength(candidate.motherFullName, 3) &&
    (typeof candidate.motherDni === "string" && /^\d{8}$/.test(candidate.motherDni.trim()))
  );
}

function buildInsertPayload(body: InscripcionPayload, email: string) {
  return {
    student_full_name: body.studentFullName.trim(),
    student_dni: body.studentDni.trim(),
    level: body.level.trim(),
    responsible_type: body.responsibleType,
    tutor_full_name:
      body.responsibleType === "tutor" ? body.tutorFullName.trim() : null,
    tutor_dni: body.responsibleType === "tutor" ? body.tutorDni.trim() : null,
    father_full_name:
      body.responsibleType === "parents" ? body.fatherFullName.trim() : null,
    father_dni:
      body.responsibleType === "parents" ? body.fatherDni.trim() : null,
    mother_full_name:
      body.responsibleType === "parents" ? body.motherFullName.trim() : null,
    mother_dni:
      body.responsibleType === "parents" ? body.motherDni.trim() : null,
    contact_phone: body.contactPhone.trim(),
    email,
  };
}

function hasWorkflowColumnsError(error: { code?: string; message?: string } | null) {
  const normalizedMessage = error?.message?.toLowerCase() ?? "";

  return (
    error?.code === "42703" ||
    normalizedMessage.includes("status does not exist") ||
    normalizedMessage.includes("internal_notes does not exist") ||
    normalizedMessage.includes("reviewed_at does not exist") ||
    normalizedMessage.includes("reviewed_by does not exist")
  );
}

function getInsertFailureResponse(error: { code?: string; message?: string }) {
  const normalizedMessage = error.message?.toLowerCase() ?? "";

  if (
    error.code === "42P01" ||
    normalizedMessage.includes("relation") ||
    normalizedMessage.includes("does not exist")
  ) {
    return {
      status: 500,
      error: "La inscripción no está disponible en este momento.",
    };
  }

  if (error.code === "23505") {
    return {
      status: 409,
      error: "Ya existe una solicitud registrada con ese correo o DNI.",
    };
  }

  if (error.code === "42501") {
    return {
      status: 500,
      error: "La inscripción no está disponible en este momento.",
    };
  }

  return {
    status: 500,
    error: "No se pudo guardar la solicitud de inscripción.",
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload de inscripción inválido." },
      { status: 400 },
    );
  }

  if (!supabaseSecretKey) {
    return NextResponse.json(
      { error: "La inscripción no está disponible en este momento." },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const email = body.email.trim().toLowerCase();
  const basePayload = buildInsertPayload(body, email);

  const insertWithWorkflow = await supabase.from("inscription_requests").insert({
    ...basePayload,
    status: "pendiente",
    internal_notes: null,
    reviewed_at: null,
    reviewed_by: null,
  });

  if (hasWorkflowColumnsError(insertWithWorkflow.error)) {
    const fallbackInsert = await supabase
      .from("inscription_requests")
      .insert(basePayload);

    if (fallbackInsert.error) {
      const failureResponse = getInsertFailureResponse(fallbackInsert.error);
      return NextResponse.json(
        { error: failureResponse.error },
        { status: failureResponse.status },
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (insertWithWorkflow.error) {
    const failureResponse = getInsertFailureResponse(insertWithWorkflow.error);
    return NextResponse.json(
      { error: failureResponse.error },
      { status: failureResponse.status },
    );
  }

  return NextResponse.json({ ok: true });
}
