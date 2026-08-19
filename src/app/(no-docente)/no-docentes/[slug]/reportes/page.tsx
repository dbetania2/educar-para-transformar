import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconChartBar, IconMail, IconUsersGroup } from "@tabler/icons-react";

import NoDocenteReportPdfButton from "@/features/no-docente/NoDocenteReportPdfButton";
import NoDocenteReportsTable, { type NoDocenteReportRow } from "@/features/no-docente/NoDocenteReportsTable";
import { CTAButton } from "@/components/atoms";
import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import {
  formatNoDocenteHomePath,
  getNoDocenteContactMessages,
  getNoDocenteOverview,
  getNoDocenteRequests,
  getNoDocenteStudents,
  getNoDocenteTasks,
  requireNoDocenteRouteContext,
} from "@/lib/noDocenteDashboard";

type NoDocenteReportsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NoDocenteReportsPage({ params }: NoDocenteReportsPageProps) {
  const { slug } = await params;
  const [context, overview, students, tasks, requests, contactMessages] = await Promise.all([
    requireNoDocenteRouteContext(slug),
    getNoDocenteOverview(slug),
    getNoDocenteStudents(slug),
    getNoDocenteTasks(slug),
    getNoDocenteRequests(slug),
    getNoDocenteContactMessages(slug),
  ]);

  const rows: NoDocenteReportRow[] = [
    { key: "students", metric: "Alumnos activos", value: overview.activeStudents, detail: "Legajos de alumnos con estado activo.", tone: "green", detailType: "students" },
    { key: "tutors", metric: "Tutores activos", value: overview.activeTutors, detail: "Perfiles activos con rol tutor.", tone: "blue", detailType: "summary" },
    { key: "teachers", metric: "Docentes activos", value: overview.activeTeachers, detail: "Docentes con perfil activo.", tone: "blue", detailType: "summary" },
    { key: "admins", metric: "Administradores activos", value: overview.activeAdmins, detail: "Roles admin o administrativo activos.", tone: "gray", detailType: "summary" },
    { key: "no-docentes", metric: "No docentes activos", value: overview.activeNoDocentes, detail: "Perfiles activos con rol no docente.", tone: "gray", detailType: "summary" },
    { key: "pending-requests", metric: "Solicitudes pendientes", value: overview.pendingRequests, detail: "Preinscripciones esperando revisión.", tone: "yellow", detailType: "requests_pending" },
    { key: "review-requests", metric: "Solicitudes en revisión", value: overview.reviewRequests, detail: "Casos tomados por administración.", tone: "yellow", detailType: "requests_review" },
    { key: "tasks", metric: "Tareas administrativas abiertas", value: overview.pendingTasks, detail: "Tareas pendientes o en proceso.", tone: "yellow", detailType: "tasks" },
    { key: "incomplete", metric: "Legajos incompletos", value: overview.incompleteProfiles, detail: "Alumnos activos sin email o teléfono.", tone: "yellow", detailType: "incomplete_students" },
    { key: "messages", metric: "Mensajes de contacto", value: overview.contactMessages, detail: "Consultas recibidas desde contacto.", tone: "blue", detailType: "messages" },
  ];

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatNoDocenteHomePath(context.slug) },
        { label: "Reportes" },
      ]}
      title="Reportes operativos"
      description="Indicadores calculados desde los registros activos del sistema."
      highlights={[
        { label: "Alumnos activos", value: String(overview.activeStudents), description: "Base actual de alumnos activos.", icon: IconUsersGroup },
        { label: "Mensajes", value: String(overview.contactMessages), description: "Mensajes reales recibidos desde contacto.", icon: IconMail },
        { label: "Pendientes", value: String(overview.pendingRequests + overview.reviewRequests + overview.pendingTasks), description: "Solicitudes y tareas reales abiertas.", icon: IconChartBar },
      ]}
      sections={[]}
    >
      <Group gap="sm">
        <CTAButton href={formatNoDocenteHomePath(context.slug)} ctaVariant="secondary" size="md" w="fit-content">
          ← Volver al campus
        </CTAButton>
        <NoDocenteReportPdfButton
          rows={rows}
          students={students}
          tasks={tasks}
          requests={requests}
          contactMessages={contactMessages}
          generatedBy={context.displayName}
        />
      </Group>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <div>
            <Title order={3} c="brand.7">Indicadores actuales</Title>
            <Text size="sm" c="dimmed" mt={4}>Conteos calculados desde la base activa.</Text>
          </div>
          <NoDocenteReportsTable rows={rows} students={students} tasks={tasks} requests={requests} contactMessages={contactMessages} />
        </Stack>
      </Card>
    </StudentSectionTemplate>
  );
}
