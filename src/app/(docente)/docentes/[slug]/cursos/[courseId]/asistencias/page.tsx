import { notFound } from "next/navigation";
import { Card, Stack } from "@mantine/core";

import { CTAButton } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import TeacherCourseAttendanceManager from "@/features/docente/TeacherCourseAttendanceManager";
import {
  formatTeacherCoursePath,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  getTeacherCourseAttendance,
  getTeacherCourseStudents,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherCourseAttendancePageProps = { params: Promise<{ slug: string; courseId: string }> };

export default async function TeacherCourseAttendancePage({ params }: TeacherCourseAttendancePageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);
  if (!Number.isInteger(parsedCourseId)) notFound();

  const [context, result, studentsResult] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherCourseAttendance(slug, parsedCourseId),
    getTeacherCourseStudents(slug, parsedCourseId),
  ]);
  if (!result.course) notFound();


  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Cursos", href: formatTeacherSectionPath(context.slug, "cursos") },
          { label: result.course.course_name, href: formatTeacherCoursePath(context.slug, result.course.id) },
          { label: "Asistencias" },
        ]}
        title={`Asistencias de ${result.course.course_name}`}
        description="Creá clases y registrá asistencia por alumno."
        action={
          <CTAButton href={formatTeacherCoursePath(context.slug, result.course.id)} ctaVariant="secondary" size="md">
            ← Volver al curso
          </CTAButton>
        }
      />
      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <TeacherCourseAttendanceManager courseId={result.course.id} sessions={result.sessions} students={studentsResult.students} />
        </Stack>
      </Card>
    </Stack>
  );
}
