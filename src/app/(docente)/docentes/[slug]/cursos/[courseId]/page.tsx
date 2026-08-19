import { notFound } from "next/navigation";
import {
  Card,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { PageHeader } from "@/components/molecules";
import TeacherCourseActionsMenu from "@/features/docente/TeacherCourseActionsMenu";
import TeacherCourseStudentsTable, { type TeacherCourseStudentRow } from "@/features/docente/TeacherCourseStudentsTable";
import {
  formatTeacherCourseSectionPath,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  getTeacherCourse,
  getTeacherCourseAttendance,
  getTeacherCourseStudents,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherCourseDetailPageProps = {
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
};

type CourseStudentAttendanceState = {
  status: "presente" | "ausente" | "justificada" | "tarde" | "sin_registro";
  date: string | null;
};

export default async function TeacherCourseDetailPage({
  params,
}: TeacherCourseDetailPageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId)) {
    notFound();
  }

  const [context, course, studentsResult, attendanceResult] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherCourse(slug, parsedCourseId),
    getTeacherCourseStudents(slug, parsedCourseId),
    getTeacherCourseAttendance(slug, parsedCourseId),
  ]);

  if (!course) {
    notFound();
  }

  const coursePath = `${formatTeacherSectionPath(context.slug, "cursos")}/${course.id}`;
  const gradesPath = formatTeacherCourseSectionPath(context.slug, course.id, "calificaciones");
  const attendancePath = formatTeacherCourseSectionPath(context.slug, course.id, "asistencias");
  const materialsPath = formatTeacherCourseSectionPath(context.slug, course.id, "materiales");

  const latestAttendanceByStudent = new Map<string, CourseStudentAttendanceState>(
    studentsResult.students.map((student) => [student.profile_id, { status: "sin_registro", date: null }]),
  );

  for (const session of attendanceResult.sessions) {
    for (const record of session.records) {
      if (latestAttendanceByStudent.get(record.student_profile_id)?.date) {
        continue;
      }

      latestAttendanceByStudent.set(record.student_profile_id, {
        status: record.status,
        date: session.session_date,
      });
    }
  }


  const studentRows: TeacherCourseStudentRow[] = studentsResult.students.map((student) => ({
    profileId: student.profile_id,
    fullName: student.full_name,
    dni: student.dni,
    email: student.email,
    studentCode: student.student_code,
    latestAttendance: latestAttendanceByStudent.get(student.profile_id) ?? { status: "sin_registro", date: null },
  }));

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Cursos", href: formatTeacherSectionPath(context.slug, "cursos") },
          { label: course.course_name },
        ]}
        title={course.course_name}
        description="Panel operativo del curso para revisar alumnos, calificaciones, asistencias y materiales vinculados."
        action={
          <TeacherCourseActionsMenu
            gradesHref={gradesPath}
            attendanceHref={attendancePath}
            materialsHref={materialsPath}
            coursesHref={formatTeacherSectionPath(context.slug, "cursos")}
          />
        }
      />

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <div>
            <Title order={3} c="brand.7">Información operativa</Title>
            <Text size="sm" c="dimmed" mt={4}>Datos actuales vinculados al curso.</Text>
          </div>
          <Stack gap="xs">
            <Text>Materia: {course.subject_name ?? course.course_name}</Text>
            <Text>Período: {course.academic_period ?? "Sin período informado"}</Text>
            <Text>Horario: {course.schedule_summary ?? "Sin horario cargado"}</Text>
            <Text>Aula: {course.classroom ? `Aula ${course.classroom}` : "Sin aula informada"}</Text>
          </Stack>
        </Stack>
      </Card>

      <TeacherCourseStudentsTable students={studentRows} coursePath={coursePath} />
    </Stack>
  );
}
