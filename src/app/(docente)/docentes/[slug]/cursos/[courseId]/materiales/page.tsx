import { notFound } from "next/navigation";
import { Card, Stack } from "@mantine/core";

import { CTAButton } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import TeacherCourseMaterialsManager from "@/features/docente/TeacherCourseMaterialsManager";
import {
  formatTeacherCoursePath,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  getTeacherCourseMaterials,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherCourseMaterialsPageProps = { params: Promise<{ slug: string; courseId: string }> };

export default async function TeacherCourseMaterialsPage({ params }: TeacherCourseMaterialsPageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);
  if (!Number.isInteger(parsedCourseId)) notFound();

  const [context, result] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherCourseMaterials(slug, parsedCourseId),
  ]);
  if (!result.course) notFound();

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Cursos", href: formatTeacherSectionPath(context.slug, "cursos") },
          { label: result.course.course_name, href: formatTeacherCoursePath(context.slug, result.course.id) },
          { label: "Materiales" },
        ]}
        title={`Materiales de ${result.course.course_name}`}
        description="Publicá recursos, enlaces y guías para el curso."
        action={
          <CTAButton href={formatTeacherCoursePath(context.slug, result.course.id)} ctaVariant="secondary" size="md">
            ← Volver al curso
          </CTAButton>
        }
      />
      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <TeacherCourseMaterialsManager courseId={result.course.id} materials={result.materials} />
        </Stack>
      </Card>
    </Stack>
  );
}
