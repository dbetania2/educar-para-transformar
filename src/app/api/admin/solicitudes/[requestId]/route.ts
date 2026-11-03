import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import { validateStudentSports } from "@/lib/extracurricular";
import { getProfileByAuthUserId, insertAuditLog } from "@/lib/supabase/academicAdmin";
import {
  cleanupPendingInvitedUser,
  ensureApprovedUser,
  hasWorkflowColumnsError,
  isValidDeletePayload,
  isValidPayload,
  rollbackManagedUser,
  syncApprovedStudentData,
  type ExistingRequest,
  type ManagedAuthUser,
} from "./requestApprovalHelpers";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const access = await getAdminClientWithGuard();
  if ("error" in access) return access.error;

  const body = await request.json().catch(() => null);
  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload inválido para actualizar la solicitud." },
      { status: 400 },
    );
  }

  const { requestId } = await context.params;
  const requestIdAsNumber = Number(requestId);

  if (!Number.isFinite(requestIdAsNumber)) {
    return NextResponse.json(
      { error: "El identificador de solicitud es inválido." },
      { status: 400 },
    );
  }

  const sportsList = Array.isArray(body.sports)
    ? body.sports.filter((s): s is string => typeof s === "string")
    : [];

  if (body.status === "aprobada" && sportsList.length > 0) {
    const sportsError = validateStudentSports(sportsList);
    if (sportsError) {
      return NextResponse.json({ error: sportsError }, { status: 400 });
    }
  }

  const transportRoute =
    typeof body.transportRoute === "string" && body.transportRoute.trim().length > 0
      ? body.transportRoute.trim()
      : "No Registrado";
  const diningService =
    typeof body.diningService === "string" && body.diningService.trim().length > 0
      ? body.diningService.trim()
      : "No Registrado";
  const courseIds = Array.isArray(body.courseIds)
    ? body.courseIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    : [];

  const { data: existingRequest, error: existingRequestError } = await access.supabase
    .from("inscription_requests")
    .select(
      "id, auth_user_id, student_full_name, student_dni, email, contact_phone, responsible_type, tutor_full_name, tutor_dni, father_full_name, father_dni, mother_full_name, mother_dni, status, reviewed_at",
    )
    .eq("id", requestIdAsNumber)
    .single();

  if (hasWorkflowColumnsError(existingRequestError)) {
    return NextResponse.json(
      {
        error:
          "La tabla inscription_requests todavía no tiene columnas de seguimiento. Aplicá la migración correspondiente en Supabase para poder guardar estado, notas y auditoría.",
        code: "ADMIN_REQUESTS_MIGRATION_REQUIRED",
      },
      { status: 409 },
    );
  }

  if (existingRequestError || !existingRequest) {
    return NextResponse.json(
      { error: existingRequestError?.message ?? "No se encontró la solicitud." },
      { status: 404 },
    );
  }

  const reviewTimestamp = new Date().toISOString();
  const reviewedBy = access.user.email ?? access.user.id;
  const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);
  const nextRequestPayload: Record<string, string | null> = {
    status: body.status,
    internal_notes: body.internalNotes?.trim() || null,
    reviewed_at: reviewTimestamp,
    reviewed_by: reviewedBy,
  };

  let managedUser: ManagedAuthUser | null = null;

  if (body.status === "aprobada") {
    const approvalResult = await ensureApprovedUser({
      supabase: access.supabase,
      authUserId: existingRequest.auth_user_id,
      studentFullName: existingRequest.student_full_name,
      studentDni: existingRequest.student_dni.trim(),
      contactEmail: existingRequest.email,
      sports: sportsList,
      transportRoute,
      diningService,
      reviewedBy,
      reviewTimestamp,
      requestId: existingRequest.id,
    });

    if ("error" in approvalResult) {
      return approvalResult.error;
    }

    managedUser = approvalResult.managedUser;

    try {
      const studentProfile = await syncApprovedStudentData({
        supabase: access.supabase,
        request: existingRequest as ExistingRequest,
        authUserId: managedUser.userId,
        legajo: managedUser.legajo,
        actorProfileId: actorProfile?.id ?? null,
        courseIds,
      });

      nextRequestPayload.auth_user_id = managedUser.userId;
      nextRequestPayload.resolved_auth_user_id = managedUser.userId;
      nextRequestPayload.student_profile_id = studentProfile.id;
      nextRequestPayload.resolved_by_profile_id = actorProfile?.id ?? null;
    } catch (syncError) {
      await rollbackManagedUser({ supabase: access.supabase, managedUser });

      return NextResponse.json(
        {
          error:
            syncError instanceof Error
              ? syncError.message
              : "No se pudo sincronizar la ficha relacional del alumno aprobado.",
        },
        { status: 500 },
      );
    }
  }

  const { data, error } = await access.supabase
    .from("inscription_requests")
    .update(nextRequestPayload)
    .eq("id", requestIdAsNumber)
    .select(
      "id, auth_user_id, resolved_auth_user_id, student_profile_id, status, internal_notes, reviewed_at, reviewed_by",
    )
    .single();

  if (hasWorkflowColumnsError(error)) {
    if (managedUser) {
      await rollbackManagedUser({ supabase: access.supabase, managedUser });
    }

    return NextResponse.json(
      {
        error:
          "La tabla inscription_requests todavía no tiene columnas de seguimiento. Aplicá la migración correspondiente en Supabase para poder guardar estado, notas y auditoría.",
        code: "ADMIN_REQUESTS_MIGRATION_REQUIRED",
      },
      { status: 409 },
    );
  }

  if (error || !data) {
    if (managedUser) {
      await rollbackManagedUser({ supabase: access.supabase, managedUser });
    }

    return NextResponse.json(
      { error: error?.message ?? "No se pudo actualizar la solicitud." },
      { status: 500 },
    );
  }

  if (body.status !== "aprobada") {
    await cleanupPendingInvitedUser({
      supabase: access.supabase,
      authUserId: existingRequest.auth_user_id,
      previousStatus: existingRequest.status,
      nextStatus: body.status,
    });
  }

  await insertAuditLog({
    supabase: access.supabase,
    actorProfileId: actorProfile?.id ?? null,
    entityName: "inscription_request",
    entityId: String(existingRequest.id),
    action: "status_changed",
    oldData: { status: existingRequest.status },
    newData: {
      status: body.status,
      internal_notes: body.internalNotes?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, request: data });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const access = await getAdminClientWithGuard();
  if ("error" in access) return access.error;

  const body = await request.json().catch(() => null);
  if (!isValidDeletePayload(body)) {
    return NextResponse.json(
      { error: "Ingresá una justificación de al menos 3 caracteres para eliminar la solicitud." },
      { status: 400 },
    );
  }

  const { requestId } = await context.params;
  const requestIdAsNumber = Number(requestId);

  if (!Number.isFinite(requestIdAsNumber)) {
    return NextResponse.json(
      { error: "El identificador de solicitud es inválido." },
      { status: 400 },
    );
  }

  const { data: existingRequest, error: existingRequestError } = await access.supabase
    .from("inscription_requests")
    .select("*")
    .eq("id", requestIdAsNumber)
    .single();

  if (existingRequestError || !existingRequest) {
    return NextResponse.json(
      { error: existingRequestError?.message ?? "No se encontró la solicitud." },
      { status: 404 },
    );
  }

  const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);
  const reason = body.reason.trim();

  await insertAuditLog({
    supabase: access.supabase,
    actorProfileId: actorProfile?.id ?? null,
    entityName: "inscription_request",
    entityId: String(existingRequest.id),
    action: "request_deleted",
    oldData: existingRequest,
    newData: { reason },
  });

  const { error: deleteError } = await access.supabase
    .from("inscription_requests")
    .delete()
    .eq("id", requestIdAsNumber);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message ?? "No se pudo eliminar la solicitud." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
