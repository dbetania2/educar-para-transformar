import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileByAuthUserId, getProfileFullName, insertAuditLog } from "@/lib/supabase/academicAdmin";
import type { CourseStatus } from "@/features/admin/courses/types";

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

type CoursePayload = {
  name: string;
  subjectName: string;
  academicTermName: string;
  academicTermYear: number | string;
  teacherProfileId?: string | null;
  studentProfileIds?: string[];
  classroom?: string | null;
  scheduleSummary?: string | null;
  commission?: string | null;
  status?: CourseStatus;
};

const COURSE_STATUSES: CourseStatus[] = ["activa", "completada", "pausada", "cancelada"];

function normalizeOptionalText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeRequiredText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseYear(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : null;
}

function isValidPayload(payload: unknown): payload is CoursePayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  const year = parseYear(candidate.academicTermYear);
  const status = candidate.status ?? "activa";

  return (
    normalizeRequiredText(candidate.name).length >= 3 &&
    normalizeRequiredText(candidate.subjectName).length >= 3 &&
    normalizeRequiredText(candidate.academicTermName).length >= 3 &&
    year !== null &&
    COURSE_STATUSES.includes(status as CourseStatus) &&
    (!candidate.studentProfileIds || Array.isArray(candidate.studentProfileIds))
  );
}

function fullName(profile: { first_name: string; last_name: string }) {
  return getProfileFullName(profile) || "Sin nombre";
}

async function ensureSubject(supabase: AdminSupabaseClient, name: string) {
  const existing = await supabase.from("subjects").select("id, name").eq("name", name).maybeSingle();

  if (existing.error && existing.error.code !== "PGRST116") {
    throw new Error(existing.error.message ?? "No se pudo buscar la materia.");
  }

  if (existing.data) {
    return existing.data as { id: number; name: string };
  }

  const inserted = await supabase
    .from("subjects")
    .insert({ name, is_active: true })
    .select("id, name")
    .single();

  if (inserted.error) {
    throw new Error(inserted.error.message ?? "No se pudo crear la materia.");
  }

  return inserted.data as { id: number; name: string };
}

async function ensureAcademicTerm(supabase: AdminSupabaseClient, name: string, year: number) {
  const existing = await supabase
    .from("academic_terms")
    .select("id, name, year")
    .eq("name", name)
    .eq("year", year)
    .maybeSingle();

  if (existing.error && existing.error.code !== "PGRST116") {
    throw new Error(existing.error.message ?? "No se pudo buscar el período académico.");
  }

  if (existing.data) {
    return existing.data as { id: number; name: string; year: number };
  }

  const inserted = await supabase
    .from("academic_terms")
    .insert({ name, year, is_active: true })
    .select("id, name, year")
    .single();

  if (inserted.error) {
    throw new Error(inserted.error.message ?? "No se pudo crear el período académico.");
  }

  return inserted.data as { id: number; name: string; year: number };
}

async function getParticipants(supabase: AdminSupabaseClient) {
  const [teachersQuery, studentsQuery] = await Promise.all([
    supabase
      .from("teachers")
      .select("profile_id, teacher_code, profiles!inner ( id, first_name, last_name, dni, email, is_active )")
      .eq("profiles.is_active", true),
    supabase
      .from("students")
      .select("profile_id, student_code, current_status, profiles!inner ( id, first_name, last_name, dni, email, is_active )")
      .eq("current_status", "activo")
      .eq("profiles.is_active", true),
  ]);

  if (teachersQuery.error) {
    throw new Error(teachersQuery.error.message ?? "No se pudieron obtener los docentes.");
  }

  if (studentsQuery.error) {
    throw new Error(studentsQuery.error.message ?? "No se pudieron obtener los alumnos.");
  }

  const teachers = ((teachersQuery.data ?? []) as Array<{
    profile_id: string;
    teacher_code: string;
    profiles: { first_name: string; last_name: string; dni: string; email: string | null; is_active: boolean } | Array<{ first_name: string; last_name: string; dni: string; email: string | null; is_active: boolean }> | null;
  }>).map((teacher) => {
    const profile = Array.isArray(teacher.profiles) ? teacher.profiles[0] : teacher.profiles;

    return {
      profileId: teacher.profile_id,
      fullName: profile ? fullName(profile) : "Docente",
      dni: profile?.dni ?? "",
      email: profile?.email ?? null,
      code: teacher.teacher_code,
    };
  });

  const students = ((studentsQuery.data ?? []) as Array<{
    profile_id: string;
    student_code: string;
    current_status: string;
    profiles: { first_name: string; last_name: string; dni: string; email: string | null; is_active: boolean } | Array<{ first_name: string; last_name: string; dni: string; email: string | null; is_active: boolean }> | null;
  }>).map((student) => {
    const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;

    return {
      profileId: student.profile_id,
      fullName: profile ? fullName(profile) : "Alumno",
      dni: profile?.dni ?? "",
      email: profile?.email ?? null,
      code: student.student_code,
    };
  });

  return { teachers, students };
}

async function getCourses(supabase: AdminSupabaseClient) {
  const [coursesQuery, enrollmentsQuery, participants] = await Promise.all([
    supabase
      .from("courses")
      .select("id, subject_id, academic_term_id, teacher_profile_id, name, commission, classroom, schedule_summary, status, created_at, subjects ( name ), academic_terms ( name, year )")
      .order("created_at", { ascending: false }),
    supabase.from("course_enrollments").select("course_id, student_profile_id, enrollment_status"),
    getParticipants(supabase),
  ]);

  if (coursesQuery.error) {
    throw new Error(coursesQuery.error.message ?? "No se pudieron obtener los cursos.");
  }

  if (enrollmentsQuery.error) {
    throw new Error(enrollmentsQuery.error.message ?? "No se pudieron obtener las asignaciones de alumnos.");
  }

  const teacherNames = new Map(participants.teachers.map((teacher) => [teacher.profileId, teacher.fullName]));
  const activeStudentIds = new Set(participants.students.map((student) => student.profileId));
  const studentsByCourse = new Map<number, string[]>();

  for (const enrollment of (enrollmentsQuery.data ?? []) as Array<{ course_id: number; student_profile_id: string; enrollment_status: string }>) {
    if (enrollment.enrollment_status !== "activa" || !activeStudentIds.has(enrollment.student_profile_id)) {
      continue;
    }

    const current = studentsByCourse.get(enrollment.course_id) ?? [];
    current.push(enrollment.student_profile_id);
    studentsByCourse.set(enrollment.course_id, current);
  }

  const courses = ((coursesQuery.data ?? []) as Array<{
    id: number;
    teacher_profile_id: string | null;
    name: string;
    commission: string | null;
    classroom: string | null;
    schedule_summary: string | null;
    status: CourseStatus;
    created_at: string;
    subjects: { name: string } | Array<{ name: string }> | null;
    academic_terms: { name: string; year: number } | Array<{ name: string; year: number }> | null;
  }>).map((course) => {
    const subject = Array.isArray(course.subjects) ? course.subjects[0] : course.subjects;
    const term = Array.isArray(course.academic_terms) ? course.academic_terms[0] : course.academic_terms;
    const studentProfileIds = studentsByCourse.get(course.id) ?? [];

    return {
      id: course.id,
      name: course.name,
      subjectName: subject?.name ?? course.name,
      academicTermName: term?.name ?? "Sin período",
      academicTermYear: term?.year ?? new Date().getFullYear(),
      teacherProfileId: course.teacher_profile_id,
      teacherName: course.teacher_profile_id ? teacherNames.get(course.teacher_profile_id) ?? null : null,
      studentCount: studentProfileIds.length,
      studentProfileIds,
      classroom: course.classroom,
      scheduleSummary: course.schedule_summary,
      commission: course.commission,
      status: course.status,
      createdAt: course.created_at,
    };
  });

  return { courses, ...participants };
}

export async function GET() {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  try {
    return NextResponse.json(await getCourses(access.supabase));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron obtener los cursos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Payload inválido para crear curso." }, { status: 400 });
  }

  const subjectName = normalizeRequiredText(body.subjectName);
  const termName = normalizeRequiredText(body.academicTermName);
  const termYear = parseYear(body.academicTermYear) as number;
  const studentProfileIds = Array.from(new Set(body.studentProfileIds ?? []));
  const teacherProfileId = normalizeOptionalText(body.teacherProfileId);

  try {
    const [subject, academicTerm] = await Promise.all([
      ensureSubject(access.supabase, subjectName),
      ensureAcademicTerm(access.supabase, termName, termYear),
    ]);

    const insertedCourse = await access.supabase
      .from("courses")
      .insert({
        subject_id: subject.id,
        academic_term_id: academicTerm.id,
        teacher_profile_id: teacherProfileId,
        name: normalizeRequiredText(body.name),
        commission: normalizeOptionalText(body.commission),
        classroom: normalizeOptionalText(body.classroom),
        schedule_summary: normalizeOptionalText(body.scheduleSummary),
        status: body.status ?? "activa",
      })
      .select("id")
      .single();

    if (insertedCourse.error) {
      throw new Error(insertedCourse.error.message ?? "No se pudo crear el curso.");
    }

    const courseId = Number(insertedCourse.data.id);

    if (teacherProfileId) {
      const teacherLink = await access.supabase
        .from("course_teachers")
        .insert({ course_id: courseId, teacher_profile_id: teacherProfileId, role_in_course: "titular" });

      if (teacherLink.error && teacherLink.error.code !== "23505") {
        throw new Error(teacherLink.error.message ?? "No se pudo asignar el docente al curso.");
      }
    }

    if (studentProfileIds.length > 0) {
      const enrollment = await access.supabase.from("course_enrollments").insert(
        studentProfileIds.map((studentProfileId) => ({
          course_id: courseId,
          student_profile_id: studentProfileId,
          enrollment_status: "activa",
        })),
      );

      if (enrollment.error && enrollment.error.code !== "23505") {
        throw new Error(enrollment.error.message ?? "No se pudieron asignar los alumnos al curso.");
      }
    }

    const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);
    await insertAuditLog({
      supabase: access.supabase,
      actorProfileId: actorProfile?.id ?? null,
      entityName: "courses",
      entityId: String(courseId),
      action: "course_created",
      newData: { teacherProfileId, studentProfileIds },
    });

    return NextResponse.json(await getCourses(access.supabase));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el curso." },
      { status: 500 },
    );
  }
}


export async function PATCH(request: Request) {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const body = await request.json().catch(() => null);
  const courseId = body && typeof body === "object" ? Number((body as Record<string, unknown>).id) : NaN;

  if (!Number.isInteger(courseId) || !isValidPayload(body)) {
    return NextResponse.json({ error: "Payload inválido para actualizar curso." }, { status: 400 });
  }

  const payload = body as CoursePayload;
  const subjectName = normalizeRequiredText(payload.subjectName);
  const termName = normalizeRequiredText(payload.academicTermName);
  const termYear = parseYear(payload.academicTermYear) as number;
  const studentProfileIds = Array.from(new Set(payload.studentProfileIds ?? []));
  const teacherProfileId = normalizeOptionalText(payload.teacherProfileId);

  try {
    const [subject, academicTerm] = await Promise.all([
      ensureSubject(access.supabase, subjectName),
      ensureAcademicTerm(access.supabase, termName, termYear),
    ]);

    const updateCourse = await access.supabase
      .from("courses")
      .update({
        subject_id: subject.id,
        academic_term_id: academicTerm.id,
        teacher_profile_id: teacherProfileId,
        name: normalizeRequiredText(payload.name),
        commission: normalizeOptionalText(payload.commission),
        classroom: normalizeOptionalText(payload.classroom),
        schedule_summary: normalizeOptionalText(payload.scheduleSummary),
        status: payload.status ?? "activa",
      })
      .eq("id", courseId);

    if (updateCourse.error) {
      throw new Error(updateCourse.error.message ?? "No se pudo actualizar el curso.");
    }

    const deleteTeacherLinks = await access.supabase.from("course_teachers").delete().eq("course_id", courseId);

    if (deleteTeacherLinks.error) {
      throw new Error(deleteTeacherLinks.error.message ?? "No se pudo actualizar el docente del curso.");
    }

    if (teacherProfileId) {
      const teacherLink = await access.supabase
        .from("course_teachers")
        .insert({ course_id: courseId, teacher_profile_id: teacherProfileId, role_in_course: "titular" });

      if (teacherLink.error && teacherLink.error.code !== "23505") {
        throw new Error(teacherLink.error.message ?? "No se pudo asignar el docente al curso.");
      }
    }

    const deleteEnrollments = await access.supabase.from("course_enrollments").delete().eq("course_id", courseId);

    if (deleteEnrollments.error) {
      throw new Error(deleteEnrollments.error.message ?? "No se pudieron actualizar los alumnos del curso.");
    }

    if (studentProfileIds.length > 0) {
      const enrollment = await access.supabase.from("course_enrollments").insert(
        studentProfileIds.map((studentProfileId) => ({
          course_id: courseId,
          student_profile_id: studentProfileId,
          enrollment_status: "activa",
        })),
      );

      if (enrollment.error && enrollment.error.code !== "23505") {
        throw new Error(enrollment.error.message ?? "No se pudieron asignar los alumnos al curso.");
      }
    }

    const actorProfile = await getProfileByAuthUserId(access.supabase, access.user.id);
    await insertAuditLog({
      supabase: access.supabase,
      actorProfileId: actorProfile?.id ?? null,
      entityName: "courses",
      entityId: String(courseId),
      action: "course_updated",
      newData: { teacherProfileId, studentProfileIds },
    });

    return NextResponse.json(await getCourses(access.supabase));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el curso." },
      { status: 500 },
    );
  }
}
