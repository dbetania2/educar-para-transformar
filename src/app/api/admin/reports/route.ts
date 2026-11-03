import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import { listAllAuthUsers } from "@/lib/auth/authUsers";
import {
  getSportDefinitionByName,
  resolveStudentExtracurricular,
} from "@/lib/extracurricular";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  extractCourseDivision,
  inferEducationalLevel,
} from "@/features/admin/reports/constants";
import type {
  AdminReportsPayload,
  EducationalLevel,
  StudentByCourseReportRow,
  StudentBySportReportRow,
  StudentBySubjectReportRow,
  StudentByTransportReportRow,
  TeacherByLevelReportRow,
} from "@/features/admin/reports/types";

type AdminSupabaseClient = ReturnType<typeof createAdminClient>;

type RawProfile = {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  dni: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
};

function formatAlphabeticalName(firstName: string, lastName: string) {
  const cleanLast = lastName.trim();
  const cleanFirst = firstName.trim();
  if (cleanLast && cleanFirst) {
    return `${cleanLast}, ${cleanFirst}`;
  }
  return cleanLast || cleanFirst || "Sin nombre";
}

function compareAlphabetical(
  a: { lastName: string; firstName: string },
  b: { lastName: string; firstName: string },
) {
  const byLast = a.lastName.localeCompare(b.lastName, "es", { sensitivity: "base" });
  if (byLast !== 0) return byLast;
  return a.firstName.localeCompare(b.firstName, "es", { sensitivity: "base" });
}

async function buildAdminReports(supabase: AdminSupabaseClient): Promise<AdminReportsPayload> {
  const [studentsRes, teachersRes, coursesRes, enrollmentsRes, subjectsRes, authUsers] =
    await Promise.all([
      supabase
        .from("students")
        .select(
          "profile_id, student_code, current_status, profiles!inner ( id, auth_user_id, first_name, last_name, dni, email, phone, is_active )",
        )
        .eq("profiles.is_active", true),
      supabase
        .from("teachers")
        .select(
          "profile_id, teacher_code, title, profiles!inner ( id, auth_user_id, first_name, last_name, dni, email, phone, is_active )",
        )
        .eq("profiles.is_active", true),
      supabase
        .from("courses")
        .select(
          "id, subject_id, teacher_profile_id, name, commission, classroom, schedule_summary, status, subjects ( name )",
        )
        .eq("status", "activa"),
      supabase
        .from("course_enrollments")
        .select("course_id, student_profile_id, enrollment_status")
        .eq("enrollment_status", "activa"),
      supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
      listAllAuthUsers(supabase),
    ]);

  if (studentsRes.error) throw new Error(studentsRes.error.message ?? "No se pudieron obtener los legajos de alumnos.");
  if (teachersRes.error) throw new Error(teachersRes.error.message ?? "No se pudieron obtener los perfiles docentes.");
  if (coursesRes.error) throw new Error(coursesRes.error.message ?? "No se pudieron obtener los cursos activos.");
  if (enrollmentsRes.error) throw new Error(enrollmentsRes.error.message ?? "No se pudieron obtener las matrículas.");

  const authUsersById = new Map(authUsers.map((user) => [user.id, user]));

  const teachersById = new Map<
    string,
    {
      profileId: string;
      teacherCode: string;
      specialty: string;
      firstName: string;
      lastName: string;
      fullName: string;
      dni: string;
      email: string | null;
      phone: string | null;
    }
  >();

  for (const row of (teachersRes.data ?? []) as Array<{
    profile_id: string;
    teacher_code: string | null;
    title: string | null;
    profiles: RawProfile | RawProfile[] | null;
  }>) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    if (!profile) continue;
    teachersById.set(row.profile_id, {
      profileId: row.profile_id,
      teacherCode: row.teacher_code ?? "S/L",
      specialty: row.title?.trim() || "Docente General",
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: formatAlphabeticalName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      phone: profile.phone,
    });
  }

  const teachersList = Array.from(teachersById.values());
  const studentsById = new Map<
    string,
    {
      profileId: string;
      studentCode: string;
      status: string;
      firstName: string;
      lastName: string;
      fullName: string;
      dni: string;
      email: string | null;
      phone: string | null;
      sports: Array<{ name: string; schedule: string; teacherName: string }>;
      transportRoute: string;
      diningService: string;
    }
  >();

  for (const row of (studentsRes.data ?? []) as Array<{
    profile_id: string;
    student_code: string;
    current_status: string;
    profiles: RawProfile | RawProfile[] | null;
  }>) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    if (!profile || row.current_status !== "activo") continue;

    const authUser = profile.auth_user_id ? authUsersById.get(profile.auth_user_id) ?? null : null;
    const extracurricular = resolveStudentExtracurricular({
      studentCode: row.student_code,
      userMetadata: (authUser?.user_metadata as Record<string, unknown> | undefined) ?? null,
    });

    const sportsWithTeachers = extracurricular.sports.map((sport) => {
      const def = getSportDefinitionByName(sport.name);
      const teacherIndex = def ? def.defaultTeacherIndex : 0;
      const assignedTeacher =
        teachersList.length > 0
          ? teachersList[teacherIndex % teachersList.length].fullName
          : "Prof. Educación Física";
      return { name: sport.name, schedule: sport.schedule, teacherName: assignedTeacher };
    });

    studentsById.set(row.profile_id, {
      profileId: row.profile_id,
      studentCode: row.student_code,
      status: row.current_status,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: formatAlphabeticalName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      phone: profile.phone,
      sports: sportsWithTeachers,
      transportRoute: extracurricular.transportRoute,
      diningService: extracurricular.diningService,
    });
  }

  const enrollmentsByCourse = new Map<number, string[]>();
  for (const enrollment of (enrollmentsRes.data ?? []) as Array<{
    course_id: number;
    student_profile_id: string;
    enrollment_status: string;
  }>) {
    if (!studentsById.has(enrollment.student_profile_id)) continue;
    const list = enrollmentsByCourse.get(enrollment.course_id) ?? [];
    list.push(enrollment.student_profile_id);
    enrollmentsByCourse.set(enrollment.course_id, list);
  }

  const normalizedCourses = ((coursesRes.data ?? []) as Array<{
    id: number;
    teacher_profile_id: string | null;
    name: string;
    commission: string | null;
    classroom: string | null;
    schedule_summary: string | null;
    status: string;
    subjects: { name: string } | Array<{ name: string }> | null;
  }>).map((course) => {
    const subjectObj = Array.isArray(course.subjects) ? course.subjects[0] : course.subjects;
    const subjectName = subjectObj?.name ?? course.name;
    const level = inferEducationalLevel(course.name, course.commission, subjectName);
    const courseDivision = extractCourseDivision(course.name, course.commission);
    const teacher = course.teacher_profile_id ? teachersById.get(course.teacher_profile_id) ?? null : null;
    const studentIds = enrollmentsByCourse.get(course.id) ?? [];

    return {
      id: course.id,
      name: course.name,
      subjectName,
      level,
      courseDivision,
      commission: course.commission ?? courseDivision,
      classroom: course.classroom,
      scheduleSummary: course.schedule_summary,
      teacher,
      studentIds,
    };
  });

  // 1. Reporte REQ-ADM-07: Listado de Alumnos por Curso (consolidado por alumno + división)
  const studentDivisionMap = new Map<string, StudentByCourseReportRow>();
  // 2. Reporte REQ-ADM-08: Listado de Alumnos por Materia
  const studentsBySubject: StudentBySubjectReportRow[] = [];

  for (const course of normalizedCourses) {
    const teacherName = course.teacher ? course.teacher.fullName : "Sin docente asignado";
    const teacherCode = course.teacher ? course.teacher.teacherCode : null;

    for (const studentId of course.studentIds) {
      const student = studentsById.get(studentId);
      if (!student) continue;

      studentsBySubject.push({
        id: `${course.id}-${student.profileId}`,
        courseId: course.id,
        level: course.level,
        courseDivision: course.courseDivision,
        subjectName: course.subjectName,
        teacherName,
        teacherCode,
        scheduleSummary: course.scheduleSummary,
        classroom: course.classroom,
        studentProfileId: student.profileId,
        studentCode: student.studentCode,
        lastName: student.lastName,
        firstName: student.firstName,
        fullName: student.fullName,
        dni: student.dni,
        email: student.email,
      });

      const divisionKey = `${course.level}::${course.courseDivision}::${student.profileId}`;
      const existing = studentDivisionMap.get(divisionKey);

      if (existing) {
        existing.enrolledSubjects.push({
          courseId: course.id,
          subjectName: course.subjectName,
          teacherName,
          schedule: course.scheduleSummary,
        });
      } else {
        studentDivisionMap.set(divisionKey, {
          id: divisionKey,
          studentProfileId: student.profileId,
          studentCode: student.studentCode,
          lastName: student.lastName,
          firstName: student.firstName,
          fullName: student.fullName,
          dni: student.dni,
          email: student.email,
          phone: student.phone,
          level: course.level,
          courseDivision: course.courseDivision,
          enrolledSubjects: [
            {
              courseId: course.id,
              subjectName: course.subjectName,
              teacherName,
              schedule: course.scheduleSummary,
            },
          ],
          sports: student.sports,
          transportRoute: student.transportRoute,
          diningService: student.diningService,
          status: student.status,
        });
      }
    }
  }

  const studentsByCourse = Array.from(studentDivisionMap.values()).sort((a, b) => {
    const byName = compareAlphabetical(a, b);
    if (byName !== 0) return byName;
    return a.courseDivision.localeCompare(b.courseDivision, "es");
  });

  // Mapa rápido del curso principal de cada alumno para los reportes de Deportes y Transporte
  const primaryCourseByStudentId = new Map<
    string,
    { level: EducationalLevel; courseDivision: string }
  >();
  for (const row of studentsByCourse) {
    if (!primaryCourseByStudentId.has(row.studentProfileId)) {
      primaryCourseByStudentId.set(row.studentProfileId, {
        level: row.level,
        courseDivision: row.courseDivision,
      });
    }
  }

  // 4. Reportes REQ-ADM-12.1 / 12.2 / 12.3: Listados de Alumnos por Deporte
  const studentsBySport: StudentBySportReportRow[] = [];
  // 5. Reporte REQ-ADM-11: Listado de Alumnos por Transporte Escolar y Comedor
  const studentsByTransport: StudentByTransportReportRow[] = [];

  for (const student of studentsById.values()) {
    const primaryCourse = primaryCourseByStudentId.get(student.profileId) ?? {
      level: "Primario" as EducationalLevel,
      courseDivision: "Sin división",
    };

    for (const sport of student.sports) {
      studentsBySport.push({
        id: `${student.profileId}::${sport.name}`,
        sportName: sport.name,
        schedule: sport.schedule,
        teacherName: sport.teacherName,
        level: primaryCourse.level,
        courseDivision: primaryCourse.courseDivision,
        studentProfileId: student.profileId,
        studentCode: student.studentCode,
        lastName: student.lastName,
        firstName: student.firstName,
        fullName: student.fullName,
        dni: student.dni,
      });
    }

    if (student.transportRoute !== "No Registrado") {
      studentsByTransport.push({
        id: `${student.profileId}::${student.transportRoute}`,
        transportRoute: student.transportRoute,
        diningService: student.diningService,
        level: primaryCourse.level,
        courseDivision: primaryCourse.courseDivision,
        studentProfileId: student.profileId,
        studentCode: student.studentCode,
        lastName: student.lastName,
        firstName: student.firstName,
        fullName: student.fullName,
        dni: student.dni,
        phone: student.phone,
        email: student.email,
      });
    }
  }

  studentsBySport.sort((a, b) => {
    const bySport = a.sportName.localeCompare(b.sportName, "es");
    if (bySport !== 0) return bySport;
    const byLevel = a.level.localeCompare(b.level, "es");
    if (byLevel !== 0) return byLevel;
    return compareAlphabetical(a, b);
  });

  studentsByTransport.sort((a, b) => {
    const byRoute = a.transportRoute.localeCompare(b.transportRoute, "es");
    if (byRoute !== 0) return byRoute;
    return compareAlphabetical(a, b);
  });

  studentsBySubject.sort((a, b) => {
    const bySubject = a.subjectName.localeCompare(b.subjectName, "es");
    if (bySubject !== 0) return bySubject;
    return compareAlphabetical(a, b);
  });

  // 3. Reporte REQ-ADM-09: Listado de Docentes por Nivel
  const teacherLevelMap = new Map<string, TeacherByLevelReportRow>();

  for (const course of normalizedCourses) {
    if (!course.teacher) continue;
    const key = `${course.teacher.profileId}::${course.level}`;
    const existing = teacherLevelMap.get(key);

    const assignmentItem = {
      courseId: course.id,
      courseName: course.name,
      subjectName: course.subjectName,
      commission: course.courseDivision,
      scheduleSummary: course.scheduleSummary,
      classroom: course.classroom,
      studentCount: course.studentIds.length,
    };

    if (existing) {
      if (!existing.subjects.includes(course.subjectName)) {
        existing.subjects.push(course.subjectName);
      }
      existing.courses.push(assignmentItem);
      existing.totalStudents += course.studentIds.length;
    } else {
      teacherLevelMap.set(key, {
        id: key,
        teacherProfileId: course.teacher.profileId,
        teacherCode: course.teacher.teacherCode,
        lastName: course.teacher.lastName,
        firstName: course.teacher.firstName,
        fullName: course.teacher.fullName,
        dni: course.teacher.dni,
        email: course.teacher.email,
        phone: course.teacher.phone,
        specialty: course.teacher.specialty,
        level: course.level,
        subjects: [course.subjectName],
        courses: [assignmentItem],
        totalStudents: course.studentIds.length,
      });
    }
  }

  const teachersByLevel = Array.from(teacherLevelMap.values()).sort((a, b) => {
    const byLevel = a.level.localeCompare(b.level, "es");
    if (byLevel !== 0) return byLevel;
    return compareAlphabetical(a, b);
  });

  const courseDivisions = Array.from(
    new Set(normalizedCourses.map((c) => c.courseDivision).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const subjects = Array.from(
    new Set([
      ...normalizedCourses.map((c) => c.subjectName),
      ...((subjectsRes.data ?? []) as Array<{ name: string }>).map((s) => s.name),
    ]),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const levels: EducationalLevel[] = ["Inicial", "Primario", "Secundario"];

  return {
    stats: {
      activeStudentsCount: studentsById.size,
      activeTeachersCount: teachersById.size,
      activeCoursesCount: normalizedCourses.length,
      activeSubjectsCount: subjects.length,
    },
    studentsByCourse,
    studentsBySubject,
    teachersByLevel,
    studentsBySport,
    studentsByTransport,
    filterOptions: {
      levels,
      courseDivisions,
      subjects,
    },
  };
}

export async function GET() {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  try {
    const payload = await buildAdminReports(access.supabase);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron generar los reportes institucionales.",
      },
      { status: 500 },
    );
  }
}

