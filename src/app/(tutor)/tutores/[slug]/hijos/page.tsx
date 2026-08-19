import { Card, Stack, Title } from "@mantine/core";

import { PageHeader } from "@/components/molecules";
import TutorStudentsTable from "@/features/tutor/TutorStudentsTable";
import {
  formatTutorHomePath,
  formatTutorSectionPath,
  getTutorStudents,
  requireTutorRouteContext,
} from "@/lib/tutorDashboard";

type TutorStudentsPageProps = {
  params: Promise<{ slug: string }>;
};


export default async function TutorStudentsPage({ params }: TutorStudentsPageProps) {
  const { slug } = await params;
  const [context, students] = await Promise.all([
    requireTutorRouteContext(slug),
    getTutorStudents(slug),
  ]);

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTutorHomePath(context.slug) },
          { label: "Hijos", href: formatTutorSectionPath(context.slug, "hijos") },
        ]}
        title="Hijos vinculados"
        description="Listado de alumnos asociados al perfil del tutor. Desde cada alumno se accede a sus cursos y bitácoras."
      />

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <Title order={3} c="brand.7">Alumnos</Title>
          <TutorStudentsTable students={students} slug={context.slug} />
        </Stack>
      </Card>
    </Stack>
  );
}
