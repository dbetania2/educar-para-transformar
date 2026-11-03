import { NextResponse } from "next/server";

import { listAllAuthUsers } from "@/lib/auth/authUsers";
import { getLegajoFromUser, generateUniqueLegajo, roleUsesLegajo } from "@/lib/auth/legajo";
import { getRoleFromUser, normalizeRole, type AppUserRole } from "@/lib/auth/roles";
import { resolveStudentExtracurricular } from "@/lib/extracurricular";
import {
  ensureStudentRecord,
  ensureTeacherRecord,
  getGuardianLinksForStudent,
  getProfileByAuthUserId,
  getProfileFullName,
  getStudentLinksForGuardian,
  type BasicProfile,
} from "@/lib/supabase/academicAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseSecretKey } from "@/lib/supabase/env";

export type UpdateUserPayload = {
  fullName: string;
  email: string;
  role: AppUserRole;
  dni?: string;
  phone?: string;
  address?: string;
  specialty?: string;
  sports?: string[];
  transportRoute?: string;
  diningService?: string;
  tutorStudentDni?: string;
  reason?: string;
};

export type ResetUserPasswordPayload = {
  mode: "request_dni";
};

export type DeleteUserPayload = {
  reason: string;
};

export type AdminGuardianLink = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  relationshipType: "tutor" | "madre" | "padre" | "responsable" | "otro";
  isPrimary: boolean;
};

export type AdminUserDetail = {
  id: string;
  email: string;
  fullName: string;
  legajo: string | null;
  dni: string | null;
  phone: string | null;
  address: string | null;
  specialty: string | null;
  sports: string[];
  transportRoute: string;
  diningService: string;
  role: AppUserRole | "desconocido";
  status?: "activo" | "inactivo";
  isActive?: boolean;
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

export function isValidPayload(payload: unknown): payload is UpdateUserPayload {
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
    (typeof candidate.dni === "undefined" ||
      candidate.dni === "" ||
      (typeof candidate.dni === "string" && /^\d{8}$/.test(candidate.dni.trim()))) &&
    (typeof candidate.tutorStudentDni === "undefined" ||
      candidate.tutorStudentDni === "" ||
      (typeof candidate.tutorStudentDni === "string" && /^\d{8}$/.test(candidate.tutorStudentDni.trim())))
  );
}

export function isValidDeleteUserPayload(payload: unknown): payload is DeleteUserPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return typeof candidate.reason === "string" && candidate.reason.trim().length >= 3;
}

export function isValidResetPasswordPayload(
  payload: unknown,
): payload is ResetUserPasswordPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return candidate.mode === "request_dni";
}

export function getDniFromUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
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

export async function getAdminSupabase() {
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

export async function getUserRequestInfo(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("inscription_requests")
    .select(
      "status, student_full_name, student_dni, email, level, contact_phone, responsible_type, tutor_full_name, tutor_dni, father_full_name, father_dni, mother_full_name, mother_dni",
    )
    .or(`auth_user_id.eq.${userId},resolved_auth_user_id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "No se pudo obtener la solicitud asociada al usuario.");
  }

  return {
    requestStatus: data?.status ?? null,
    requestStudentFullName: data?.student_full_name ?? null,
    requestStudentDni: data?.student_dni ?? null,
    requestEmail: data?.email ?? null,
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

export async function getProfileByUserOrLegajo(params: {
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
      .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
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
      .select("profiles!inner(id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active)")
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
      .select("profiles!inner(id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active)")
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
      .select("id, auth_user_id, first_name, last_name, dni, email, phone, address, is_active")
      .single();

    if (error) {
      throw new Error(error.message ?? "No se pudo vincular el perfil con el usuario autenticado.");
    }

    return data as BasicProfile;
  }

  return fallbackProfile;
}

export async function ensureUserLegajoIfNeeded(params: {
  supabase: ReturnType<typeof createAdminClient>;
  user: NonNullable<
    Awaited<ReturnType<ReturnType<typeof createAdminClient>["auth"]["admin"]["getUserById"]>>["data"]["user"]
  >;
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
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...(user.app_metadata ?? {}), role, legajo: nextLegajo },
    user_metadata: { ...(user.user_metadata ?? {}), role, full_name: fullName, legajo: nextLegajo },
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message ?? "No se pudo generar el legajo del usuario.");
  }

  if (profileId) {
    if (role === "alumno") {
      await ensureStudentRecord({ supabase, profileId, studentCode: nextLegajo });
    }
    if (role === "docente") {
      await ensureTeacherRecord({ supabase, profileId, teacherCode: nextLegajo });
    }
  }

  return nextLegajo;
}

export async function buildAdminUserDetail(
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
  const [linkedGuardians, linkedStudents, teacherDetail] = profile?.id
    ? await Promise.all([
        role === "alumno" ? getGuardianLinksForStudent(supabase, profile.id) : Promise.resolve([]),
        role === "tutor" ? getStudentLinksForGuardian(supabase, profile.id) : Promise.resolve([]),
        role === "docente"
          ? supabase.from("teachers").select("title").eq("profile_id", profile.id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])
    : [[], [], { data: null, error: null }];

  const isActive =
    profile?.is_active !== false &&
    userResult.user.user_metadata?.is_active !== false &&
    userResult.user.user_metadata?.status !== "inactivo";

  const extracurricular =
    role === "alumno"
      ? resolveStudentExtracurricular({
          studentCode: legajo ?? "A000001",
          userMetadata: (userResult.user.user_metadata ?? null) as Record<string, unknown> | null,
        })
      : { sports: [], transportRoute: "No Registrado", diningService: "No Registrado" };

  const rawAuthEmail = userResult.user.email ?? "";
  const contactEmail =
    typeof userResult.user.user_metadata?.contact_email === "string" &&
    userResult.user.user_metadata.contact_email.trim().length > 0
      ? userResult.user.user_metadata.contact_email.trim()
      : requestInfo.requestEmail ?? null;
  const displayEmail =
    rawAuthEmail.endsWith(".educar.test") && contactEmail ? contactEmail : rawAuthEmail;

  return {
    id: userResult.user.id,
    email: displayEmail,
    fullName,
    legajo,
    dni: profile?.dni ?? requestInfo.requestStudentDni,
    phone: profile?.phone ?? requestInfo.requestContactPhone ?? null,
    address: profile?.address ?? null,
    specialty: (teacherDetail.data as { title?: string | null } | null)?.title ?? null,
    sports: extracurricular.sports.map((s) => s.name),
    transportRoute: extracurricular.transportRoute,
    diningService: extracurricular.diningService,
    role,
    status: isActive ? "activo" : "inactivo",
    isActive,
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

export async function ensureCanChangeRole(params: {
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
    // Se listan todas las páginas: con >50 usuarios el conteo de administrativos sería incorrecto.
    let allUsers: Awaited<ReturnType<typeof listAllAuthUsers>>;
    try {
      allUsers = await listAllAuthUsers(supabase);
    } catch (listUsersError) {
      return NextResponse.json(
        {
          error:
            listUsersError instanceof Error
              ? listUsersError.message
              : "No se pudo validar cuántos administrativos existen.",
        },
        { status: 500 },
      );
    }

    const administrativeUsers = allUsers.filter(
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

