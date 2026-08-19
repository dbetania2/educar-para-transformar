import { buildFullName, normalizeEmail, splitFullName } from "@/lib/academicProfiles";
import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

export type BasicProfile = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  dni: string;
  email: string | null;
  phone: string | null;
};

function normalizeDni(dni: string) {
  return dni.trim();
}


export function buildInternalStudentEmail(legajo: string) {
  return `${legajo.trim().toLowerCase()}@alumnos.educar.test`;
}

export function buildTutorLegajo(studentLegajo: string) {
  return studentLegajo.trim().toUpperCase().replace(/^A/, "T");
}

export async function ensureTutorAuthAccount(params: {
  supabase: AdminSupabaseClient;
  profileId: string;
  fullName: string;
  dni: string;
  email: string;
  password: string;
  legajo: string;
}) {
  const { supabase, profileId, fullName, dni, password, legajo } = params;
  const email = normalizeEmail(params.email);

  if (!email) {
    throw new Error("No se pudo crear la cuenta del tutor porque falta el email del responsable.");
  }

  const users = await listAllAuthUsers(supabase);
  const existingUser = users.find((user) => user.email?.trim().toLowerCase() === email);
  const metadata = {
    role: "tutor",
    legajo,
    dni: dni.trim(),
  };

  const userResult = existingUser
    ? await supabase.auth.admin.updateUserById(existingUser.id, {
        email,
        password,
        email_confirm: true,
        app_metadata: {
          ...(existingUser.app_metadata ?? {}),
          ...metadata,
        },
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          ...metadata,
          full_name: fullName,
        },
      })
    : await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: metadata,
        user_metadata: {
          ...metadata,
          full_name: fullName,
        },
      });

  if (userResult.error || !userResult.data.user) {
    throw new Error(userResult.error?.message ?? "No se pudo crear la cuenta del tutor.");
  }

  const updateProfile = await supabase
    .from("profiles")
    .update({
      auth_user_id: userResult.data.user.id,
      email,
      is_active: true,
    })
    .eq("id", profileId);

  if (updateProfile.error) {
    throw new Error(updateProfile.error.message ?? "No se pudo vincular el tutor con su cuenta.");
  }

  return userResult.data.user;
}

export async function getProfileByAuthUserId(supabase: AdminSupabaseClient, authUserId: string) {
  const query = await supabase
    .from("profiles")
    .select("id, auth_user_id, first_name, last_name, dni, email, phone")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo obtener el perfil por usuario autenticado.");
  }

  return (query.data ?? null) as BasicProfile | null;
}

export async function getProfileByDni(supabase: AdminSupabaseClient, dni: string) {
  const query = await supabase
    .from("profiles")
    .select("id, auth_user_id, first_name, last_name, dni, email, phone")
    .eq("dni", normalizeDni(dni))
    .maybeSingle();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo obtener el perfil por DNI.");
  }

  return (query.data ?? null) as BasicProfile | null;
}

export async function getProfilesByAuthUserIds(supabase: AdminSupabaseClient, authUserIds: string[]) {
  if (authUserIds.length === 0) {
    return new Map<string, BasicProfile>();
  }

  const query = await supabase
    .from("profiles")
    .select("id, auth_user_id, first_name, last_name, dni, email, phone")
    .in("auth_user_id", authUserIds);

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudieron obtener los perfiles administrativos.");
  }

  return new Map(
    ((query.data ?? []) as BasicProfile[])
      .filter((profile) => typeof profile.auth_user_id === "string" && profile.auth_user_id.length > 0)
      .map((profile) => [profile.auth_user_id as string, profile]),
  );
}

export async function upsertProfile(params: {
  supabase: AdminSupabaseClient;
  authUserId?: string | null;
  fullName: string;
  dni: string;
  email?: string | null;
  phone?: string | null;
}) {
  const { supabase, authUserId = null, fullName, dni, email = null, phone = null } = params;
  const normalizedDni = normalizeDni(dni);
  const normalizedEmail = normalizeEmail(email);
  const names = splitFullName(fullName);

  let existingProfile: BasicProfile | null = null;

  if (authUserId) {
    existingProfile = await getProfileByAuthUserId(supabase, authUserId);
  }

  if (!existingProfile) {
    existingProfile = await getProfileByDni(supabase, normalizedDni);
  }

  if (existingProfile) {
    const updateQuery = await supabase
      .from("profiles")
      .update({
        auth_user_id: authUserId ?? existingProfile.auth_user_id,
        first_name: names.firstName,
        last_name: names.lastName,
        dni: normalizedDni,
        email: normalizedEmail ?? existingProfile.email,
        phone: phone ?? existingProfile.phone,
        is_active: true,
      })
      .eq("id", existingProfile.id)
      .select("id, auth_user_id, first_name, last_name, dni, email, phone")
      .single();

    if (updateQuery.error) {
      throw new Error(updateQuery.error.message ?? "No se pudo actualizar el perfil.");
    }

    return updateQuery.data as BasicProfile;
  }

  const insertQuery = await supabase
    .from("profiles")
    .insert({
      auth_user_id: authUserId,
      first_name: names.firstName,
      last_name: names.lastName,
      dni: normalizedDni,
      email: normalizedEmail,
      phone,
      is_active: true,
    })
    .select("id, auth_user_id, first_name, last_name, dni, email, phone")
    .single();

  if (insertQuery.error) {
    throw new Error(insertQuery.error.message ?? "No se pudo crear el perfil.");
  }

  return insertQuery.data as BasicProfile;
}

export async function syncProfileNameAndEmail(params: {
  supabase: AdminSupabaseClient;
  authUserId: string;
  fullName: string;
  email: string;
}) {
  const profile = await getProfileByAuthUserId(params.supabase, params.authUserId);

  if (!profile) {
    return null;
  }

  const names = splitFullName(params.fullName);
  const query = await params.supabase
    .from("profiles")
    .update({
      first_name: names.firstName,
      last_name: names.lastName,
      email: normalizeEmail(params.email),
      is_active: true,
    })
    .eq("id", profile.id)
    .select("id, auth_user_id, first_name, last_name, dni, email, phone")
    .single();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo sincronizar el perfil del usuario.");
  }

  return query.data as BasicProfile;
}

export async function ensureProfileRole(params: {
  supabase: AdminSupabaseClient;
  profileId: string;
  roleCode: string;
  previousRoleCode?: string | null;
}) {
  const { supabase, profileId, roleCode, previousRoleCode = null } = params;

  if (previousRoleCode && previousRoleCode !== roleCode) {
    const deleteQuery = await supabase
      .from("profile_roles")
      .delete()
      .eq("profile_id", profileId)
      .eq("role_code", previousRoleCode);

    if (deleteQuery.error) {
      throw new Error(deleteQuery.error.message ?? "No se pudo sincronizar el rol previo del perfil.");
    }
  }

  const insertQuery = await supabase
    .from("profile_roles")
    .insert({
      profile_id: profileId,
      role_code: roleCode,
    });

  if (insertQuery.error && insertQuery.error.code !== "23505") {
    throw new Error(insertQuery.error.message ?? "No se pudo asignar el rol al perfil.");
  }
}

export async function ensureStudentRecord(params: {
  supabase: AdminSupabaseClient;
  profileId: string;
  studentCode: string;
  admissionDate?: string | null;
}) {
  const { supabase, profileId, studentCode, admissionDate = null } = params;
  const query = await supabase
    .from("students")
    .upsert(
      {
        profile_id: profileId,
        student_code: studentCode,
        current_status: "activo",
        admission_date: admissionDate,
      },
      { onConflict: "profile_id" },
    )
    .select("profile_id")
    .single();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo sincronizar el registro de alumno.");
  }

  return query.data as { profile_id: string };
}

export async function ensureTeacherRecord(params: {
  supabase: AdminSupabaseClient;
  profileId: string;
  teacherCode: string;
  hireDate?: string | null;
}) {
  const { supabase, profileId, teacherCode, hireDate = null } = params;
  const query = await supabase
    .from("teachers")
    .upsert(
      {
        profile_id: profileId,
        teacher_code: teacherCode,
        hire_date: hireDate,
      },
      { onConflict: "profile_id" },
    )
    .select("profile_id")
    .single();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo sincronizar el registro de docente.");
  }

  return query.data as { profile_id: string };
}

export async function ensureGuardianLink(params: {
  supabase: AdminSupabaseClient;
  studentProfileId: string;
  guardianProfileId: string;
  relationshipType: GuardianRelationshipType;
  isPrimary: boolean;
}) {
  const { supabase, studentProfileId, guardianProfileId, relationshipType, isPrimary } = params;
  const query = await supabase
    .from("student_guardians")
    .insert({
      student_profile_id: studentProfileId,
      guardian_profile_id: guardianProfileId,
      relationship_type: relationshipType,
      is_primary: isPrimary,
    });

  if (query.error && query.error.code !== "23505") {
    throw new Error(query.error.message ?? "No se pudo vincular el responsable del alumno.");
  }
}

export type GuardianRelationshipType = "tutor" | "madre" | "padre" | "responsable" | "otro";

export type GuardianStudentLink = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  relationshipType: GuardianRelationshipType;
  isPrimary: boolean;
};

export async function getStudentProfileByDni(supabase: AdminSupabaseClient, dni: string) {
  const profile = await getProfileByDni(supabase, dni);

  if (!profile) {
    return null;
  }

  const query = await supabase
    .from("students")
    .select("profile_id, student_code")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo obtener el alumno por DNI.");
  }

  if (!query.data) {
    return null;
  }

  return {
    profile,
    studentCode: query.data.student_code as string | null,
  };
}

export async function getGuardianLinksForStudent(
  supabase: AdminSupabaseClient,
  studentProfileId: string,
): Promise<GuardianStudentLink[]> {
  const linksQuery = await supabase
    .from("student_guardians")
    .select("guardian_profile_id, relationship_type, is_primary")
    .eq("student_profile_id", studentProfileId)
    .order("is_primary", { ascending: false });

  if (linksQuery.error) {
    throw new Error(linksQuery.error.message ?? "No se pudieron obtener los tutores vinculados.");
  }

  const links = (linksQuery.data ?? []) as Array<{
    guardian_profile_id: string;
    relationship_type: GuardianRelationshipType;
    is_primary: boolean;
  }>;
  const guardianProfileIds = links.map((link) => link.guardian_profile_id);

  if (guardianProfileIds.length === 0) {
    return [];
  }

  const profilesQuery = await supabase
    .from("profiles")
    .select("id, first_name, last_name, dni, email")
    .in("id", guardianProfileIds);

  if (profilesQuery.error) {
    throw new Error(profilesQuery.error.message ?? "No se pudieron obtener los perfiles de tutores.");
  }

  const profilesById = new Map(
    ((profilesQuery.data ?? []) as Array<{ id: string; first_name: string; last_name: string; dni: string; email: string | null }>)
      .map((profile) => [profile.id, profile]),
  );

  return links.flatMap((link) => {
    const profile = profilesById.get(link.guardian_profile_id);

    if (!profile) {
      return [];
    }

    return [{
      profileId: profile.id,
      fullName: buildFullName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      relationshipType: link.relationship_type,
      isPrimary: link.is_primary,
    }];
  });
}

export async function getStudentLinksForGuardian(
  supabase: AdminSupabaseClient,
  guardianProfileId: string,
): Promise<GuardianStudentLink[]> {
  const linksQuery = await supabase
    .from("student_guardians")
    .select("student_profile_id, relationship_type, is_primary")
    .eq("guardian_profile_id", guardianProfileId)
    .order("is_primary", { ascending: false });

  if (linksQuery.error) {
    throw new Error(linksQuery.error.message ?? "No se pudieron obtener los alumnos vinculados.");
  }

  const links = (linksQuery.data ?? []) as Array<{
    student_profile_id: string;
    relationship_type: GuardianRelationshipType;
    is_primary: boolean;
  }>;
  const studentProfileIds = links.map((link) => link.student_profile_id);

  if (studentProfileIds.length === 0) {
    return [];
  }

  const profilesQuery = await supabase
    .from("profiles")
    .select("id, first_name, last_name, dni, email")
    .in("id", studentProfileIds);

  if (profilesQuery.error) {
    throw new Error(profilesQuery.error.message ?? "No se pudieron obtener los perfiles de alumnos.");
  }

  const profilesById = new Map(
    ((profilesQuery.data ?? []) as Array<{ id: string; first_name: string; last_name: string; dni: string; email: string | null }>)
      .map((profile) => [profile.id, profile]),
  );

  return links.flatMap((link) => {
    const profile = profilesById.get(link.student_profile_id);

    if (!profile) {
      return [];
    }

    return [{
      profileId: profile.id,
      fullName: buildFullName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      relationshipType: link.relationship_type,
      isPrimary: link.is_primary,
    }];
  });
}

export async function linkGuardianToStudentByDni(params: {
  supabase: AdminSupabaseClient;
  guardianProfileId: string;
  studentDni: string;
  relationshipType?: GuardianRelationshipType;
  isPrimary?: boolean;
}) {
  const student = await getStudentProfileByDni(params.supabase, params.studentDni);

  if (!student) {
    throw new Error("No se encontró un alumno activo con ese DNI para vincular al tutor.");
  }

  await ensureGuardianLink({
    supabase: params.supabase,
    studentProfileId: student.profile.id,
    guardianProfileId: params.guardianProfileId,
    relationshipType: params.relationshipType ?? "tutor",
    isPrimary: params.isPrimary ?? true,
  });

  return student.profile;
}

export async function insertAuditLog(params: {
  supabase: AdminSupabaseClient;
  actorProfileId?: string | null;
  entityName: string;
  entityId: string;
  action: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}) {
  const query = await params.supabase.from("audit_logs").insert({
    actor_profile_id: params.actorProfileId ?? null,
    entity_name: params.entityName,
    entity_id: params.entityId,
    action: params.action,
    old_data: params.oldData ?? null,
    new_data: params.newData ?? null,
  });

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo registrar la auditoría.");
  }
}

export function getProfileFullName(profile: Pick<BasicProfile, "first_name" | "last_name"> | null) {
  if (!profile) {
    return "";
  }

  return buildFullName(profile.first_name, profile.last_name);
}
