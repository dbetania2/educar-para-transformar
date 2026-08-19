import { Stack, Text, Title } from "@mantine/core";
import { IconClock, IconMail, IconMessages } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import NoDocenteMessagesFeed from "@/features/no-docente/NoDocenteMessagesFeed";
import {
  formatNoDocenteHomePath,
  getNoDocenteContactMessages,
  requireNoDocenteRouteContext,
} from "@/lib/noDocenteDashboard";

type NoDocenteMessagesPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string | null) {
  if (!value) return "Sin mensajes";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default async function NoDocenteMessagesPage({ params }: NoDocenteMessagesPageProps) {
  const { slug } = await params;
  const [context, contactMessages] = await Promise.all([
    requireNoDocenteRouteContext(slug),
    getNoDocenteContactMessages(slug),
  ]);
  const sortedMessages = [...contactMessages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latestMessage = sortedMessages[0] ?? null;
  const uniqueSenders = new Set(sortedMessages.map((message) => message.email.toLowerCase())).size;

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatNoDocenteHomePath(context.slug) },
        { label: "Mensajes" },
      ]}
      title="Mensajes"
      description="Consultas recibidas desde contacto, ordenadas desde la más reciente."
      highlights={[
        { label: "Mensajes", value: String(sortedMessages.length), description: "Total de consultas recibidas.", icon: IconMessages },
        { label: "Remitentes", value: String(uniqueSenders), description: "Correos únicos dentro del feed.", icon: IconMail },
        { label: "Último mensaje", value: formatDate(latestMessage?.created_at ?? null), description: latestMessage?.full_name ?? "Sin actividad registrada.", icon: IconClock },
      ]}
      sections={[]}
    >
      <CTAButton href={formatNoDocenteHomePath(context.slug)} ctaVariant="secondary" size="md" w="fit-content">
        ← Volver al campus
      </CTAButton>

      <Stack gap="md">
        <div>
          <Title order={3} c="brand.7">Bandeja de mensajes</Title>
          <Text size="sm" c="dimmed" mt={4}>El mensaje más actual aparece primero.</Text>
        </div>
        <NoDocenteMessagesFeed messages={sortedMessages} />
      </Stack>
    </StudentSectionTemplate>
  );
}
