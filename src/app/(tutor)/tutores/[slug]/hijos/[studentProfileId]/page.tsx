import { notFound } from "next/navigation";
import { Card, Stack, Title } from "@mantine/core";

import { PageHeader } from "@/components/molecules";
import TutorStudentCoursesTable from "@/features/tutor/TutorStudentCoursesTable";
import {
  formatTutorHomePath,
  formatTutorSectionPath,
  formatTutorStudentPath,
  getTutorStudentCourses,
  requireTutorRouteContext,
} from "@/lib/tutorDashboard";

type TutorStudentPageProps = {
  params: Promise<{ slug: string; studentProfileId: string }>;
};

export default async function TutorStudentPage({ params }: TutorStudentPageProps) {
  const { slug, studentProfileId } = await params;
  const [context, result] = await Promise.all([
    requireTutorRouteContext(slug),
    getTutorStudentCourses(slug, studentProfileId),
  ]);

  if (!result.student) notFound();

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTutorHomePath(context.slug) },
          { label: "Hijos", href: formatTutorSectionPath(context.slug, "hijos") },
          { label: result.student.full_name, href: formatTutorStudentPath(context.slug, result.student.profile_id) },
        ]}
        title={result.student.full_name}
        description="Cursos activos del alumno con acceso de lectura a notas, asistencias, materiales y comentarios al docente."
      />

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <Title order={3} c="brand.7">Cursos</Title>
          <TutorStudentCoursesTable
            courses={result.courses}
            slug={context.slug}
            studentProfileId={result.student.profile_id}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
