import { Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconChecklist, IconClipboardList } from "@tabler/icons-react";

import NoDocentePendingWorkspace from "@/features/no-docente/NoDocentePendingWorkspace";
import { CTAButton } from "@/components/atoms";
import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import {
  formatNoDocenteHomePath,
  getNoDocenteOverview,
  getNoDocenteRequests,
  getNoDocenteTasks,
  requireNoDocenteRouteContext,
} from "@/lib/noDocenteDashboard";

type NoDocentePendingPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NoDocentePendingPage({ params }: NoDocentePendingPageProps) {
  const { slug } = await params;
  const [context, overview, tasks, requests] = await Promise.all([
    requireNoDocenteRouteContext(slug),
    getNoDocenteOverview(slug),
    getNoDocenteTasks(slug),
    getNoDocenteRequests(slug),
  ]);
  const openTasks = tasks.filter((task) => task.status === "pendiente" || task.status === "en_proceso");

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatNoDocenteHomePath(context.slug) },
        { label: "Pendientes" },
      ]}
      title="Pendientes administrativos"
      description="Control diario de solicitudes y tareas reales cargadas en el sistema."
      highlights={[
        { label: "Solicitudes nuevas", value: String(overview.pendingRequests), description: "Preinscripciones esperando revisión inicial.", icon: IconAlertCircle },
        { label: "En revisión", value: String(overview.reviewRequests), description: "Casos ya tomados por administración.", icon: IconClipboardList },
        { label: "Tareas abiertas", value: String(openTasks.length), description: "Registros reales en administrative_tasks.", icon: IconChecklist },
      ]}
      sections={[]}
    >
      <CTAButton href={formatNoDocenteHomePath(context.slug)} ctaVariant="secondary" size="md" w="fit-content">
        ← Volver al campus
      </CTAButton>

      <Stack gap="md">
        <div>
          <Title order={3} c="brand.7">Bandeja de trabajo</Title>
          <Text size="sm" c="dimmed" mt={4}>Solicitudes abiertas y tareas administrativas listas para gestionar.</Text>
        </div>
        <NoDocentePendingWorkspace tasks={openTasks} requests={requests} />
      </Stack>
    </StudentSectionTemplate>
  );
}
