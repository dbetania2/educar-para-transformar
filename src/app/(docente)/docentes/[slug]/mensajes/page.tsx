import { Stack, Title } from "@mantine/core";

import { PageHeader } from "@/components/molecules";
import TeacherMessagesTable from "@/features/docente/TeacherMessagesTable";
import {
  formatTeacherHomePath,
  formatTeacherSectionPath,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";
import { getTeacherMessages } from "@/lib/tutorDashboard";

type TeacherMessagesPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TeacherMessagesPage({ params }: TeacherMessagesPageProps) {
  const { slug } = await params;
  const [context, messages] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherMessages(slug),
  ]);

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Mensajes", href: formatTeacherSectionPath(context.slug, "mensajes") },
        ]}
        title="Mensajes de tutores"
        description="Comentarios enviados por tutores desde la bitácora de sus hijos."
      />

      <Stack gap="md">
        <Title order={3} c="brand.7">Bandeja</Title>
        <TeacherMessagesTable messages={messages} />
      </Stack>
    </Stack>
  );
}
