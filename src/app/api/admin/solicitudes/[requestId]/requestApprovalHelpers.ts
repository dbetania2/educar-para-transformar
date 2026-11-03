import { NextResponse } from "next/server";

import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { getLegajoFromUser, generateUniqueLegajo } from "@/lib/auth/legajo";
import {
  buildInternalStudentEmail,
  buildTutorLegajo,
  enrollStudentInCourses,
  ensureGuardianLink,
  ensureProfileRole,
  ensureStudentRecord,
  ensureTutorAuthAccount,
  insertAuditLog,
  type AdminSupabaseClient,
  upsertProfile,
} from "@/lib/supabase/academicAdmin";

export const VALID_STATUSES = ["pendiente", "en_revision", "aprobada", "rechazada"] as const;

export type RequestStatus = (typeof VALID_STATUSES)[number];

export type UpdateRequestPayload = {
  status: RequestStatus;
  internalNotes?: string;
  courseIds?: number[];
  sports?: string[];
  transportRoute?: string;
  diningService?: string;
};

export type DeleteRequestPayload = {
  reason: string;
};

export type ManagedAuthUser = {
  userId: string;
  legajo: string;
  previousAppMetadata: Record<string, unknown> | null;
  previousUserMetadata: Record<string, unknown> | null;
  createdDuringRequest: boolean;
};

export type ExistingRequest = {
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

export function isValidDeletePayload(payload: unknown): payload is DeleteRequestPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return typeof candidate.reason === "string" && candidate.reason.trim().length >= 3;
}

export function isValidPayload(payload: unknown): payload is UpdateRequestPayload {
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

export function hasWorkflowColumnsError(error: { code?: string; message?: string } | null) {
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
  // listUsers() sin paginar solo trae 50 usuarios: con más alumnos no encontraría
  // cuentas existentes y terminaría intentando crear duplicados.
  try {
    const users = await listAllAuthUsers(supabase);
    const user = users.find((candidate) => candidate.email?.trim().toLowerCase() === email);
    return { user };
  } catch (listError) {
    return {
      error: {
        message:
          listError instanceof Error ? listError.message : "No se pudieron listar los usuarios.",
      },
    };
  }
}

export async function ensureApprovedUser(params: {
  supabase: AdminSupabaseClient;
  authUserId: string | null;
  studentFullName: string;
  studentDni: string;
  contactEmail: string;
  sports: string[];
  transportRoute: string;
  diningService: string;
  reviewedBy: string;
  reviewTimestamp: string;
  requestId: number;
}): Promise<{ managedUser: ManagedAuthUser } | { error: NextResponse }> {
  const {
    supabase,
    authUserId,
    studentFullName,
    studentDni,
    contactEmail,
    sports,
    transportRoute,
    diningService,
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
        contact_email: contactEmail,
        legajo,
        sports,
        transport_route: transportRoute,
        dining_service: diningService,
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

  const { error: updateUserError } = await supabase.auth.admin.updateUserById(resolvedUserId, {
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
      contact_email: contactEmail,
      legajo,
      sports,
      transport_route: transportRoute,
      dining_service: diningService,
    },
  });

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

export async function rollbackManagedUser(params: {
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

export async function cleanupPendingInvitedUser(params: {
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

export async function syncApprovedStudentData(params: {
  supabase: AdminSupabaseClient;
  request: ExistingRequest;
  authUserId: string;
  legajo: string;
  actorProfileId: string | null;
  courseIds: number[];
}) {
  const { supabase, request, authUserId, legajo, actorProfileId, courseIds } = params;
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

  if (courseIds.length > 0) {
    await enrollStudentInCourses({
      supabase,
      studentProfileId: studentProfile.id,
      courseIds,
    });
  }

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

      await ensureTutorAuthAccount({
        supabase,
        profileId: fatherProfile.id,
        fullName: request.father_full_name,
        dni: request.father_dni,
        email: request.email,
        password: request.father_dni,
      });

      await ensureGuardianLink({
        supabase,
        studentProfileId: studentProfile.id,
        guardianProfileId: fatherProfile.id,
        relationshipType: "padre",
        isPrimary: false,
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
      course_ids: courseIds,
    },
  });

  return studentProfile;
}

