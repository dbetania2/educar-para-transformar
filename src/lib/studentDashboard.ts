import { redirect } from "next/navigation";

import { buildFullName } from "@/lib/academicProfiles";
import { getLegajoFromUser } from "@/lib/auth/legajo";
import {
  getProtectedHomePathForUser,
  getRoleFromUser,
  getStudentHomePath,
  getStudentHomePathBySlug,
  getStudentSectionPathBySlug,
  getStudentCoursePathBySlug,
  getStudentCourseSectionPathBySlug,
  getStudentSlug,
  type StudentCourseSection,
  type StudentSection,
} from "@/lib/auth/roles";
import type {
  StudentAttendanceRecord,
  StudentCourseRecord,
  StudentGradeRecord,
} from "@/lib/studentDashboardShared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type SupabaseDbClient = SupabaseServerClient | ReturnType<typeof createAdminClient>;

type InscriptionRequestRecord = {
  id: number;
  student_full_name: string;
  student_dni: string;
  level: string;
  responsible_type: "tutor" | "parents";
  tutor_full_name: string | null;
  tutor_dni: string | null;
  father_full_name: string | null;
  father_dni: string | null;
  mother_full_name: string | null;
  mother_dni: string | null;
  contact_phone: string;
  email: string;
  status: "pendiente" | "en_revision" | "aprobada" | "rechazada";
  internal_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
};

const STUDENT_REQUEST_SELECT = `
  id,
  student_full_name,
  student_dni,
  level,
  responsible_type,
  tutor_full_name,
  tutor_dni,
  father_full_name,
  father_dni,
  mother_full_name,
  mother_dni,
  contact_phone,
  email,
  status,
  internal_notes,
  reviewed_at,
  reviewed_by,
  created_at
`;

type DashboardQueryResult<T> = {
  data: T;
  migrationRequired: boolean;
};

type StudentProfileRecord = {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string | null;
  auth_user_id: string | null;
};

export type StudentCourseMaterialRecord = {
  id: number;
  title: string;
  description: string | null;
  resource_url: string | null;
  material_type: string | null;
  created_at: string;
};

export type StudentRouteContext = {
  user: {
    id: string;
    email: string | null;
    lastSignInAt: string | null;
    legajo: string | null;
  };
  slug: string;
  displayName: string;
  request: InscriptionRequestRecord | null;
};

function isNoRowsError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

function failOnUnexpectedQueryError(error: { message?: string } | null, fallbackMessage: string) {
  if (!error) {
    return;
  }

  throw new Error(error.message ?? fallbackMessage);
}

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table")
  );
}

function formatAcademicPeriod(term: { name: string | null; year: number | null } | null) {
  if (!term) {
    return null;
  }

  const parts = [term.name, typeof term.year === "number" ? String(term.year) : null].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;
}

async function getStudentProfileByAuthUserId(
  supabase: SupabaseDbClient,
  authUserId: string,
  legajo?: string | null,
) {
  const query = await supabase
    .from("profiles")
    .select("id, first_name, last_name, dni, email, auth_user_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (query.error && !isNoRowsError(query.error)) {
    failOnUnexpectedQueryError(query.error, "No se pudo obtener el perfil del alumno.");
  }

  if (query.data || !legajo) {
    return (query.data ?? null) as StudentProfileRecord | null;
  }

  const studentQuery = await supabase
    .from("students")
    .select("profiles ( id, first_name, last_name, dni, email, auth_user_id )")
    .eq("student_code", legajo)
    .maybeSingle();

  if (studentQuery.error && !isNoRowsError(studentQuery.error)) {
    failOnUnexpectedQueryError(studentQuery.error, "No se pudo obtener el perfil del alumno por legajo.");
  }

  const profile = Array.isArray(studentQuery.data?.profiles)
    ? studentQuery.data.profiles[0]
    : studentQuery.data?.profiles;

  return (profile ?? null) as StudentProfileRecord | null;
}

async function getStudentInscriptionRequest(params: {
  supabase: SupabaseDbClient;
  authUserId: string;
  profile: StudentProfileRecord | null;
}) {
  const { supabase, authUserId, profile } = params;
  const requestByUserQuery = await supabase
    .from("inscription_requests")
    .select(STUDENT_REQUEST_SELECT)
    .or(`auth_user_id.eq.${authUserId},resolved_auth_user_id.eq.${authUserId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (requestByUserQuery.error && !isNoRowsError(requestByUserQuery.error)) {
    failOnUnexpectedQueryError(requestByUserQuery.error, "No se pudieron obtener los datos del alumno.");
  }

  if (requestByUserQuery.data || !profile) {
    return (requestByUserQuery.data ?? null) as InscriptionRequestRecord | null;
  }

  const requestByProfileQuery = await supabase
    .from("inscription_requests")
    .select(STUDENT_REQUEST_SELECT)
    .eq("student_profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (requestByProfileQuery.error && !isNoRowsError(requestByProfileQuery.error)) {
    failOnUnexpectedQueryError(requestByProfileQuery.error, "No se pudieron obtener los datos del alumno por perfil.");
  }

  if (requestByProfileQuery.data || !profile.dni) {
    return (requestByProfileQuery.data ?? null) as InscriptionRequestRecord | null;
  }

  const requestByDniQuery = await supabase
    .from("inscription_requests")
    .select(STUDENT_REQUEST_SELECT)
    .eq("student_dni", profile.dni)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (requestByDniQuery.error && !isNoRowsError(requestByDniQuery.error)) {
    failOnUnexpectedQueryError(requestByDniQuery.error, "No se pudieron obtener los datos del alumno por DNI.");
  }

  return (requestByDniQuery.data ?? null) as InscriptionRequestRecord | null;
}

async function getRelationalStudentCourses(authUserId: string, legajo?: string | null): Promise<DashboardQueryResult<StudentCourseRecord[]>> {
  const supabase = createAdminClient();
  const profile = await getStudentProfileByAuthUserId(supabase, authUserId, legajo);

  if (!profile) {
    return { data: [], migrationRequired: false };
  }

  const enrollmentsQuery = await supabase
    .from("course_enrollments")
    .select(`
      enrolled_at,
      courses!inner (
        id,
        name,
        classroom,
        schedule_summary,
        status,
        teacher_profile_id,
        subjects (
          name
        ),
        academic_terms (
          name,
          year
        )
      )
    `)
    .eq("student_profile_id", profile.id)
    .order("enrolled_at", { ascending: true });

  failOnUnexpectedQueryError(enrollmentsQuery.error, "No se pudieron obtener los cursos del alumno.");

  const enrollmentRows = (enrollmentsQuery.data ?? []) as unknown as Array<{
    enrolled_at: string;
    courses: {
      id: number;
      name: string;
      classroom: string | null;
      schedule_summary: string | null;
      status: StudentCourseRecord["status"];
      teacher_profile_id: string | null;
      subjects: { name: string | null } | Array<{ name: string | null }> | null;
      academic_terms:
        | { name: string | null; year: number | null }
        | Array<{ name: string | null; year: number | null }>
        | null;
    };
  }>;

  const teacherProfileIds = Array.from(
    new Set(
      enrollmentRows
        .map((row) => row.courses.teacher_profile_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );

  const teacherNamesById = new Map<string, string>();

  if (teacherProfileIds.length > 0) {
    const teachersQuery = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", teacherProfileIds);

    failOnUnexpectedQueryError(teachersQuery.error, "No se pudieron obtener los docentes de los cursos.");

    for (const teacher of (teachersQuery.data ?? []) as Array<{ id: string; first_name: string; last_name: string }>) {
      teacherNamesById.set(teacher.id, buildFullName(teacher.first_name, teacher.last_name));
    }
  }

  return {
    data: enrollmentRows.map((row) => {
      const subject = Array.isArray(row.courses.subjects) ? row.courses.subjects[0] : row.courses.subjects;
      const academicTerm = Array.isArray(row.courses.academic_terms)
        ? row.courses.academic_terms[0]
        : row.courses.academic_terms;

      return {
        id: row.courses.id,
        course_name: row.courses.name || subject?.name || "Curso",
        teacher_name: row.courses.teacher_profile_id
          ? teacherNamesById.get(row.courses.teacher_profile_id) ?? null
          : null,
        academic_period: formatAcademicPeriod(academicTerm ?? null),
        schedule_summary: row.courses.schedule_summary,
        classroom: row.courses.classroom,
        status: row.courses.status,
        created_at: row.enrolled_at,
      };
    }),
    migrationRequired: false,
  };
}

async function getRelationalStudentGrades(authUserId: string, legajo?: string | null): Promise<DashboardQueryResult<StudentGradeRecord[]>> {
  const supabase = createAdminClient();
  const profile = await getStudentProfileByAuthUserId(supabase, authUserId, legajo);

  if (!profile) {
    return { data: [], migrationRequired: false };
  }

  const query = await supabase
    .from("grades")
    .select(`
      id,
      score,
      approved,
      teacher_comment,
      created_at,
      assessments!inner (
        title,
        max_score,
        evaluated_at,
        courses!inner (
          name
        )
      )
    `)
    .eq("student_profile_id", profile.id)
    .order("created_at", { ascending: false });

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener las notas del alumno.");

  const rows = (query.data ?? []) as unknown as Array<{
    id: number;
    score: number | null;
    approved: boolean | null;
    teacher_comment: string | null;
    created_at: string;
    assessments: {
      title: string;
      max_score: number | null;
      evaluated_at: string | null;
      courses: { name: string } | Array<{ name: string }>;
    };
  }>;

  return {
    data: rows.map((row) => {
      const course = Array.isArray(row.assessments.courses) ? row.assessments.courses[0] : row.assessments.courses;

      return {
        id: row.id,
        course_name: course?.name ?? "Curso",
        evaluation_name: row.assessments.title,
        grade_value: row.score,
        max_grade_value: row.assessments.max_score,
        approved: row.approved,
        teacher_comment: row.teacher_comment,
        evaluated_at: row.assessments.evaluated_at,
        created_at: row.created_at,
      };
    }),
    migrationRequired: false,
  };
}

async function getRelationalStudentCourseMaterials(
  authUserId: string,
  courseId: number,
  legajo?: string | null,
): Promise<DashboardQueryResult<StudentCourseMaterialRecord[]>> {
  const supabase = createAdminClient();
  const profile = await getStudentProfileByAuthUserId(supabase, authUserId, legajo);

  if (!profile) {
    return { data: [], migrationRequired: false };
  }

  const enrollmentQuery = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("course_id", courseId)
    .eq("student_profile_id", profile.id)
    .eq("enrollment_status", "activa")
    .maybeSingle();

  if (enrollmentQuery.error && !isNoRowsError(enrollmentQuery.error)) {
    failOnUnexpectedQueryError(enrollmentQuery.error, "No se pudo validar la inscripción del curso.");
  }

  if (!enrollmentQuery.data) {
    return { data: [], migrationRequired: false };
  }

  const materialsQuery = await supabase
    .from("course_materials")
    .select("id, title, description, resource_url, material_type, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (isMissingRelationError(materialsQuery.error)) {
    return { data: [], migrationRequired: true };
  }

  failOnUnexpectedQueryError(materialsQuery.error, "No se pudieron obtener los materiales del curso.");

  return {
    data: (materialsQuery.data ?? []) as StudentCourseMaterialRecord[],
    migrationRequired: false,
  };
}

async function getRelationalStudentAttendance(authUserId: string, legajo?: string | null): Promise<DashboardQueryResult<StudentAttendanceRecord[]>> {
  const supabase = createAdminClient();
  const profile = await getStudentProfileByAuthUserId(supabase, authUserId, legajo);

  if (!profile) {
    return { data: [], migrationRequired: false };
  }

  const query = await supabase
    .from("attendance_records")
    .select(`
      id,
      status,
      notes,
      created_at,
      class_sessions!inner (
        session_date,
        courses!inner (
          name
        )
      )
    `)
    .eq("student_profile_id", profile.id)
    .order("created_at", { ascending: false });

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener las asistencias del alumno.");

  const rows = (query.data ?? []) as unknown as Array<{
    id: number;
    status: StudentAttendanceRecord["status"];
    notes: string | null;
    created_at: string;
    class_sessions: {
      session_date: string;
      courses: { name: string } | Array<{ name: string }>;
    };
  }>;

  return {
    data: rows.map((row) => {
      const course = Array.isArray(row.class_sessions.courses)
        ? row.class_sessions.courses[0]
        : row.class_sessions.courses;

      return {
        id: row.id,
        course_name: course?.name ?? "Curso",
        class_date: row.class_sessions.session_date,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
      };
    }),
    migrationRequired: false,
  };
}

export function formatStudentHomePath(slug: string) {
  return getStudentHomePathBySlug(slug);
}

export function formatStudentSectionPath(slug: string, section: StudentSection) {
  return getStudentSectionPathBySlug(slug, section);
}

export function formatStudentCoursePath(slug: string, courseId: string | number) {
  return getStudentCoursePathBySlug(slug, courseId);
}

export function formatStudentCourseSectionPath(
  slug: string,
  courseId: string | number,
  section: StudentCourseSection,
) {
  return getStudentCourseSectionPathBySlug(slug, courseId, section);
}

export function formatStudentRequestStatus(status: InscriptionRequestRecord["status"] | null) {
  switch (status) {
    case "aprobada":
      return "Aprobada";
    case "en_revision":
      return "En revision";
    case "rechazada":
      return "Rechazada";
    case "pendiente":
      return "Pendiente";
    default:
      return "Sin estado";
  }
}

export function formatStudentAttendanceStatus(status: StudentAttendanceRecord["status"]) {
  switch (status) {
    case "presente":
      return "Presente";
    case "ausente":
      return "Ausente";
    case "justificada":
      return "Justificada";
    case "tarde":
      return "Llegada tarde";
    default:
      return status;
  }
}

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    ...options,
  }).format(parsedDate);
}

export async function requireStudentRouteContext(slug: string): Promise<StudentRouteContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "alumno") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  const expectedSlug = getStudentSlug(data.user);

  if (slug !== expectedSlug) {
    redirect(getStudentHomePath(data.user));
  }

  const adminSupabase = createAdminClient();
  const profile = await getStudentProfileByAuthUserId(adminSupabase, data.user.id, getLegajoFromUser(data.user));
  const request = await getStudentInscriptionRequest({
    supabase: adminSupabase,
    authUserId: data.user.id,
    profile,
  });
  const fallbackName =
    typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim().length > 0
      ? data.user.user_metadata.full_name.trim()
      : "Alumno";

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      lastSignInAt: data.user.last_sign_in_at ?? null,
      legajo: getLegajoFromUser(data.user),
    },
    slug: expectedSlug,
    displayName:
      buildFullName(profile?.first_name, profile?.last_name) ||
      request?.student_full_name ||
      fallbackName,
    request,
  };
}

export async function getStudentCourses(slug: string): Promise<DashboardQueryResult<StudentCourseRecord[]>> {
  const context = await requireStudentRouteContext(slug);
  return getRelationalStudentCourses(context.user.id, context.user.legajo);
}

export async function getStudentGrades(slug: string): Promise<DashboardQueryResult<StudentGradeRecord[]>> {
  const context = await requireStudentRouteContext(slug);
  return getRelationalStudentGrades(context.user.id, context.user.legajo);
}

export async function getStudentAttendance(slug: string): Promise<DashboardQueryResult<StudentAttendanceRecord[]>> {
  const context = await requireStudentRouteContext(slug);
  return getRelationalStudentAttendance(context.user.id, context.user.legajo);
}

export async function getStudentCourseMaterials(
  slug: string,
  courseId: number,
): Promise<DashboardQueryResult<StudentCourseMaterialRecord[]>> {
  const context = await requireStudentRouteContext(slug);
  return getRelationalStudentCourseMaterials(context.user.id, courseId, context.user.legajo);
}
