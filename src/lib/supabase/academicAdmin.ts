import { buildFullName, normalizeEmail, splitFullName } from "@/lib/academicProfiles";
import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { getLegajoFromUser, generateUniqueLegajo } from "@/lib/auth/legajo";
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
  address?: string | null;
  is_active?: boolean | null;
};

function normalizeDni(dni: string) {
  return dni.trim();
}

export function buildInternalStudentEmail(legajo: string) {
  return `${legajo.trim().toLowerCase()}@alumnos.educar.test`;
}

export function buildInternalTutorEmail(dniOrLegajo: string) {
  return `tutor.${dniOrLegajo.trim().toLowerCase()}@tutores.educar.test`;
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
  legajo?: string;
}) {
  const { supabase, profileId, fullName, dni, password } = params;
  const cleanDni = dni.trim();
  const requestedEmail = normalizeEmail(params.email) ?? buildInternalTutorEmail(cleanDni);

  const users = await listAllAuthUsers(supabase);
  const existingProfile = await getProfileByDni(supabase, cleanDni);

  // 1. Buscar si este tutor ya tiene usuario Auth (por auth_user_id de su perfil o por DNI en metadata)
  const existingTutorUser = users.find(
    (u) =>
      (existingProfile?.auth_user_id && u.id === existingProfile.auth_user_id) ||
      u.user_metadata?.dni === cleanDni ||
      u.app_metadata?.dni === cleanDni,
  );

  if (existingTutorUser) {
    // Tutor ya registrado (ej. padre/madre inscribiendo a un 2do o 3er hermano):
    // Conservamos su legajo original y su contraseña actual sin pisarlos.
    const preservedLegajo =
      getLegajoFromUser(existingTutorUser) ||
      params.legajo ||
      (await generateUniqueLegajo(supabase, "tutor"));

    const updated = await supabase.auth.admin.updateUserById(existingTutorUser.id, {
      email_confirm: true,
      app_metadata: {
        ...(existingTutorUser.app_metadata ?? {}),
        role: "tutor",
        legajo: preservedLegajo,
        dni: cleanDni,
      },
      user_metadata: {
        ...(existingTutorUser.user_metadata ?? {}),
        role: "tutor",
        legajo: preservedLegajo,
        dni: cleanDni,
        full_name: fullName,
      },
    });

    if (updated.error || !updated.data.user) {
      throw new Error(updated.error?.message ?? "No se pudo sincronizar la cuenta existente del tutor.");
    }

    await supabase
      .from("profiles")
      .update({
        auth_user_id: updated.data.user.id,
        is_active: true,
      })
      .eq("id", profileId);

    return updated.data.user;
  }

  // 2. Es un tutor nuevo: verificamos si el email familiar ya está ocupado por otro usuario (ej. el otro progenitor)
  const emailOccupiedByOther = users.some(
    (u) => u.email?.trim().toLowerCase() === requestedEmail,
  );
  const effectiveEmail = emailOccupiedByOther ? buildInternalTutorEmail(cleanDni) : requestedEmail;

  const legajoOccupied = params.legajo
    ? users.some((u) => getLegajoFromUser(u)?.toUpperCase() === params.legajo?.toUpperCase())
    : true;
  const effectiveLegajo =
    !legajoOccupied && params.legajo
      ? params.legajo
      : await generateUniqueLegajo(supabase, "tutor");

  const metadata = {
    role: "tutor",
    legajo: effectiveLegajo,
    dni: cleanDni,
    contact_email: requestedEmail,
  };

  const userResult = await supabase.auth.admin.createUser({
    email: effectiveEmail,
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
      email: effectiveEmail,
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
    .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
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
    .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
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

  // PostgREST envía el filtro `in` en la URL: con cientos de UUIDs supera el límite
  // de longitud. Se consulta en lotes paralelos.
  const PROFILE_CHUNK_SIZE = 150;
  const chunks: string[][] = [];
  for (let index = 0; index < authUserIds.length; index += PROFILE_CHUNK_SIZE) {
    chunks.push(authUserIds.slice(index, index + PROFILE_CHUNK_SIZE));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      supabase
        .from("profiles")
        .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
        .in("auth_user_id", chunk),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    throw new Error(failed.error.message ?? "No se pudieron obtener los perfiles administrativos.");
  }

  return new Map(
    results
      .flatMap((result) => (result.data ?? []) as BasicProfile[])
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
  address?: string | null;
}) {
  const { supabase, authUserId = null, fullName, dni, email = null, phone = null, address = null } = params;
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
        dni: existingProfile.dni || normalizedDni,
        email: normalizedEmail ?? existingProfile.email,
        phone: phone !== null ? phone : existingProfile.phone,
        address: address !== null ? address : (existingProfile.address ?? null),
        is_active: existingProfile.is_active ?? true,
      })
      .eq("id", existingProfile.id)
      .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
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
      address,
      is_active: true,
    })
    .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
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
  phone?: string | null;
  address?: string | null;
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
      phone: params.phone !== undefined ? params.phone : profile.phone,
      address: params.address !== undefined ? params.address : (profile.address ?? null),
    })
    .eq("id", profile.id)
    .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
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
  title?: string | null;
  hireDate?: string | null;
}) {
  const { supabase, profileId, teacherCode, title, hireDate = null } = params;
  const payload: {
    profile_id: string;
    teacher_code: string;
    hire_date: string | null;
    title?: string | null;
  } = {
    profile_id: profileId,
    teacher_code: teacherCode,
    hire_date: hireDate,
  };

  if (title !== undefined) {
    payload.title = title;
  }

  const query = await supabase
    .from("teachers")
    .upsert(payload, { onConflict: "profile_id" })
    .select("profile_id")
    .single();

  if (query.error) {
    throw new Error(query.error.message ?? "No se pudo sincronizar el registro de docente.");
  }

  return query.data as { profile_id: string };
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

export {
  ensureGuardianLink,
  getStudentProfileByDni,
  getGuardianLinksForStudent,
  getStudentLinksForGuardian,
  linkGuardianToStudentByDni,
  enrollStudentInCourses,
  type GuardianRelationshipType,
  type GuardianStudentLink,
} from "./guardianLinks";
