import { Card, Stack, Text, Title } from "@mantine/core";
import { IconFileCheck, IconId, IconUsersGroup } from "@tabler/icons-react";

import NoDocenteStudentsTable from "@/features/no-docente/NoDocenteStudentsTable";
import { CTAButton } from "@/components/atoms";
import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import {
  formatNoDocenteHomePath,
  getNoDocenteOverview,
  getNoDocenteStudents,
  requireNoDocenteRouteContext,
} from "@/lib/noDocenteDashboard";

type NoDocenteRecordsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NoDocenteRecordsPage({ params }: NoDocenteRecordsPageProps) {
  const { slug } = await params;
  const [context, overview, students] = await Promise.all([
    requireNoDocenteRouteContext(slug),
    getNoDocenteOverview(slug),
    getNoDocenteStudents(slug),
  ]);
  const incompleteStudents = students.filter((student) => !student.email || !student.phone);

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatNoDocenteHomePath(context.slug) },
        { label: "Legajos" },
      ]}
      title="Legajos de alumnos"
      description="Vista operativa para detectar datos incompletos y revisar el estado administrativo de alumnos."
      highlights={[
        { label: "Alumnos activos", value: String(overview.activeStudents), description: "Total de alumnos con estado activo.", icon: IconUsersGroup },
        { label: "Legajos visibles", value: String(students.length), description: "Primeros registros ordenados por legajo.", icon: IconId },
        { label: "Datos incompletos", value: String(incompleteStudents.length), description: "Alumnos sin email o teléfono en el perfil.", icon: IconFileCheck },
      ]}
      sections={[]}
    >
      <CTAButton href={formatNoDocenteHomePath(context.slug)} ctaVariant="secondary" size="md" w="fit-content">
        ← Volver al campus
      </CTAButton>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <div>
            <Title order={3} c="brand.7">Legajos activos</Title>
            <Text size="sm" c="dimmed" mt={4}>Alumnos activos registrados actualmente en el sistema.</Text>
          </div>
          <NoDocenteStudentsTable students={students} />
        </Stack>
      </Card>
    </StudentSectionTemplate>
  );
}
