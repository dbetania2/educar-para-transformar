import { notFound } from "next/navigation";
import { Card, Stack } from "@mantine/core";

import { CTAButton } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import TeacherCourseGradesManager from "@/features/docente/TeacherCourseGradesManager";
import {
  formatTeacherCoursePath,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  getTeacherCourseAssessments,
  getTeacherCourseStudents,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherCourseGradesPageProps = { params: Promise<{ slug: string; courseId: string }> };

export default async function TeacherCourseGradesPage({ params }: TeacherCourseGradesPageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);
  if (!Number.isInteger(parsedCourseId)) notFound();

  const [context, result, studentsResult] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherCourseAssessments(slug, parsedCourseId),
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
          { label: "Calificaciones" },
        ]}
        title={`Calificaciones de ${result.course.course_name}`}
        description="Creá evaluaciones y cargá calificaciones por alumno."
        action={
          <CTAButton href={formatTeacherCoursePath(context.slug, result.course.id)} ctaVariant="secondary" size="md">
            ← Volver al curso
          </CTAButton>
        }
      />
      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <TeacherCourseGradesManager courseId={result.course.id} assessments={result.assessments} students={studentsResult.students} />
        </Stack>
      </Card>
    </Stack>
  );
}
