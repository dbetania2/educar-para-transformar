import { redirect } from "next/navigation";

import { buildFullName } from "@/lib/academicProfiles";
import { getLegajoFromUser } from "@/lib/auth/legajo";
import {
  getProtectedHomePathForUser,
  getRoleFromUser,
  getTeacherCoursePathBySlug,
  getTeacherCourseSectionPathBySlug,
  getTeacherHomePath,
  getTeacherHomePathBySlug,
  getTeacherSectionPathBySlug,
  getTeacherSlug,
  type TeacherCourseSection,
  type TeacherSection,
} from "@/lib/auth/roles";
import { formatDate } from "@/lib/studentDashboardShared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type SupabaseDbClient = SupabaseServerClient | ReturnType<typeof createAdminClient>;

type TeacherProfileRecord = {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  email: string | null;
  phone: string | null;
  auth_user_id: string | null;
};

type TeacherRecord = {
  profile_id: string;
  teacher_code: string;
  hire_date: string | null;
};

export type TeacherCourseRecord = {
  id: number;
  course_name: string;
  subject_name: string | null;
  academic_period: string | null;
  classroom: string | null;
  schedule_summary: string | null;
  status: "activa" | "completada" | "pausada" | "cancelada";
  created_at: string;
};

export type TeacherCourseStudentRecord = {
  profile_id: string;
  full_name: string;
  dni: string;
  email: string | null;
  student_code: string;
};

export type TeacherAssessmentGradeRecord = {
  student_profile_id: string;
  score: number | null;
  approved: boolean | null;
  teacher_comment: string | null;
};

export type TeacherAssessmentRecord = {
  id: number;
  title: string;
  description: string | null;
  evaluation_type: string | null;
  max_score: number | null;
  evaluated_at: string | null;
  created_at: string;
  grade_count: number;
  approved_count: number;
  pending_count: number;
  average_score: number | null;
  grades: TeacherAssessmentGradeRecord[];
};

export type TeacherAttendanceRecord = {
  student_profile_id: string;
  status: "presente" | "ausente" | "justificada" | "tarde";
  notes: string | null;
};

export type TeacherAttendanceSessionRecord = {
  id: number;
  session_date: string;
  topic: string | null;
  created_at: string;
  record_count: number;
  present_count: number;
  absent_count: number;
  justified_count: number;
  late_count: number;
  records: TeacherAttendanceRecord[];
};

export type TeacherCourseMaterialRecord = {
  id: number;
  title: string;
  description: string | null;
  resource_url: string | null;
  material_type: string | null;
  created_at: string;
};

export type TeacherStudentReportGradeRecord = {
  assessment_id: number;
  title: string;
  evaluation_type: string | null;
  max_score: number | null;
  evaluated_at: string | null;
  score: number | null;
  approved: boolean | null;
  teacher_comment: string | null;
};

export type TeacherStudentReportAttendanceRecord = {
  session_id: number;
  session_date: string;
  topic: string | null;
  status: TeacherAttendanceRecord["status"] | "sin_registro";
  notes: string | null;
};

export type TeacherStudentCourseReport = {
  course: TeacherCourseRecord;
  student: TeacherCourseStudentRecord;
  grades: TeacherStudentReportGradeRecord[];
  attendance: TeacherStudentReportAttendanceRecord[];
  submissions: [];
};

export type TeacherRouteContext = {
  user: {
    id: string;
    email: string | null;
    lastSignInAt: string | null;
  };
  slug: string;
  displayName: string;
  profile: TeacherProfileRecord | null;
  teacher: TeacherRecord | null;
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

function normalizeNumeric(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function mapCourseRow(course: {
  id: number;
  name: string | null;
  classroom: string | null;
  schedule_summary: string | null;
  status: TeacherCourseRecord["status"];
  created_at: string;
  subjects: { name: string | null } | Array<{ name: string | null }> | null;
  academic_terms:
    | { name: string | null; year: number | null }
    | Array<{ name: string | null; year: number | null }>
    | null;
}): TeacherCourseRecord {
  const subject = Array.isArray(course.subjects) ? course.subjects[0] : course.subjects;
  const academicTerm = Array.isArray(course.academic_terms)
    ? course.academic_terms[0]
    : course.academic_terms;

  return {
    id: course.id,
    course_name: course.name || subject?.name || "Curso",
    subject_name: subject?.name ?? null,
    academic_period: formatAcademicPeriod(academicTerm ?? null),
    classroom: course.classroom,
    schedule_summary: course.schedule_summary,
    status: course.status,
    created_at: course.created_at,
  };
}

async function getTeacherProfileByAuthUserId(
  supabase: SupabaseDbClient,
  authUserId: string,
  legajo?: string | null,
) {
  const query = await supabase
    .from("profiles")
    .select("id, first_name, last_name, dni, email, phone, auth_user_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (query.error && !isNoRowsError(query.error)) {
    failOnUnexpectedQueryError(query.error, "No se pudo obtener el perfil del docente.");
  }

  if (query.data || !legajo) {
    return (query.data ?? null) as TeacherProfileRecord | null;
  }

  const teacherQuery = await supabase
    .from("teachers")
    .select("profiles ( id, first_name, last_name, dni, email, phone, auth_user_id )")
    .eq("teacher_code", legajo)
    .maybeSingle();

  if (teacherQuery.error && !isNoRowsError(teacherQuery.error)) {
    failOnUnexpectedQueryError(teacherQuery.error, "No se pudo obtener el perfil docente por legajo.");
  }

  const profile = Array.isArray(teacherQuery.data?.profiles)
    ? teacherQuery.data.profiles[0]
    : teacherQuery.data?.profiles;

  return (profile ?? null) as TeacherProfileRecord | null;
}

async function getTeacherRecordByProfileId(supabase: SupabaseDbClient, profileId: string) {
  const query = await supabase
    .from("teachers")
    .select("profile_id, teacher_code, hire_date")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (query.error && !isNoRowsError(query.error)) {
    failOnUnexpectedQueryError(query.error, "No se pudo obtener el registro del docente.");
  }

  return (query.data ?? null) as TeacherRecord | null;
}

async function requireTeacherProfileContext(slug: string) {
  const context = await requireTeacherRouteContext(slug);

  if (!context.profile) {
    return { context, profileId: null };
  }

  return { context, profileId: context.profile.id };
}

const teacherCourseSelect = `
  id,
  name,
  classroom,
  schedule_summary,
  status,
  created_at,
  subjects (
    name
  ),
  academic_terms (
    name,
    year
  )
`;

async function getTeacherLinkedCourseIds(supabase: SupabaseDbClient, profileId: string) {
  const query = await supabase
    .from("course_teachers")
    .select("course_id")
    .eq("teacher_profile_id", profileId);

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener las asignaciones del docente.");

  return ((query.data ?? []) as Array<{ course_id: number }>).map((row) => row.course_id);
}

export async function getTeacherCourses(slug: string) {
  const { profileId } = await requireTeacherProfileContext(slug);

  if (!profileId) {
    return [] as TeacherCourseRecord[];
  }

  const supabase = createAdminClient();
  const linkedCourseIds = await getTeacherLinkedCourseIds(supabase, profileId);
  const directQuery = await supabase
    .from("courses")
    .select(teacherCourseSelect)
    .eq("teacher_profile_id", profileId)
    .order("created_at", { ascending: false });

  failOnUnexpectedQueryError(directQuery.error, "No se pudieron obtener los cursos del docente.");

  const rows = [...((directQuery.data ?? []) as Array<Parameters<typeof mapCourseRow>[0]>)];
  const existingIds = new Set(rows.map((course) => course.id));
  const missingLinkedIds = linkedCourseIds.filter((courseId) => !existingIds.has(courseId));

  if (missingLinkedIds.length > 0) {
    const linkedQuery = await supabase
      .from("courses")
      .select(teacherCourseSelect)
      .in("id", missingLinkedIds)
      .order("created_at", { ascending: false });

    failOnUnexpectedQueryError(linkedQuery.error, "No se pudieron obtener los cursos asignados del docente.");
    rows.push(...((linkedQuery.data ?? []) as Array<Parameters<typeof mapCourseRow>[0]>));
  }

  return rows
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .map(mapCourseRow);
}

export async function getTeacherCourseStudents(slug: string, courseId: number) {
  const course = await getTeacherCourse(slug, courseId);

  if (!course) {
    return { course: null, students: [] as TeacherCourseStudentRecord[] };
  }

  const supabase = createAdminClient();
  const query = await supabase
    .from("course_enrollments")
    .select("student_profile_id, students!inner ( student_code, profiles!inner ( id, first_name, last_name, dni, email ) )")
    .eq("course_id", courseId)
    .eq("enrollment_status", "activa")
    .order("enrolled_at", { ascending: true });

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener los alumnos del curso.");

  const students = ((query.data ?? []) as Array<{
    student_profile_id: string;
    students: { student_code: string; profiles: { id: string; first_name: string; last_name: string; dni: string; email: string | null } | Array<{ id: string; first_name: string; last_name: string; dni: string; email: string | null }> } | Array<{ student_code: string; profiles: { id: string; first_name: string; last_name: string; dni: string; email: string | null } | Array<{ id: string; first_name: string; last_name: string; dni: string; email: string | null }> }>;
  }>).map((row) => {
    const student = Array.isArray(row.students) ? row.students[0] : row.students;
    const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;

    return {
      profile_id: row.student_profile_id,
      full_name: buildFullName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      student_code: student.student_code,
    };
  });

  return { course, students };
}

export async function getTeacherCourse(slug: string, courseId: number) {
  const { profileId } = await requireTeacherProfileContext(slug);

  if (!profileId) {
    return null;
  }

  const supabase = createAdminClient();
  const directQuery = await supabase
    .from("courses")
    .select(teacherCourseSelect)
    .eq("teacher_profile_id", profileId)
    .eq("id", courseId)
    .maybeSingle();

  if (directQuery.error && !isNoRowsError(directQuery.error)) {
    failOnUnexpectedQueryError(directQuery.error, "No se pudo obtener el curso del docente.");
  }

  if (directQuery.data) {
    return mapCourseRow(directQuery.data as Parameters<typeof mapCourseRow>[0]);
  }

  const linkedQuery = await supabase
    .from("course_teachers")
    .select("course_id")
    .eq("teacher_profile_id", profileId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (linkedQuery.error && !isNoRowsError(linkedQuery.error)) {
    failOnUnexpectedQueryError(linkedQuery.error, "No se pudo validar la asignación del docente.");
  }

  if (!linkedQuery.data) {
    return null;
  }

  const courseQuery = await supabase
    .from("courses")
    .select(teacherCourseSelect)
    .eq("id", courseId)
    .maybeSingle();

  if (courseQuery.error && !isNoRowsError(courseQuery.error)) {
    failOnUnexpectedQueryError(courseQuery.error, "No se pudo obtener el curso asignado del docente.");
  }

  return courseQuery.data ? mapCourseRow(courseQuery.data as Parameters<typeof mapCourseRow>[0]) : null;
}

export async function getTeacherCourseAssessments(slug: string, courseId: number) {
  const course = await getTeacherCourse(slug, courseId);

  if (!course) {
    return { course: null, assessments: [] as TeacherAssessmentRecord[] };
  }

  const supabase = createAdminClient();
  const assessmentsQuery = await supabase
    .from("assessments")
    .select("id, title, description, evaluation_type, max_score, evaluated_at, created_at")
    .eq("course_id", courseId)
    .order("evaluated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  failOnUnexpectedQueryError(assessmentsQuery.error, "No se pudieron obtener las evaluaciones del curso.");

  const assessments = (assessmentsQuery.data ?? []) as Array<{
    id: number;
    title: string;
    description: string | null;
    evaluation_type: string | null;
    max_score: unknown;
    evaluated_at: string | null;
    created_at: string;
  }>;
  const assessmentIds = assessments.map((assessment) => assessment.id);
  const gradesByAssessment = new Map<number, Array<TeacherAssessmentGradeRecord>>();

  if (assessmentIds.length > 0) {
    const gradesQuery = await supabase
      .from("grades")
      .select("assessment_id, student_profile_id, score, approved, teacher_comment")
      .in("assessment_id", assessmentIds);

    failOnUnexpectedQueryError(gradesQuery.error, "No se pudieron obtener las calificaciones del curso.");

    for (const grade of (gradesQuery.data ?? []) as Array<{ assessment_id: number; student_profile_id: string; score: unknown; approved: boolean | null; teacher_comment: string | null }>) {
      const records = gradesByAssessment.get(grade.assessment_id) ?? [];
      records.push({
        student_profile_id: grade.student_profile_id,
        score: normalizeNumeric(grade.score),
        approved: grade.approved,
        teacher_comment: grade.teacher_comment,
      });
      gradesByAssessment.set(grade.assessment_id, records);
    }
  }

  return {
    course,
    assessments: assessments.map((assessment) => {
      const grades = gradesByAssessment.get(assessment.id) ?? [];
      const scoredGrades = grades.filter((grade): grade is TeacherAssessmentGradeRecord & { score: number } => typeof grade.score === "number");
      const averageScore = scoredGrades.length > 0
        ? scoredGrades.reduce((sum, grade) => sum + grade.score, 0) / scoredGrades.length
        : null;

      return {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        evaluation_type: assessment.evaluation_type,
        max_score: normalizeNumeric(assessment.max_score),
        evaluated_at: assessment.evaluated_at,
        created_at: assessment.created_at,
        grade_count: grades.length,
        approved_count: grades.filter((grade) => grade.approved === true).length,
        pending_count: grades.filter((grade) => grade.approved !== true).length,
        average_score: averageScore,
        grades,
      };
    }),
  };
}

export async function getTeacherCourseAttendance(slug: string, courseId: number) {
  const course = await getTeacherCourse(slug, courseId);

  if (!course) {
    return { course: null, sessions: [] as TeacherAttendanceSessionRecord[] };
  }

  const supabase = createAdminClient();
  const sessionsQuery = await supabase
    .from("class_sessions")
    .select("id, session_date, topic, created_at")
    .eq("course_id", courseId)
    .order("session_date", { ascending: false });

  failOnUnexpectedQueryError(sessionsQuery.error, "No se pudieron obtener las clases del curso.");

  const sessions = (sessionsQuery.data ?? []) as Array<{
    id: number;
    session_date: string;
    topic: string | null;
    created_at: string;
  }>;
  const sessionIds = sessions.map((session) => session.id);
  const recordsBySession = new Map<number, TeacherAttendanceRecord[]>();

  if (sessionIds.length > 0) {
    const recordsQuery = await supabase
      .from("attendance_records")
      .select("class_session_id, student_profile_id, status, notes")
      .in("class_session_id", sessionIds);

    failOnUnexpectedQueryError(recordsQuery.error, "No se pudieron obtener los registros de asistencia del curso.");

    for (const record of (recordsQuery.data ?? []) as Array<{ class_session_id: number; student_profile_id: string; status: "presente" | "ausente" | "justificada" | "tarde"; notes: string | null }>) {
      const records = recordsBySession.get(record.class_session_id) ?? [];
      records.push({ student_profile_id: record.student_profile_id, status: record.status, notes: record.notes });
      recordsBySession.set(record.class_session_id, records);
    }
  }

  return {
    course,
    sessions: sessions.map((session) => {
      const records = recordsBySession.get(session.id) ?? [];

      return {
        id: session.id,
        session_date: session.session_date,
        topic: session.topic,
        created_at: session.created_at,
        record_count: records.length,
        present_count: records.filter((record) => record.status === "presente").length,
        absent_count: records.filter((record) => record.status === "ausente").length,
        justified_count: records.filter((record) => record.status === "justificada").length,
        late_count: records.filter((record) => record.status === "tarde").length,
        records,
      };
    }),
  };
}

export async function getTeacherCourseMaterials(slug: string, courseId: number) {
  const course = await getTeacherCourse(slug, courseId);

  if (!course) {
    return { course: null, materials: [] as TeacherCourseMaterialRecord[] };
  }

  const supabase = createAdminClient();
  const query = await supabase
    .from("course_materials")
    .select("id, title, description, resource_url, material_type, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (isMissingRelationError(query.error)) {
    return {
      course,
      materials: [] as TeacherCourseMaterialRecord[],
    };
  }

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener los materiales del curso.");

  return {
    course,
    materials: (query.data ?? []) as TeacherCourseMaterialRecord[],
  };
}


export async function getTeacherStudentCourseReport(
  slug: string,
  courseId: number,
  studentProfileId: string,
): Promise<TeacherStudentCourseReport | null> {
  const [studentsResult, assessmentsResult, attendanceResult] = await Promise.all([
    getTeacherCourseStudents(slug, courseId),
    getTeacherCourseAssessments(slug, courseId),
    getTeacherCourseAttendance(slug, courseId),
  ]);

  if (!studentsResult.course || !assessmentsResult.course || !attendanceResult.course) {
    return null;
  }

  const student = studentsResult.students.find((item) => item.profile_id === studentProfileId);

  if (!student) {
    return null;
  }

  const grades = assessmentsResult.assessments.map((assessment) => {
    const grade = assessment.grades.find((record) => record.student_profile_id === studentProfileId);

    return {
      assessment_id: assessment.id,
      title: assessment.title,
      evaluation_type: assessment.evaluation_type,
      max_score: assessment.max_score,
      evaluated_at: assessment.evaluated_at,
      score: grade?.score ?? null,
      approved: grade?.approved ?? null,
      teacher_comment: grade?.teacher_comment ?? null,
    };
  });

  const attendance: TeacherStudentReportAttendanceRecord[] = attendanceResult.sessions.map((session) => {
    const record = session.records.find((item) => item.student_profile_id === studentProfileId);

    return {
      session_id: session.id,
      session_date: session.session_date,
      topic: session.topic,
      status: record?.status ?? "sin_registro",
      notes: record?.notes ?? null,
    };
  });

  return {
    course: studentsResult.course,
    student,
    grades,
    attendance,
    submissions: [],
  };
}

export function formatTeacherHomePath(slug: string) {
  return getTeacherHomePathBySlug(slug);
}

export function formatTeacherSectionPath(slug: string, section: TeacherSection) {
  return getTeacherSectionPathBySlug(slug, section);
}

export function formatTeacherCoursePath(slug: string, courseId: string | number) {
  return getTeacherCoursePathBySlug(slug, courseId);
}

export function formatTeacherCourseSectionPath(
  slug: string,
  courseId: string | number,
  section: TeacherCourseSection,
) {
  return getTeacherCourseSectionPathBySlug(slug, courseId, section);
}

export async function requireTeacherRouteContext(slug: string): Promise<TeacherRouteContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "docente") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  const expectedSlug = getTeacherSlug(data.user);

  if (slug !== expectedSlug) {
    redirect(getTeacherHomePath(data.user));
  }

  const adminSupabase = createAdminClient();
  const profile = await getTeacherProfileByAuthUserId(adminSupabase, data.user.id, getLegajoFromUser(data.user));
  const teacher = profile ? await getTeacherRecordByProfileId(adminSupabase, profile.id) : null;
  const fallbackName =
    typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim().length > 0
      ? data.user.user_metadata.full_name.trim()
      : "Docente";

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      lastSignInAt: data.user.last_sign_in_at ?? null,
    },
    slug: expectedSlug,
    displayName: buildFullName(profile?.first_name, profile?.last_name) || fallbackName,
    profile,
    teacher,
  };
}

export { formatDate };
