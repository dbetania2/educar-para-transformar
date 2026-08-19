import { redirect } from "next/navigation";

import { buildFullName } from "@/lib/academicProfiles";
import {
  getProtectedHomePathForUser,
  getRoleFromUser,
  getTutorHomePath,
  getTutorHomePathBySlug,
  getTutorSectionPathBySlug,
  getTutorSlug,
  getTutorStudentCoursePathBySlug,
  getTutorStudentPathBySlug,
  type TutorSection,
} from "@/lib/auth/roles";
import { formatDate } from "@/lib/studentDashboardShared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type SupabaseDbClient = SupabaseServerClient | ReturnType<typeof createAdminClient>;

type TutorProfileRecord = {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string | null;
  phone: string | null;
  auth_user_id: string | null;
};

export type TutorStudentRecord = {
  profile_id: string;
  full_name: string;
  dni: string;
  email: string | null;
  student_code: string | null;
  relationship_type: string;
  is_primary: boolean;
};

export type TutorCourseRecord = {
  id: number;
  course_name: string;
  subject_name: string | null;
  academic_period: string | null;
  classroom: string | null;
  schedule_summary: string | null;
  status: "activa" | "completada" | "pausada" | "cancelada";
  teacher_profile_id: string | null;
  teacher_name: string | null;
  created_at: string;
};

export type TutorStudentReportGradeRecord = {
  assessment_id: number;
  title: string;
  evaluation_type: string | null;
  max_score: number | null;
  evaluated_at: string | null;
  score: number | null;
  approved: boolean | null;
  teacher_comment: string | null;
};

export type TutorStudentReportAttendanceRecord = {
  session_id: number;
  session_date: string;
  topic: string | null;
  status: "presente" | "ausente" | "justificada" | "tarde" | "sin_registro";
  notes: string | null;
};

export type TutorCourseMaterialRecord = {
  id: number;
  title: string;
  description: string | null;
  resource_url: string | null;
  material_type: string | null;
  created_at: string;
};

export type TutorStudentCourseReport = {
  student: TutorStudentRecord;
  course: TutorCourseRecord;
  grades: TutorStudentReportGradeRecord[];
  attendance: TutorStudentReportAttendanceRecord[];
  materials: TutorCourseMaterialRecord[];
  submissions: [];
};

export type TutorTeacherMessageRecord = {
  id: number;
  message: string;
  created_at: string;
  read_at: string | null;
  tutor_name: string;
  student_name: string;
  course_name: string;
  student_profile_id: string;
  course_id: number;
};

export type TutorRouteContext = {
  user: {
    id: string;
    email: string | null;
    lastSignInAt: string | null;
  };
  slug: string;
  displayName: string;
  profile: TutorProfileRecord | null;
};

function isNoRowsError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

function failOnUnexpectedQueryError(error: { message?: string } | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message ?? fallbackMessage);
  }
}

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table")
  );
}

function isMissingColumnError(error: { code?: string; message?: string } | null, columnName: string) {
  return error?.code === "42703" || error?.message?.includes(`${columnName} does not exist`);
}

function normalizeNumeric(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }
  return null;
}

function formatAcademicPeriod(term: { name: string | null; year: number | null } | null) {
  if (!term) return null;
  const parts = [term.name, typeof term.year === "number" ? String(term.year) : null].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

function mapCourseRow(course: {
  id: number;
  name: string | null;
  classroom: string | null;
  schedule_summary: string | null;
  status: TutorCourseRecord["status"];
  teacher_profile_id: string | null;
  created_at: string;
  subjects: { name: string | null } | Array<{ name: string | null }> | null;
  academic_terms: { name: string | null; year: number | null } | Array<{ name: string | null; year: number | null }> | null;
}, teacherNamesById = new Map<string, string>()): TutorCourseRecord {
  const subject = Array.isArray(course.subjects) ? course.subjects[0] : course.subjects;
  const academicTerm = Array.isArray(course.academic_terms) ? course.academic_terms[0] : course.academic_terms;

  return {
    id: course.id,
    course_name: course.name || subject?.name || "Curso",
    subject_name: subject?.name ?? null,
    academic_period: formatAcademicPeriod(academicTerm ?? null),
    classroom: course.classroom,
    schedule_summary: course.schedule_summary,
    status: course.status,
    teacher_profile_id: course.teacher_profile_id,
    teacher_name: course.teacher_profile_id ? teacherNamesById.get(course.teacher_profile_id) ?? null : null,
    created_at: course.created_at,
  };
}

async function getTutorProfileByAuthUserId(supabase: SupabaseDbClient, authUserId: string) {
  const query = await supabase
    .from("profiles")
    .select("id, first_name, last_name, dni, email, phone, auth_user_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (query.error && !isNoRowsError(query.error)) {
    failOnUnexpectedQueryError(query.error, "No se pudo obtener el perfil del tutor.");
  }

  return (query.data ?? null) as TutorProfileRecord | null;
}

async function requireTutorProfileContext(slug: string) {
  const context = await requireTutorRouteContext(slug);
  return { context, profileId: context.profile?.id ?? null };
}

export async function requireTutorRouteContext(slug: string): Promise<TutorRouteContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "tutor") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  const expectedSlug = getTutorSlug(data.user);

  if (slug !== expectedSlug) {
    redirect(getTutorHomePath(data.user));
  }

  const adminSupabase = createAdminClient();
  const profile = await getTutorProfileByAuthUserId(adminSupabase, data.user.id);
  const fallbackName =
    typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim().length > 0
      ? data.user.user_metadata.full_name.trim()
      : "Tutor";

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      lastSignInAt: data.user.last_sign_in_at ?? null,
    },
    slug: expectedSlug,
    displayName: buildFullName(profile?.first_name, profile?.last_name) || fallbackName,
    profile,
  };
}

export async function getTutorStudents(slug: string) {
  const { profileId } = await requireTutorProfileContext(slug);

  if (!profileId) return [] as TutorStudentRecord[];

  const supabase = createAdminClient();
  const query = await supabase
    .from("student_guardians")
    .select("relationship_type, is_primary, students!inner ( student_code, profiles!inner ( id, first_name, last_name, dni, email ) )")
    .eq("guardian_profile_id", profileId)
    .order("is_primary", { ascending: false });

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener los hijos vinculados al tutor.");

  return ((query.data ?? []) as Array<{
    relationship_type: string;
    is_primary: boolean;
    students: { student_code: string | null; profiles: { id: string; first_name: string; last_name: string; dni: string; email: string | null } | Array<{ id: string; first_name: string; last_name: string; dni: string; email: string | null }> } | Array<{ student_code: string | null; profiles: { id: string; first_name: string; last_name: string; dni: string; email: string | null } | Array<{ id: string; first_name: string; last_name: string; dni: string; email: string | null }> }>;
  }>).map((row) => {
    const student = Array.isArray(row.students) ? row.students[0] : row.students;
    const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;

    return {
      profile_id: profile.id,
      full_name: buildFullName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      student_code: student.student_code,
      relationship_type: row.relationship_type,
      is_primary: row.is_primary,
    };
  });
}

export async function getTutorStudent(slug: string, studentProfileId: string) {
  const students = await getTutorStudents(slug);
  return students.find((student) => student.profile_id === studentProfileId) ?? null;
}

export async function getTutorStudentCourses(slug: string, studentProfileId: string) {
  const student = await getTutorStudent(slug, studentProfileId);

  if (!student) {
    return { student: null, courses: [] as TutorCourseRecord[] };
  }

  const supabase = createAdminClient();
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
        created_at,
        subjects ( name ),
        academic_terms ( name, year )
      )
    `)
    .eq("student_profile_id", studentProfileId)
    .eq("enrollment_status", "activa")
    .order("enrolled_at", { ascending: true });

  failOnUnexpectedQueryError(enrollmentsQuery.error, "No se pudieron obtener los cursos del alumno.");

  const rows = (enrollmentsQuery.data ?? []) as unknown as Array<{
    courses: Parameters<typeof mapCourseRow>[0];
  }>;
  const teacherProfileIds = Array.from(new Set(rows.map((row) => row.courses.teacher_profile_id).filter((value): value is string => Boolean(value))));
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
    student,
    courses: rows.map((row) => mapCourseRow(row.courses, teacherNamesById)),
  };
}

export async function getTutorStudentCourseReport(
  slug: string,
  studentProfileId: string,
  courseId: number,
): Promise<TutorStudentCourseReport | null> {
  const coursesResult = await getTutorStudentCourses(slug, studentProfileId);
  const course = coursesResult.courses.find((item) => item.id === courseId);

  if (!coursesResult.student || !course) return null;

  const supabase = createAdminClient();
  const [assessmentsQuery, sessionsQuery, materialsQuery] = await Promise.all([
    supabase
      .from("assessments")
      .select("id, title, evaluation_type, max_score, evaluated_at, grades ( student_profile_id, score, approved, teacher_comment )")
      .eq("course_id", courseId)
      .order("evaluated_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("class_sessions")
      .select("id, session_date, topic, attendance_records ( student_profile_id, status, notes )")
      .eq("course_id", courseId)
      .order("session_date", { ascending: false }),
    supabase
      .from("course_materials")
      .select("id, title, description, resource_url, material_type, created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false }),
  ]);

  failOnUnexpectedQueryError(assessmentsQuery.error, "No se pudieron obtener las notas del alumno.");
  failOnUnexpectedQueryError(sessionsQuery.error, "No se pudieron obtener las asistencias del alumno.");
  if (!isMissingRelationError(materialsQuery.error)) {
    failOnUnexpectedQueryError(materialsQuery.error, "No se pudieron obtener los materiales del curso.");
  }

  const grades = ((assessmentsQuery.data ?? []) as Array<{
    id: number;
    title: string;
    evaluation_type: string | null;
    max_score: unknown;
    evaluated_at: string | null;
    grades: Array<{ student_profile_id: string; score: unknown; approved: boolean | null; teacher_comment: string | null }> | null;
  }>).map((assessment) => {
    const grade = (assessment.grades ?? []).find((item) => item.student_profile_id === studentProfileId);
    return {
      assessment_id: assessment.id,
      title: assessment.title,
      evaluation_type: assessment.evaluation_type,
      max_score: normalizeNumeric(assessment.max_score),
      evaluated_at: assessment.evaluated_at,
      score: normalizeNumeric(grade?.score),
      approved: grade?.approved ?? null,
      teacher_comment: grade?.teacher_comment ?? null,
    };
  });

  const attendance = ((sessionsQuery.data ?? []) as Array<{
    id: number;
    session_date: string;
    topic: string | null;
    attendance_records: Array<{ student_profile_id: string; status: TutorStudentReportAttendanceRecord["status"]; notes: string | null }> | null;
  }>).map((session) => {
    const record = (session.attendance_records ?? []).find((item) => item.student_profile_id === studentProfileId);
    return {
      session_id: session.id,
      session_date: session.session_date,
      topic: session.topic,
      status: record?.status ?? "sin_registro",
      notes: record?.notes ?? null,
    };
  });

  return {
    student: coursesResult.student,
    course,
    grades,
    attendance,
    materials: isMissingRelationError(materialsQuery.error) ? [] : (materialsQuery.data ?? []) as TutorCourseMaterialRecord[],
    submissions: [],
  };
}

export async function getTeacherMessages(slug: string) {
  const { requireTeacherRouteContext, getTeacherCourses } = await import("@/lib/teacherDashboard");
  const context = await requireTeacherRouteContext(slug);
  const courses = await getTeacherCourses(slug);
  const courseIds = courses.map((course) => course.id);

  if (!context.profile || courseIds.length === 0) return [] as TutorTeacherMessageRecord[];

  const supabase = createAdminClient();
  let query: { data: unknown[] | null; error: { code?: string; message?: string } | null } = await supabase
    .from("tutor_teacher_messages")
    .select("id, message, created_at, read_at, tutor_profile_id, student_profile_id, course_id")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });
  let hasReadAtColumn = true;

  if (isMissingColumnError(query.error, "read_at")) {
    hasReadAtColumn = false;
    query = await supabase
      .from("tutor_teacher_messages")
      .select("id, message, created_at, tutor_profile_id, student_profile_id, course_id")
      .in("course_id", courseIds)
      .order("created_at", { ascending: false });
  }

  if (isMissingRelationError(query.error)) return [] as TutorTeacherMessageRecord[];
  failOnUnexpectedQueryError(query.error, "No se pudieron obtener los mensajes de tutores.");

  const rows = (query.data ?? []) as Array<{
    id: number;
    message: string;
    created_at: string;
    read_at?: string | null;
    tutor_profile_id: string;
    student_profile_id: string;
    course_id: number;
  }>;

  const profileIds = Array.from(new Set(rows.flatMap((row) => [row.tutor_profile_id, row.student_profile_id])));
  const profilesQuery = profileIds.length > 0
    ? await supabase.from("profiles").select("id, first_name, last_name").in("id", profileIds)
    : { data: [], error: null };

  failOnUnexpectedQueryError(profilesQuery.error, "No se pudieron obtener los perfiles vinculados a mensajes.");

  const profilesById = new Map(
    ((profilesQuery.data ?? []) as Array<{ id: string; first_name: string; last_name: string }>)
      .map((profile) => [profile.id, profile]),
  );
  const courseNamesById = new Map(courses.map((course) => [course.id, course.course_name]));

  return rows.map((row) => {
    const tutor = profilesById.get(row.tutor_profile_id);
    const student = profilesById.get(row.student_profile_id);

    return {
      id: row.id,
      message: row.message,
      created_at: row.created_at,
      read_at: hasReadAtColumn ? row.read_at ?? null : null,
      tutor_name: buildFullName(tutor?.first_name, tutor?.last_name) || "Tutor",
      student_name: buildFullName(student?.first_name, student?.last_name) || "Alumno",
      course_name: courseNamesById.get(row.course_id) ?? "Curso",
      student_profile_id: row.student_profile_id,
      course_id: row.course_id,
    };
  });
}

export function formatTutorHomePath(slug: string) {
  return getTutorHomePathBySlug(slug);
}

export function formatTutorSectionPath(slug: string, section: TutorSection) {
  return getTutorSectionPathBySlug(slug, section);
}

export function formatTutorStudentPath(slug: string, studentProfileId: string) {
  return getTutorStudentPathBySlug(slug, studentProfileId);
}

export function formatTutorStudentCoursePath(slug: string, studentProfileId: string, courseId: string | number) {
  return getTutorStudentCoursePathBySlug(slug, studentProfileId, courseId);
}

export { formatDate };
