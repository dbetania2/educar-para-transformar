import { buildFullName } from "@/lib/academicProfiles";
import type { AdminSupabaseClient, BasicProfile } from "./academicAdmin";
import { getProfileByDni } from "./academicAdmin";

export type GuardianRelationshipType = "tutor" | "madre" | "padre" | "responsable" | "otro";

export type GuardianStudentLink = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  relationshipType: GuardianRelationshipType;
  isPrimary: boolean;
};

export async function ensureGuardianLink(params: {
  supabase: AdminSupabaseClient;
  studentProfileId: string;
  guardianProfileId: string;
  relationshipType: GuardianRelationshipType;
  isPrimary: boolean;
}) {
  const { supabase, studentProfileId, guardianProfileId, relationshipType, isPrimary } = params;
  const existing = await supabase
    .from("student_guardians")
    .select("student_profile_id, guardian_profile_id")
    .eq("student_profile_id", studentProfileId)
    .eq("guardian_profile_id", guardianProfileId)
    .maybeSingle();

  if (existing.data) {
    const updateQuery = await supabase
      .from("student_guardians")
      .update({
        relationship_type: relationshipType,
        is_primary: isPrimary,
      })
      .eq("student_profile_id", studentProfileId)
      .eq("guardian_profile_id", guardianProfileId);

    if (updateQuery.error) {
      throw new Error(updateQuery.error.message ?? "No se pudo actualizar el vínculo del responsable.");
    }
    return;
  }

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
    ((profilesQuery.data ?? []) as Array<Pick<BasicProfile, "id" | "first_name" | "last_name" | "dni" | "email">>)
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
    ((profilesQuery.data ?? []) as Array<Pick<BasicProfile, "id" | "first_name" | "last_name" | "dni" | "email">>)
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

export async function enrollStudentInCourses(params: {
  supabase: AdminSupabaseClient;
  studentProfileId: string;
  courseIds: number[];
}) {
  const { supabase, studentProfileId } = params;
  const uniqueCourseIds = Array.from(
    new Set(params.courseIds.filter((id) => Number.isInteger(id) && id > 0)),
  );

  if (uniqueCourseIds.length === 0) {
    return;
  }

  const existingQuery = await supabase
    .from("course_enrollments")
    .select("course_id, enrollment_status")
    .eq("student_profile_id", studentProfileId)
    .in("course_id", uniqueCourseIds);

  const existingByCourse = new Map(
    ((existingQuery.data ?? []) as Array<{ course_id: number; enrollment_status: string }>).map(
      (row) => [row.course_id, row.enrollment_status],
    ),
  );

  const toInsert = uniqueCourseIds.filter((courseId) => !existingByCourse.has(courseId));
  const toReactivate = uniqueCourseIds.filter(
    (courseId) => existingByCourse.has(courseId) && existingByCourse.get(courseId) !== "activa",
  );

  if (toInsert.length > 0) {
    const insertResult = await supabase.from("course_enrollments").insert(
      toInsert.map((courseId) => ({
        course_id: courseId,
        student_profile_id: studentProfileId,
        enrollment_status: "activa",
      })),
    );

    if (insertResult.error && insertResult.error.code !== "23505") {
      throw new Error(insertResult.error.message ?? "No se pudo inscribir al alumno en los cursos seleccionados.");
    }
  }

  if (toReactivate.length > 0) {
    await supabase
      .from("course_enrollments")
      .update({ enrollment_status: "activa" })
      .eq("student_profile_id", studentProfileId)
      .in("course_id", toReactivate);
  }
}

