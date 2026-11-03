import { generateLegajoFromSet, getLegajoFromUser, roleUsesLegajo } from "@/lib/auth/legajo";
import { normalizeRole, type AppUserRole } from "@/lib/auth/roles";
import {
  buildTutorLegajo,
  ensureGuardianLink,
  ensureProfileRole,
  ensureStudentRecord,
  ensureTeacherRecord,
  ensureTutorAuthAccount,
  getProfileByAuthUserId,
  insertAuditLog,
  upsertProfile,
  type AdminSupabaseClient,
  type BasicProfile,
} from "@/lib/supabase/academicAdmin";
import type { createAdminClient } from "@/lib/supabase/admin";

export type StudentDossierPayload = {
  level: string;
  contactPhone: string;
  responsibleType: "tutor" | "parents";
  tutorFullName: string;
  tutorDni: string;
  fatherFullName: string;
  fatherDni: string;
  motherFullName: string;
  motherDni: string;
};

export type CreateUserPayload = {
  email: string;
  password?: string;
  fullName: string;
  role: AppUserRole;
  dni?: string;
  address?: string;
  specialty?: string;
  sports?: string[];
  transportRoute?: string;
  diningService?: string;
  courseIds?: number[];
  tutorStudentDni?: string;
} & Partial<StudentDossierPayload>;

function hasMinLength(value: unknown, min: number) {
  return typeof value === "string" && value.trim().length >= min;
}

export function getStudentDossierPayload(
  payload: Record<string, unknown>,
): StudentDossierPayload | null {
  if (
    !hasMinLength(payload.level, 3) ||
    !(typeof payload.contactPhone === "string" && /^\d{8,15}$/.test(payload.contactPhone.trim())) ||
    (payload.responsibleType !== "tutor" && payload.responsibleType !== "parents")
  ) {
    return null;
  }

  if (payload.responsibleType === "tutor") {
    if (
      !hasMinLength(payload.tutorFullName, 3) ||
      !(typeof payload.tutorDni === "string" && /^\d{8}$/.test(payload.tutorDni.trim()))
    ) {
      return null;
    }
  }

  if (payload.responsibleType === "parents") {
    if (
      !hasMinLength(payload.fatherFullName, 3) ||
      !(typeof payload.fatherDni === "string" && /^\d{8}$/.test(payload.fatherDni.trim())) ||
      !hasMinLength(payload.motherFullName, 3) ||
      !(typeof payload.motherDni === "string" && /^\d{8}$/.test(payload.motherDni.trim()))
    ) {
      return null;
    }
  }

  return {
    level: String(payload.level).trim(),
    contactPhone: String(payload.contactPhone).trim(),
    responsibleType: payload.responsibleType,
    tutorFullName: typeof payload.tutorFullName === "string" ? payload.tutorFullName.trim() : "",
    tutorDni: typeof payload.tutorDni === "string" ? payload.tutorDni.trim() : "",
    fatherFullName: typeof payload.fatherFullName === "string" ? payload.fatherFullName.trim() : "",
    fatherDni: typeof payload.fatherDni === "string" ? payload.fatherDni.trim() : "",
    motherFullName: typeof payload.motherFullName === "string" ? payload.motherFullName.trim() : "",
    motherDni: typeof payload.motherDni === "string" ? payload.motherDni.trim() : "",
  };
}

export function isValidPayload(payload: unknown): payload is CreateUserPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const role = normalizeRole(candidate.role);
  const needsLegajo = roleUsesLegajo(role);
  const baseIsValid =
    typeof candidate.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    typeof candidate.fullName === "string" &&
    candidate.fullName.trim().length >= 3 &&
    role !== "desconocido" &&
    ((needsLegajo && typeof candidate.dni === "string" && /^\d{8}$/.test(candidate.dni.trim())) ||
      (!needsLegajo &&
        typeof candidate.password === "string" &&
        candidate.password.trim().length >= 6));

  if (!baseIsValid) {
    return false;
  }

  if (role === "tutor") {
    return (
      typeof candidate.tutorStudentDni === "string" &&
      /^\d{8}$/.test(candidate.tutorStudentDni.trim())
    );
  }

  if (role !== "alumno") {
    return true;
  }

  return getStudentDossierPayload(candidate) !== null;
}

export async function ensureListedUserLegajo(params: {
  supabase: AdminSupabaseClient;
  user: (Awaited<
    ReturnType<ReturnType<typeof createAdminClient>["auth"]["admin"]["listUsers"]>
  >["data"]["users"])[number];
  profile: BasicProfile | null;
  fullName: string;
  role: AppUserRole | "desconocido";
  /** Legajos ya existentes (se comparte entre usuarios para evitar N listados y colisiones). */
  existingLegajos: Set<string>;
}) {
  const { supabase, user, profile, fullName, role, existingLegajos } = params;

  if (!roleUsesLegajo(role) || role === "desconocido") {
    return getLegajoFromUser(user);
  }

  const currentLegajo = getLegajoFromUser(user);
  if (currentLegajo) {
    return currentLegajo;
  }

  const nextLegajo = generateLegajoFromSet(existingLegajos, role);
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...(user.app_metadata ?? {}), role, legajo: nextLegajo },
    user_metadata: { ...(user.user_metadata ?? {}), role, full_name: fullName, legajo: nextLegajo },
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message ?? "No se pudo sincronizar el legajo del usuario.");
  }

  if (profile?.id) {
    if (role === "alumno") {
      await ensureStudentRecord({ supabase, profileId: profile.id, studentCode: nextLegajo });
    }
    if (role === "docente") {
      await ensureTeacherRecord({ supabase, profileId: profile.id, teacherCode: nextLegajo });
    }
  }

  return nextLegajo;
}

export async function syncManualStudentDossier(params: {
  supabase: AdminSupabaseClient;
  actorUserId: string;
  authUserId: string;
  studentProfileId: string;
  studentFullName: string;
  studentDni: string;
  email: string;
  studentLegajo: string;
  dossier: StudentDossierPayload;
}) {
  const {
    supabase,
    actorUserId,
    authUserId,
    studentProfileId,
    studentFullName,
    studentDni,
    email,
    studentLegajo,
    dossier,
  } = params;
  const actorProfile = await getProfileByAuthUserId(supabase, actorUserId);
  const reviewedAt = new Date().toISOString();

  if (dossier.responsibleType === "tutor") {
    const guardianProfile = await upsertProfile({
      supabase,
      fullName: dossier.tutorFullName,
      dni: dossier.tutorDni,
    });

    await ensureProfileRole({ supabase, profileId: guardianProfile.id, roleCode: "tutor" });
    await ensureTutorAuthAccount({
      supabase,
      profileId: guardianProfile.id,
      fullName: dossier.tutorFullName,
      dni: dossier.tutorDni,
      email,
      password: dossier.tutorDni,
      legajo: buildTutorLegajo(studentLegajo),
    });
    await ensureGuardianLink({
      supabase,
      studentProfileId,
      guardianProfileId: guardianProfile.id,
      relationshipType: "tutor",
      isPrimary: true,
    });
  }

  if (dossier.responsibleType === "parents") {
    const fatherProfile = await upsertProfile({
      supabase,
      fullName: dossier.fatherFullName,
      dni: dossier.fatherDni,
    });
    const motherProfile = await upsertProfile({
      supabase,
      fullName: dossier.motherFullName,
      dni: dossier.motherDni,
    });

    await Promise.all([
      ensureProfileRole({ supabase, profileId: fatherProfile.id, roleCode: "tutor" }),
      ensureProfileRole({ supabase, profileId: motherProfile.id, roleCode: "tutor" }),
    ]);

    await ensureTutorAuthAccount({
      supabase,
      profileId: motherProfile.id,
      fullName: dossier.motherFullName,
      dni: dossier.motherDni,
      email,
      password: dossier.motherDni,
      legajo: buildTutorLegajo(studentLegajo),
    });

    await ensureTutorAuthAccount({
      supabase,
      profileId: fatherProfile.id,
      fullName: dossier.fatherFullName,
      dni: dossier.fatherDni,
      email,
      password: dossier.fatherDni,
    });

    await Promise.all([
      ensureGuardianLink({
        supabase,
        studentProfileId,
        guardianProfileId: fatherProfile.id,
        relationshipType: "padre",
        isPrimary: false,
      }),
      ensureGuardianLink({
        supabase,
        studentProfileId,
        guardianProfileId: motherProfile.id,
        relationshipType: "madre",
        isPrimary: true,
      }),
    ]);
  }

  const requestPayload = {
    auth_user_id: authUserId,
    resolved_auth_user_id: authUserId,
    student_profile_id: studentProfileId,
    resolved_by_profile_id: actorProfile?.id ?? null,
    student_full_name: studentFullName,
    student_dni: studentDni,
    level: dossier.level,
    responsible_type: dossier.responsibleType,
    tutor_full_name: dossier.responsibleType === "tutor" ? dossier.tutorFullName : null,
    tutor_dni: dossier.responsibleType === "tutor" ? dossier.tutorDni : null,
    father_full_name: dossier.responsibleType === "parents" ? dossier.fatherFullName : null,
    father_dni: dossier.responsibleType === "parents" ? dossier.fatherDni : null,
    mother_full_name: dossier.responsibleType === "parents" ? dossier.motherFullName : null,
    mother_dni: dossier.responsibleType === "parents" ? dossier.motherDni : null,
    contact_phone: dossier.contactPhone,
    email,
    status: "aprobada",
    internal_notes: "Alta manual creada desde administracion.",
    reviewed_at: reviewedAt,
    reviewed_by: actorProfile?.id ?? actorUserId,
  };

  const existingRequestQuery = await supabase
    .from("inscription_requests")
    .select("id")
    .eq("student_dni", studentDni)
    .maybeSingle();

  if (existingRequestQuery.error) {
    throw new Error(
      existingRequestQuery.error.message ?? "No se pudo verificar la ficha del alumno.",
    );
  }

  if (existingRequestQuery.data?.id) {
    const updateRequest = await supabase
      .from("inscription_requests")
      .update(requestPayload)
      .eq("id", existingRequestQuery.data.id);

    if (updateRequest.error) {
      throw new Error(
        updateRequest.error.message ?? "No se pudo actualizar la ficha administrativa del alumno.",
      );
    }
  } else {
    const insertRequest = await supabase.from("inscription_requests").insert(requestPayload);
    if (insertRequest.error) {
      throw new Error(
        insertRequest.error.message ?? "No se pudo crear la ficha administrativa del alumno.",
      );
    }
  }

  await insertAuditLog({
    supabase,
    actorProfileId: actorProfile?.id ?? null,
    entityName: "admin_user",
    entityId: authUserId,
    action: "manual_student_created",
    newData: {
      student_profile_id: studentProfileId,
      student_dni: studentDni,
      level: dossier.level,
      responsible_type: dossier.responsibleType,
    },
  });
}

