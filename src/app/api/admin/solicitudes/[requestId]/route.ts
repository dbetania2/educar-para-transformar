import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import { getLegajoFromUser, generateUniqueLegajo } from "@/lib/auth/legajo";
import {
  buildInternalStudentEmail,
  buildTutorLegajo,
  ensureGuardianLink,
  ensureProfileRole,
  ensureStudentRecord,
  ensureTutorAuthAccount,
  getProfileByAuthUserId,
  insertAuditLog,
  type AdminSupabaseClient,
  upsertProfile,
} from "@/lib/supabase/academicAdmin";

const VALID_STATUSES = ["pendiente", "en_revision", "aprobada", "rechazada"] as const;

type RequestStatus = (typeof VALID_STATUSES)[number];

type UpdateRequestPayload = {
  status: RequestStatus;
  internalNotes?: string;
};

type DeleteRequestPayload = {
  reason: string;
};

type ManagedAuthUser = {
  userId: string;
  legajo: string;
  previousAppMetadata: Record<string, unknown> | null;
  previousUserMetadata: Record<string, unknown> | null;
  createdDuringRequest: boolean;
};

type ExistingRequest = {
  id: number;
  auth_user_id: string | null;
  student_full_name: string;
  student_dni: string;
  email: string;
  contact_phone: string;
  responsible_type: "tutor" | "parents";
  tutor_full_name: string | null;
  tutor_dni: string | null;
  father_full_name: string | null;
  father_dni: string | null;
  mother_full_name: string | null;
  mother_dni: string | null;
  status: RequestStatus;
  reviewed_at: string | null;
};

function isValidDeletePayload(payload: unknown): payload is DeleteRequestPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return typeof candidate.reason === "string" && candidate.reason.trim().length >= 3;
}

function isValidPayload(payload: unknown): payload is UpdateRequestPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.status === "string" &&
    VALID_STATUSES.includes(candidate.status as RequestStatus) &&
    (typeof candidate.internalNotes === "undefined" || typeof candidate.internalNotes === "string")
  );
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

async function findUserByEmail(supabase: AdminSupabaseClient, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return { error };
  }

  const user = (data.users ?? []).find(
    (candidate) => candidate.email?.trim().toLowerCase() === email,
  );

  return { user };
}

async function ensureApprovedUser(params: {
  supabase: AdminSupabaseClient;
  authUserId: string | null;
  studentFullName: string;
  studentDni: string;
  reviewedBy: string;
  reviewTimestamp: string;
  requestId: number;
}): Promise<{ managedUser: ManagedAuthUser } | { error: NextResponse }> {
  const {
    supabase,
    authUserId,
    studentFullName,
    studentDni,
    reviewedBy,
    reviewTimestamp,
    requestId,
  } = params;

  let resolvedUserId = authUserId;
  let previousAppMetadata: Record<string, unknown> | null = null;
  let previousUserMetadata: Record<string, unknown> | null = null;
  let createdDuringRequest = false;
  let legajo: string | null = null;

  if (resolvedUserId) {
    const { data, error } = await supabase.auth.admin.getUserById(resolvedUserId);

    if (!error && data.user) {
      previousAppMetadata = data.user.app_metadata ?? {};
      previousUserMetadata = data.user.user_metadata ?? {};
      legajo = getLegajoFromUser(data.user);
    } else {
      resolvedUserId = null;
    }
  }

  if (!legajo) {
    legajo = await generateUniqueLegajo(supabase, "alumno");
  }

  const studentAuthEmail = buildInternalStudentEmail(legajo);

  if (!resolvedUserId) {
    const createUserResult = await supabase.auth.admin.createUser({
      email: studentAuthEmail,
      password: studentDni,
      email_confirm: true,
      app_metadata: {
        role: "alumno",
        request_approved_by: reviewedBy,
        request_approved_at: reviewTimestamp,
        approved_request_id: requestId,
        legajo,
      },
      user_metadata: {
        role: "alumno",
        full_name: studentFullName,
        legajo,
      },
    });

    if (createUserResult.error || !createUserResult.data.user) {
      const normalizedMessage = createUserResult.error?.message?.toLowerCase() ?? "";
      const isConflict =
        createUserResult.error?.status === 409 ||
        createUserResult.error?.status === 422 ||
        normalizedMessage.includes("already") ||
        normalizedMessage.includes("registered");

      if (!isConflict) {
        return {
          error: NextResponse.json(
            { error: "No se pudo crear la cuenta del alumno aprobada." },
            { status: 500 },
          ),
        };
      }

      const existingUserResult = await findUserByEmail(supabase, studentAuthEmail);

      if (existingUserResult.error || !existingUserResult.user) {
        return {
          error: NextResponse.json(
            { error: "Ya existe una cuenta con ese correo y no se pudo vincular automáticamente." },
            { status: 409 },
          ),
        };
      }

      resolvedUserId = existingUserResult.user.id;
      previousAppMetadata = existingUserResult.user.app_metadata ?? {};
      previousUserMetadata = existingUserResult.user.user_metadata ?? {};
      legajo = getLegajoFromUser(existingUserResult.user);
    } else {
      resolvedUserId = createUserResult.data.user.id;
      previousAppMetadata = createUserResult.data.user.app_metadata ?? {};
      previousUserMetadata = createUserResult.data.user.user_metadata ?? {};
      legajo = getLegajoFromUser(createUserResult.data.user);
      createdDuringRequest = true;
    }
  }

  const { error: updateUserError } = await supabase.auth.admin.updateUserById(
    resolvedUserId,
    {
      email: studentAuthEmail,
      email_confirm: true,
      app_metadata: {
        ...(previousAppMetadata ?? {}),
        role: "alumno",
        request_approved_by: reviewedBy,
        request_approved_at: reviewTimestamp,
        approved_request_id: requestId,
        legajo,
      },
      user_metadata: {
        ...(previousUserMetadata ?? {}),
        role: "alumno",
        full_name: studentFullName,
        legajo,
      },
    },
  );

  if (updateUserError) {
    if (createdDuringRequest) {
      await supabase.auth.admin.deleteUser(resolvedUserId);
    }

    return {
      error: NextResponse.json(
        { error: "No se pudo sincronizar la cuenta del alumno aprobada." },
        { status: 500 },
      ),
    };
  }

  return {
    managedUser: {
      userId: resolvedUserId,
      legajo: legajo ?? "",
      previousAppMetadata,
      previousUserMetadata,
      createdDuringRequest,
    },
  };
}

async function rollbackManagedUser(params: {
  supabase: AdminSupabaseClient;
  managedUser: ManagedAuthUser;
}) {
  const { supabase, managedUser } = params;

  if (managedUser.createdDuringRequest) {
    await supabase.auth.admin.deleteUser(managedUser.userId);
    return;
  }

  if (managedUser.previousAppMetadata && managedUser.previousUserMetadata) {
    await supabase.auth.admin.updateUserById(managedUser.userId, {
      app_metadata: managedUser.previousAppMetadata,
      user_metadata: managedUser.previousUserMetadata,
    });
  }
}

async function cleanupPendingInvitedUser(params: {
  supabase: AdminSupabaseClient;
  authUserId: string | null;
  previousStatus: string;
  nextStatus: RequestStatus;
}) {
  const { supabase, authUserId, previousStatus, nextStatus } = params;

  if (!authUserId || nextStatus !== "rechazada" || previousStatus === "aprobada") {
    return;
  }

  await supabase.auth.admin.deleteUser(authUserId);
}

async function syncApprovedStudentData(params: {
  supabase: AdminSupabaseClient;
  request: ExistingRequest;
  authUserId: string;
  legajo: string;
  actorProfileId: string | null;
}) {
  const { supabase, request, authUserId, legajo, actorProfileId } = params;
  const studentProfile = await upsertProfile({
    supabase,
    authUserId,
    fullName: request.student_full_name,
    dni: request.student_dni,
    email: buildInternalStudentEmail(legajo),
    phone: request.contact_phone,
  });

  await ensureProfileRole({
    supabase,
    profileId: studentProfile.id,
    roleCode: "alumno",
  });

  await ensureStudentRecord({
    supabase,
    profileId: studentProfile.id,
    studentCode: legajo,
    admissionDate: request.reviewed_at,
  });

  if (request.responsible_type === "tutor" && request.tutor_full_name && request.tutor_dni) {
    const guardianProfile = await upsertProfile({
      supabase,
      fullName: request.tutor_full_name,
      dni: request.tutor_dni,
    });

    await ensureProfileRole({
      supabase,
      profileId: guardianProfile.id,
      roleCode: "tutor",
    });

    await ensureTutorAuthAccount({
      supabase,
      profileId: guardianProfile.id,
      fullName: request.tutor_full_name,
      dni: request.tutor_dni,
      email: request.email,
      password: request.tutor_dni,
      legajo: buildTutorLegajo(legajo),
    });

    await ensureGuardianLink({
      supabase,
      studentProfileId: studentProfile.id,
      guardianProfileId: guardianProfile.id,
      relationshipType: "tutor",
      isPrimary: true,
    });
  }

  if (request.responsible_type === "parents") {
    if (request.father_full_name && request.father_dni) {
      const fatherProfile = await upsertProfile({
        supabase,
        fullName: request.father_full_name,
        dni: request.father_dni,
      });

      await ensureProfileRole({
        supabase,
        profileId: fatherProfile.id,
        roleCode: "tutor",
      });

      await ensureGuardianLink({
        supabase,
        studentProfileId: studentProfile.id,
        guardianProfileId: fatherProfile.id,
        relationshipType: "padre",
        isPrimary: false,
      });
    }

    if (request.mother_full_name && request.mother_dni) {
      const motherProfile = await upsertProfile({
        supabase,
        fullName: request.mother_full_name,
        dni: request.mother_dni,
      });

      await ensureProfileRole({
        supabase,
        profileId: motherProfile.id,
        roleCode: "tutor",
      });

      await ensureTutorAuthAccount({
        supabase,
        profileId: motherProfile.id,
        fullName: request.mother_full_name,
        dni: request.mother_dni,
        email: request.email,
        password: request.mother_dni,
        legajo: buildTutorLegajo(legajo),
      });

      await ensureGuardianLink({
        supabase,
        studentProfileId: studentProfile.id,
        guardianProfileId: motherProfile.id,
        relationshipType: "madre",
        isPrimary: true,
      });
    }
  }

  await insertAuditLog({
    supabase,
    actorProfileId,
    entityName: "inscription_request",
    entityId: String(request.id),
    action: "approved_student_synced",
    newData: {
      auth_user_id: authUserId,
      student_profile_id: studentProfile.id,
      student_dni: request.student_dni,
    },
  });

  return studentProfile;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> },
) {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

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
    .select("id, auth_user_id, resolved_auth_user_id, student_profile_id, status, internal_notes, reviewed_at, reviewed_by")
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

  if ("error" in access) {
    return access.error;
  }

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
