import { NextResponse } from "next/server";

import { normalizeEmail } from "@/lib/academicProfiles";
import { ensureAdministrativeAccess } from "@/lib/auth/adminAccess";
import { getLegajoFromUser, generateUniqueLegajo, roleUsesLegajo } from "@/lib/auth/legajo";
import { getRoleFromUser, normalizeRole, type AppUserRole } from "@/lib/auth/roles";
import {
  buildInternalStudentEmail,
  buildTutorLegajo,
  ensureGuardianLink,
  ensureProfileRole,
  ensureStudentRecord,
  ensureTeacherRecord,
  ensureTutorAuthAccount,
  getProfileByAuthUserId,
  getProfileFullName,
  getProfilesByAuthUserIds,
  insertAuditLog,
  linkGuardianToStudentByDni,
  upsertProfile,
  type BasicProfile,
} from "@/lib/supabase/academicAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

type StudentDossierPayload = {
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

type CreateUserPayload = {
  email: string;
  password?: string;
  fullName: string;
  role: AppUserRole;
  dni?: string;
  tutorStudentDni?: string;
} & Partial<StudentDossierPayload>;

function hasMinLength(value: unknown, min: number) {
  return typeof value === "string" && value.trim().length >= min;
}

function getStudentDossierPayload(payload: Record<string, unknown>): StudentDossierPayload | null {
  if (
    !hasMinLength(payload.level, 3) ||
    !(typeof payload.contactPhone === "string" && /^\d{8,15}$/.test(payload.contactPhone.trim())) ||
    (payload.responsibleType !== "tutor" && payload.responsibleType !== "parents")
  ) {
    return null;
  }

  if (payload.responsibleType === "tutor") {
    if (!hasMinLength(payload.tutorFullName, 3) || !(typeof payload.tutorDni === "string" && /^\d{8}$/.test(payload.tutorDni.trim()))) {
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

async function hasAdministrativeUsers() {
  if (!supabaseSecretKey) {
    return {
      error: NextResponse.json(
        { error: "Falta configurar SUPABASE_SECRET_KEY para la gestión administrativa." },
        { status: 500 },
      ),
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return {
      error: NextResponse.json(
        { error: error.message ?? "No se pudo validar el estado administrativo." },
        { status: 500 },
      ),
    };
  }

  return {
    supabase,
    users: data.users ?? [],
    hasAdministrativeUser: (data.users ?? []).some(
      (user) => getRoleFromUser(user) === "administrativo",
    ),
  };
}

function isValidPayload(payload: unknown): payload is CreateUserPayload {
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
    ((needsLegajo && (typeof candidate.dni === "string" && /^\d{8}$/.test(candidate.dni.trim()))) ||
      (!needsLegajo && typeof candidate.password === "string" && candidate.password.trim().length >= 6));

  if (!baseIsValid) {
    return false;
  }

  if (role === "tutor") {
    return (typeof candidate.tutorStudentDni === "string" && /^\d{8}$/.test(candidate.tutorStudentDni.trim()));
  }

  if (role !== "alumno") {
    return true;
  }

  return getStudentDossierPayload(candidate) !== null;
}

async function ensureListedUserLegajo(params: {
  supabase: AdminSupabaseClient;
  user: (Awaited<ReturnType<ReturnType<typeof createAdminClient>["auth"]["admin"]["listUsers"]>>["data"]["users"])[number];
  profile: BasicProfile | null;
  fullName: string;
  role: AppUserRole | "desconocido";
}) {
  const { supabase, user, profile, fullName, role } = params;

  if (!roleUsesLegajo(role) || role === "desconocido") {
    return getLegajoFromUser(user);
  }

  const currentLegajo = getLegajoFromUser(user);

  if (currentLegajo) {
    return currentLegajo;
  }

  const nextLegajo = await generateUniqueLegajo(supabase, role);
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      role,
      legajo: nextLegajo,
    },
    user_metadata: {
      ...(user.user_metadata ?? {}),
      role,
      full_name: fullName,
      legajo: nextLegajo,
    },
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message ?? "No se pudo sincronizar el legajo del usuario.");
  }

  if (profile?.id) {
    if (role === "alumno") {
      await ensureStudentRecord({
        supabase,
        profileId: profile.id,
        studentCode: nextLegajo,
      });
    }

    if (role === "docente") {
      await ensureTeacherRecord({
        supabase,
        profileId: profile.id,
        teacherCode: nextLegajo,
      });
    }
  }

  return nextLegajo;
}

async function syncManualStudentDossier(params: {
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
  const { supabase, actorUserId, authUserId, studentProfileId, studentFullName, studentDni, email, studentLegajo, dossier } = params;
  const actorProfile = await getProfileByAuthUserId(supabase, actorUserId);
  const reviewedAt = new Date().toISOString();

  if (dossier.responsibleType === "tutor") {
    const guardianProfile = await upsertProfile({
      supabase,
      fullName: dossier.tutorFullName,
      dni: dossier.tutorDni,
    });

    await ensureProfileRole({
      supabase,
      profileId: guardianProfile.id,
      roleCode: "tutor",
    });

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
      ensureProfileRole({
        supabase,
        profileId: fatherProfile.id,
        roleCode: "tutor",
      }),
      ensureProfileRole({
        supabase,
        profileId: motherProfile.id,
        roleCode: "tutor",
      }),
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
    throw new Error(existingRequestQuery.error.message ?? "No se pudo verificar la ficha del alumno.");
  }

  if (existingRequestQuery.data?.id) {
    const updateRequest = await supabase
      .from("inscription_requests")
      .update(requestPayload)
      .eq("id", existingRequestQuery.data.id);

    if (updateRequest.error) {
      throw new Error(updateRequest.error.message ?? "No se pudo actualizar la ficha administrativa del alumno.");
    }
  } else {
    const insertRequest = await supabase
      .from("inscription_requests")
      .insert(requestPayload);

    if (insertRequest.error) {
      throw new Error(insertRequest.error.message ?? "No se pudo crear la ficha administrativa del alumno.");
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

export async function GET() {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access.error;
  }

  const adminState = await hasAdministrativeUsers();

  if ("error" in adminState) {
    return adminState.error;
  }

  const authUserIds = adminState.users.map((user) => user.id);
  const [profilesByAuthUserId, requestsResult] = await Promise.all([
    getProfilesByAuthUserIds(adminState.supabase, authUserIds),
    adminState.supabase
      .from("inscription_requests")
      .select("auth_user_id, resolved_auth_user_id, status, student_full_name, student_dni"),
  ]);

  if (requestsResult.error) {
    return NextResponse.json(
      { error: requestsResult.error.message ?? "No se pudo sincronizar el estado de solicitudes." },
      { status: 500 },
    );
  }

  const requestsByAuthUserId = new Map(
    (requestsResult.data ?? [])
      .flatMap((request) => {
        const ids = [request.auth_user_id, request.resolved_auth_user_id]
          .filter((value): value is string => typeof value === "string" && value.length > 0);

        return ids.map((id) => [id, request] as const);
      }),
  );

  const users = await Promise.all(
    adminState.users
      .filter((user) => {
        const request = requestsByAuthUserId.get(user.id);

        if (!request) {
          return true;
        }

        return request.status === "aprobada";
      })
      .map(async (user) => {
        const request = requestsByAuthUserId.get(user.id);
        const profile = profilesByAuthUserId.get(user.id) ?? null;
        const fullName =
          getProfileFullName(profile) ||
          request?.student_full_name ||
          (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
          "";
        const role = getRoleFromUser(user);
        const legajo = await ensureListedUserLegajo({
          supabase: adminState.supabase,
          user,
          profile,
          fullName,
          role,
        });

        return {
          id: user.id,
          email: user.email ?? "",
          fullName,
          legajo,
          role,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at,
        };
      }),
  );

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access.error;
  }

  const adminState = await hasAdministrativeUsers();

  if ("error" in adminState) {
    return adminState.error;
  }

  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload inválido para crear usuario." },
      { status: 400 },
    );
  }

  const role = normalizeRole(body.role) as AppUserRole;
  const email = normalizeEmail(body.email) ?? body.email.trim().toLowerCase();
  const fullName = body.fullName.trim();
  const dni = typeof body.dni === "string" ? body.dni.trim() : null;
  const needsLegajo = roleUsesLegajo(role);
  const legajo = needsLegajo ? await generateUniqueLegajo(adminState.supabase, role) : null;
  const password = needsLegajo ? (dni as string) : (body.password as string);
  const studentDossier = role === "alumno" ? getStudentDossierPayload(body as Record<string, unknown>) : null;
  const authEmail = role === "alumno" && legajo ? buildInternalStudentEmail(legajo) : email;

  const { data, error } = await adminState.supabase.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    app_metadata: {
      role,
      ...(legajo ? { legajo } : {}),
    },
    user_metadata: {
      role,
      full_name: fullName,
      ...(legajo ? { legajo } : {}),
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo crear el usuario." },
      { status: 500 },
    );
  }

  try {
    if (needsLegajo && dni) {
      const profile = await upsertProfile({
        supabase: adminState.supabase,
        authUserId: data.user.id,
        fullName,
        dni,
        email: authEmail,
        phone: studentDossier?.contactPhone ?? null,
      });

      await ensureProfileRole({
        supabase: adminState.supabase,
        profileId: profile.id,
        roleCode: role,
      });

      if (role === "alumno") {
        await ensureStudentRecord({
          supabase: adminState.supabase,
          profileId: profile.id,
          studentCode: legajo as string,
        });

        if (studentDossier) {
          await syncManualStudentDossier({
            supabase: adminState.supabase,
            actorUserId: access.user.id,
            authUserId: data.user.id,
            studentProfileId: profile.id,
            studentFullName: fullName,
            studentDni: dni,
            email,
            studentLegajo: legajo as string,
            dossier: studentDossier,
          });
        }
      }

      if (role === "docente") {
        await ensureTeacherRecord({
          supabase: adminState.supabase,
          profileId: profile.id,
          teacherCode: legajo as string,
        });
      }

      if (role === "tutor" && typeof body.tutorStudentDni === "string") {
        const linkedStudent = await linkGuardianToStudentByDni({
          supabase: adminState.supabase,
          guardianProfileId: profile.id,
          studentDni: body.tutorStudentDni,
          relationshipType: "tutor",
          isPrimary: true,
        });

        await insertAuditLog({
          supabase: adminState.supabase,
          actorProfileId: (await getProfileByAuthUserId(adminState.supabase, access.user.id))?.id ?? null,
          entityName: "student_guardian",
          entityId: `${linkedStudent.id}:${profile.id}`,
          action: "guardian_link_created",
          newData: {
            student_profile_id: linkedStudent.id,
            guardian_profile_id: profile.id,
            relationship_type: "tutor",
          },
        });
      }
    }
  } catch (syncError) {
    await adminState.supabase.auth.admin.deleteUser(data.user.id);

    return NextResponse.json(
      {
        error:
          syncError instanceof Error
            ? syncError.message
            : "No se pudo completar el alta manual del usuario.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? authEmail,
      fullName,
      legajo,
      dni,
      role,
    },
  });
}
