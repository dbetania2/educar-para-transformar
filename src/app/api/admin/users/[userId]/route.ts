import { NextResponse } from "next/server";

import { normalizeEmail } from "@/lib/academicProfiles";
import { ensureAdministrativeAccess } from "@/lib/auth/adminAccess";
import { getLegajoFromUser, generateUniqueLegajo, roleUsesLegajo } from "@/lib/auth/legajo";
import { getRoleFromUser, normalizeRole, type AppUserRole } from "@/lib/auth/roles";
import {
  ensureProfileRole,
  ensureStudentRecord,
  ensureTeacherRecord,
  getGuardianLinksForStudent,
  getProfileByAuthUserId,
  getProfileFullName,
  getStudentLinksForGuardian,
  insertAuditLog,
  linkGuardianToStudentByDni,
  syncProfileNameAndEmail,
  upsertProfile,
  type BasicProfile,
} from "@/lib/supabase/academicAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

type UpdateUserPayload = {
  fullName: string;
  email: string;
  role: AppUserRole;
  dni?: string;
  tutorStudentDni?: string;
  reason?: string;
};

type ResetUserPasswordPayload = {
  mode: "request_dni";
};

type DeleteUserPayload = {
  reason: string;
};

type AdminGuardianLink = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  relationshipType: "tutor" | "madre" | "padre" | "responsable" | "otro";
  isPrimary: boolean;
};

type AdminUserDetail = {
  id: string;
  email: string;
  fullName: string;
  legajo: string | null;
  dni: string | null;
  role: AppUserRole | "desconocido";
  createdAt: string | null;
  lastSignInAt: string | null;
  requestStatus: string | null;
  requestStudentFullName: string | null;
  requestStudentDni: string | null;
  requestLevel: string | null;
  requestContactPhone: string | null;
  requestResponsibleType: "tutor" | "parents" | null;
  requestTutorFullName: string | null;
  requestTutorDni: string | null;
  requestFatherFullName: string | null;
  requestFatherDni: string | null;
  requestMotherFullName: string | null;
  requestMotherDni: string | null;
  linkedGuardians: AdminGuardianLink[];
  linkedStudents: AdminGuardianLink[];
};

function isValidPayload(payload: unknown): payload is UpdateUserPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const role = normalizeRole(candidate.role);

  return (
    typeof candidate.fullName === "string" &&
    candidate.fullName.trim().length >= 3 &&
    typeof candidate.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    role !== "desconocido" &&
    (typeof candidate.reason === "undefined" || typeof candidate.reason === "string") &&
    (typeof candidate.dni === "undefined" || candidate.dni === "" || (typeof candidate.dni === "string" && /^\d{8}$/.test(candidate.dni.trim()))) &&
    (typeof candidate.tutorStudentDni === "undefined" || candidate.tutorStudentDni === "" || (typeof candidate.tutorStudentDni === "string" && /^\d{8}$/.test(candidate.tutorStudentDni.trim())))
  );
}

function isValidDeleteUserPayload(payload: unknown): payload is DeleteUserPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return typeof candidate.reason === "string" && candidate.reason.trim().length >= 3;
}

function isValidResetPasswordPayload(
  payload: unknown,
): payload is ResetUserPasswordPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return candidate.mode === "request_dni";
}

function getDniFromUser(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
  const appDni = user.app_metadata?.dni;

  if (typeof appDni === "string" && appDni.trim().length > 0) {
    return appDni.trim();
  }

  const userDni = user.user_metadata?.dni;

  if (typeof userDni === "string" && userDni.trim().length > 0) {
    return userDni.trim();
  }

  return null;
}

async function getAdminSupabase() {
  if (!supabaseSecretKey) {
    return {
      error: NextResponse.json(
        { error: "Falta configurar SUPABASE_SECRET_KEY para la gestión administrativa." },
        { status: 500 },
      ),
    };
  }

  return { supabase: createAdminClient() };
}

async function getUserRequestInfo(supabase: ReturnType<typeof createAdminClient>, userId: string) {
  const { data, error } = await supabase
    .from("inscription_requests")
.select("status, student_full_name, student_dni, level, contact_phone, responsible_type, tutor_full_name, tutor_dni, father_full_name, father_dni, mother_full_name, mother_dni")
    .or(`auth_user_id.eq.${userId},resolved_auth_user_id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "No se pudo obtener la solicitud asociada al usuario.");
  }

  return {
    requestStatus: data?.status ?? null,
    requestStudentFullName: data?.student_full_name ?? null,
    requestStudentDni: data?.student_dni ?? null,
    requestLevel: data?.level ?? null,
    requestContactPhone: data?.contact_phone ?? null,
    requestResponsibleType: data?.responsible_type ?? null,
    requestTutorFullName: data?.tutor_full_name ?? null,
    requestTutorDni: data?.tutor_dni ?? null,
    requestFatherFullName: data?.father_full_name ?? null,
    requestFatherDni: data?.father_dni ?? null,
    requestMotherFullName: data?.mother_full_name ?? null,
    requestMotherDni: data?.mother_dni ?? null,
  };
}

async function getProfileByUserOrLegajo(params: {
  supabase: ReturnType<typeof createAdminClient>;
  userId: string;
  legajo: string | null;
  dni: string | null;
  role: AppUserRole | "desconocido";
}) {
  const { supabase, userId, legajo, dni, role } = params;
  const profile = await getProfileByAuthUserId(supabase, userId);

  if (profile) {
    return profile;
  }

  let fallbackProfile: BasicProfile | null = null;

  if (dni) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, auth_user_id, first_name, last_name, dni, email, phone")
      .eq("dni", dni)
      .maybeSingle();

    if (error) {
      throw new Error(error.message ?? "No se pudo obtener el perfil por DNI.");
    }

    fallbackProfile = (data ?? null) as BasicProfile | null;
  }

  if (!fallbackProfile && !legajo) {
    return null;
  }

  if (!fallbackProfile && role === "alumno" && legajo) {
    const { data, error } = await supabase
      .from("students")
      .select("profiles!inner(id, auth_user_id, first_name, last_name, dni, email, phone)")
      .eq("student_code", legajo)
      .maybeSingle();

    if (error) {
      throw new Error(error.message ?? "No se pudo obtener el perfil del alumno por legajo.");
    }

    const rowProfile = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;
    fallbackProfile = (rowProfile ?? null) as BasicProfile | null;
  }

  if (!fallbackProfile && role === "docente" && legajo) {
    const { data, error } = await supabase
      .from("teachers")
      .select("profiles!inner(id, auth_user_id, first_name, last_name, dni, email, phone)")
      .eq("teacher_code", legajo)
      .maybeSingle();

    if (error) {
      throw new Error(error.message ?? "No se pudo obtener el perfil del docente por legajo.");
    }

    const rowProfile = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;
    fallbackProfile = (rowProfile ?? null) as BasicProfile | null;
  }

  if (fallbackProfile && fallbackProfile.auth_user_id !== userId) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ auth_user_id: userId })
      .eq("id", fallbackProfile.id)
      .select("id, auth_user_id, first_name, last_name, dni, email, phone")
      .single();

    if (error) {
      throw new Error(error.message ?? "No se pudo vincular el perfil con el usuario autenticado.");
    }

    return data as BasicProfile;
  }

  return fallbackProfile;
}

async function ensureUserLegajoIfNeeded(params: {
  supabase: ReturnType<typeof createAdminClient>;
  user: NonNullable<Awaited<ReturnType<ReturnType<typeof createAdminClient>["auth"]["admin"]["getUserById"]>>["data"]["user"]>;
  role: AppUserRole | "desconocido";
  fullName: string;
  profileId?: string | null;
}) {
  const { supabase, user, role, fullName, profileId = null } = params;

  if (!roleUsesLegajo(role) || role === "desconocido") {
    return getLegajoFromUser(user);
  }

  const currentLegajo = getLegajoFromUser(user);

  if (currentLegajo) {
    return currentLegajo;
  }

  const nextLegajo = await generateUniqueLegajo(supabase, role);
  const nextAppMetadata = {
    ...(user.app_metadata ?? {}),
    role,
    legajo: nextLegajo,
  };
  const nextUserMetadata = {
    ...(user.user_metadata ?? {}),
    role,
    full_name: fullName,
    legajo: nextLegajo,
  };

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: nextAppMetadata,
    user_metadata: nextUserMetadata,
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message ?? "No se pudo generar el legajo del usuario.");
  }

  if (profileId) {
    if (role === "alumno") {
      await ensureStudentRecord({
        supabase,
        profileId,
        studentCode: nextLegajo,
      });
    }

    if (role === "docente") {
      await ensureTeacherRecord({
        supabase,
        profileId,
        teacherCode: nextLegajo,
      });
    }
  }

  return nextLegajo;
}

async function buildAdminUserDetail(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<AdminUserDetail | null> {
  const { data: userResult, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !userResult.user) {
    return null;
  }

  const role = getRoleFromUser(userResult.user);
  const currentLegajo = getLegajoFromUser(userResult.user);
  const [requestInfo, profile] = await Promise.all([
    getUserRequestInfo(supabase, userId),
    getProfileByUserOrLegajo({
      supabase,
      userId,
      legajo: currentLegajo,
      dni: getDniFromUser(userResult.user),
      role,
    }),
  ]);
  const fullName =
    getProfileFullName(profile) ||
    requestInfo.requestStudentFullName ||
    (typeof userResult.user.user_metadata?.full_name === "string"
      ? userResult.user.user_metadata.full_name
      : "") ||
    "";
  const legajo = await ensureUserLegajoIfNeeded({
    supabase,
    user: userResult.user,
    role,
    fullName,
    profileId: profile?.id ?? null,
  });
  const [linkedGuardians, linkedStudents] = profile?.id
    ? await Promise.all([
        role === "alumno" ? getGuardianLinksForStudent(supabase, profile.id) : Promise.resolve([]),
        role === "tutor" ? getStudentLinksForGuardian(supabase, profile.id) : Promise.resolve([]),
      ])
    : [[], []];

  return {
    id: userResult.user.id,
    email: userResult.user.email ?? "",
    fullName,
    legajo,
    dni: profile?.dni ?? requestInfo.requestStudentDni,
    role,
    createdAt: userResult.user.created_at ?? null,
    lastSignInAt: userResult.user.last_sign_in_at ?? null,
    requestStatus: requestInfo.requestStatus,
    requestStudentFullName: requestInfo.requestStudentFullName,
    requestStudentDni: profile?.dni ?? requestInfo.requestStudentDni,
    requestLevel: requestInfo.requestLevel,
    requestContactPhone: requestInfo.requestContactPhone,
    requestResponsibleType: requestInfo.requestResponsibleType,
    requestTutorFullName: requestInfo.requestTutorFullName,
    requestTutorDni: requestInfo.requestTutorDni,
    requestFatherFullName: requestInfo.requestFatherFullName,
    requestFatherDni: requestInfo.requestFatherDni,
    requestMotherFullName: requestInfo.requestMotherFullName,
    requestMotherDni: requestInfo.requestMotherDni,
    linkedGuardians,
    linkedStudents,
  };
}

async function ensureCanChangeRole(params: {
  accessUserId: string;
  supabase: ReturnType<typeof createAdminClient>;
  userId: string;
  currentRole: AppUserRole | "desconocido";
  nextRole: AppUserRole;
}) {
  const { accessUserId, supabase, userId, currentRole, nextRole } = params;

  if (userId === accessUserId && currentRole === "administrativo" && nextRole !== "administrativo") {
    return NextResponse.json(
      { error: "No podés quitarte a vos mismo el rol administrativo." },
      { status: 409 },
    );
  }

  if (currentRole === "administrativo" && nextRole !== "administrativo") {
    const { data: usersData, error: listUsersError } = await supabase.auth.admin.listUsers();

    if (listUsersError) {
      return NextResponse.json(
        {
          error:
            listUsersError.message ??
            "No se pudo validar cuántos administrativos existen.",
        },
        { status: 500 },
      );
    }

    const administrativeUsers = (usersData.users ?? []).filter(
      (user) => getRoleFromUser(user) === "administrativo",
    );

    if (administrativeUsers.length <= 1) {
      return NextResponse.json(
        { error: "No podés quitar el rol al último usuario administrativo activo." },
        { status: 409 },
      );
    }
  }

  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access.error;
  }

  const adminResult = await getAdminSupabase();

  if ("error" in adminResult) {
    return adminResult.error;
  }

  const { userId } = await context.params;
  const user = await buildAdminUserDetail(adminResult.supabase, userId);

  if (!user) {
    return NextResponse.json(
      { error: "No se encontró el usuario." },
      { status: 404 },
    );
  }

  return NextResponse.json({ user });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access.error;
  }

  const adminResult = await getAdminSupabase();

  if ("error" in adminResult) {
    return adminResult.error;
  }

  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { error: "Payload inválido para actualizar el usuario." },
      { status: 400 },
    );
  }

  const { userId } = await context.params;
  const supabase = adminResult.supabase;
  const { data: userResult, error: getUserError } = await supabase.auth.admin.getUserById(userId);

  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: getUserError?.message ?? "No se encontró el usuario." },
      { status: 404 },
    );
  }

  const currentMetadata = userResult.user.user_metadata ?? {};
  const currentAppMetadata = userResult.user.app_metadata ?? {};
  const currentRole = getRoleFromUser(userResult.user);
  const nextRole = normalizeRole(body.role) as AppUserRole;
  const nextFullName = body.fullName.trim();
  const nextEmail = normalizeEmail(body.email) ?? body.email.trim().toLowerCase();
  const nextDni = typeof body.dni === "string" && body.dni.trim().length > 0 ? body.dni.trim() : null;
  const reason = body.reason?.trim() || null;
  const roleChanged = currentRole !== nextRole;

  if (roleChanged && (!reason || reason.length < 3)) {
    return NextResponse.json(
      { error: "Ingresá un motivo breve para auditar el cambio de rol." },
      { status: 400 },
    );
  }

  if (roleChanged) {
    const roleError = await ensureCanChangeRole({
      accessUserId: access.user.id,
      supabase,
      userId,
      currentRole,
      nextRole,
    });

    if (roleError) {
      return roleError;
    }
  }

  const currentLegajo = getLegajoFromUser(userResult.user);
  const needsLegajo = roleUsesLegajo(nextRole);
  const nextLegajo = needsLegajo
    ? currentLegajo ?? await generateUniqueLegajo(supabase, nextRole)
    : currentLegajo;

  const updatePayload: Parameters<typeof supabase.auth.admin.updateUserById>[1] = {
    email: nextEmail,
    email_confirm: true,
    app_metadata: {
      ...currentAppMetadata,
      role: nextRole,
      ...(nextLegajo ? { legajo: nextLegajo } : {}),
      ...(roleChanged
        ? {
            role_changed_by: access.user.email ?? access.user.id,
            role_changed_at: new Date().toISOString(),
            role_change_reason: reason,
            previous_role: currentRole,
          }
        : {}),
    },
    user_metadata: {
      ...currentMetadata,
      role: nextRole,
      full_name: nextFullName,
      ...(nextLegajo ? { legajo: nextLegajo } : {}),
    },
  };

  if (needsLegajo && nextDni) {
    updatePayload.password = nextDni;
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, updatePayload);

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "No se pudo actualizar el usuario." },
      { status: 500 },
    );
  }

  const [existingProfile, actorProfile] = await Promise.all([
    getProfileByUserOrLegajo({
      supabase,
      userId,
      legajo: currentLegajo,
      dni: getDniFromUser(userResult.user),
      role: currentRole,
    }),
    getProfileByAuthUserId(supabase, access.user.id),
  ]);

  let profile = existingProfile;

  if (needsLegajo) {
    const effectiveDni = nextDni ?? existingProfile?.dni ?? null;

    if (!(typeof effectiveDni === "string" && /^\d{8}$/.test(effectiveDni.trim()))) {
      return NextResponse.json(
        { error: "Este rol necesita un DNI válido de 8 dígitos para poder acceder con legajo." },
        { status: 400 },
      );
    }

    profile = await upsertProfile({
      supabase,
      authUserId: userId,
      fullName: nextFullName,
      dni: effectiveDni,
      email: nextEmail,
    });

    await ensureProfileRole({
      supabase,
      profileId: profile.id,
      roleCode: nextRole,
      previousRoleCode: roleChanged && currentRole !== "desconocido" ? currentRole : null,
    });

    if (nextRole === "alumno" && nextLegajo) {
      await ensureStudentRecord({
        supabase,
        profileId: profile.id,
        studentCode: nextLegajo,
      });
    }

    if (nextRole === "docente" && nextLegajo) {
      await ensureTeacherRecord({
        supabase,
        profileId: profile.id,
        teacherCode: nextLegajo,
      });
    }

    if (nextRole === "tutor" && typeof body.tutorStudentDni === "string" && body.tutorStudentDni.trim().length > 0) {
      const linkedStudent = await linkGuardianToStudentByDni({
        supabase,
        guardianProfileId: profile.id,
        studentDni: body.tutorStudentDni.trim(),
        relationshipType: "tutor",
        isPrimary: true,
      });

      await insertAuditLog({
        supabase,
        actorProfileId: actorProfile?.id ?? null,
        entityName: "student_guardian",
        entityId: `${linkedStudent.id}:${profile.id}`,
        action: "guardian_link_updated",
        newData: {
          student_profile_id: linkedStudent.id,
          guardian_profile_id: profile.id,
          relationship_type: "tutor",
        },
      });
    }
  } else {
    const syncedProfile = await syncProfileNameAndEmail({
      supabase,
      authUserId: userId,
      fullName: nextFullName,
      email: nextEmail,
    });

    if (syncedProfile) {
      profile = syncedProfile;

      await ensureProfileRole({
        supabase,
        profileId: syncedProfile.id,
        roleCode: nextRole,
        previousRoleCode: roleChanged && currentRole !== "desconocido" ? currentRole : null,
      });
    }
  }

  if (roleChanged) {
    await insertAuditLog({
      supabase,
      actorProfileId: actorProfile?.id ?? null,
      entityName: "auth_user",
      entityId: userId,
      action: "role_changed",
      oldData: { role: currentRole },
      newData: { role: nextRole, reason },
    });
  }

  const updatedUser = await buildAdminUserDetail(supabase, userId);

  if (!updatedUser) {
    return NextResponse.json(
      { error: "El usuario se actualizó pero no se pudo recargar su detalle." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, user: updatedUser });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access.error;
  }

  const adminResult = await getAdminSupabase();

  if ("error" in adminResult) {
    return adminResult.error;
  }

  const body = await request.json().catch(() => null);

  if (!isValidResetPasswordPayload(body)) {
    return NextResponse.json(
      { error: "Payload inválido para restablecer la contraseña." },
      { status: 400 },
    );
  }

  const { userId } = await context.params;
  const { data: userResult, error: getUserError } = await adminResult.supabase.auth.admin.getUserById(userId);

  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: getUserError?.message ?? "No se encontró el usuario." },
      { status: 404 },
    );
  }

  const [requestInfo, profile] = await Promise.all([
    getUserRequestInfo(adminResult.supabase, userId),
    getProfileByUserOrLegajo({
      supabase: adminResult.supabase,
      userId,
      legajo: getLegajoFromUser(userResult.user),
      dni: getDniFromUser(userResult.user),
      role: getRoleFromUser(userResult.user),
    }),
  ]);

  const passwordHint = profile?.dni ?? requestInfo.requestStudentDni;

  if (!passwordHint) {
    return NextResponse.json(
      { error: "Este usuario no tiene un DNI asociado para restablecer la contraseña." },
      { status: 409 },
    );
  }

  const { error } = await adminResult.supabase.auth.admin.updateUserById(userId, {
    password: passwordHint,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "No se pudo restablecer la contraseña del usuario." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    passwordHint,
  });
}


export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const access = await ensureAdministrativeAccess();

  if ("error" in access) {
    return access.error;
  }

  const adminResult = await getAdminSupabase();

  if ("error" in adminResult) {
    return adminResult.error;
  }

  const body = await request.json().catch(() => null);

  if (!isValidDeleteUserPayload(body)) {
    return NextResponse.json(
      { error: "Ingresá una justificación de al menos 3 caracteres para eliminar el usuario." },
      { status: 400 },
    );
  }

  const { userId } = await context.params;
  const supabase = adminResult.supabase;

  if (userId === access.user.id) {
    return NextResponse.json(
      { error: "No podés eliminar tu propio usuario administrativo." },
      { status: 409 },
    );
  }

  const { data: userResult, error: getUserError } = await supabase.auth.admin.getUserById(userId);

  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: getUserError?.message ?? "No se encontró el usuario." },
      { status: 404 },
    );
  }

  const currentRole = getRoleFromUser(userResult.user);

  if (currentRole === "administrativo") {
    const roleError = await ensureCanChangeRole({
      accessUserId: access.user.id,
      supabase,
      userId,
      currentRole,
      nextRole: "alumno",
    });

    if (roleError) {
      return roleError;
    }
  }

  const [profile, actorProfile] = await Promise.all([
    getProfileByUserOrLegajo({
      supabase,
      userId,
      legajo: getLegajoFromUser(userResult.user),
      dni: getDniFromUser(userResult.user),
      role: currentRole,
    }),
    getProfileByAuthUserId(supabase, access.user.id),
  ]);
  const reason = body.reason.trim();

  await insertAuditLog({
    supabase,
    actorProfileId: actorProfile?.id ?? null,
    entityName: "auth_user",
    entityId: userId,
    action: "user_deleted",
    oldData: {
      id: userResult.user.id,
      email: userResult.user.email ?? null,
      role: currentRole,
      legajo: getLegajoFromUser(userResult.user),
      profile_id: profile?.id ?? null,
      full_name: getProfileFullName(profile) || userResult.user.user_metadata?.full_name || null,
    },
    newData: { reason },
  });

  if (profile?.id) {
    const { error: deleteProfileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    if (deleteProfileError) {
      return NextResponse.json(
        { error: deleteProfileError.message ?? "No se pudo eliminar el perfil relacional del usuario." },
        { status: 500 },
      );
    }
  }

  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteUserError) {
    return NextResponse.json(
      { error: deleteUserError.message ?? "No se pudo eliminar el usuario Auth." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
