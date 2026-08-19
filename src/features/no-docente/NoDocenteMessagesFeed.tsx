import { Avatar, Badge, Box, Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconMail, IconPhone, IconUserCircle } from "@tabler/icons-react";

import type { NoDocenteContactMessageRecord } from "@/lib/noDocenteDashboard";

type NoDocenteMessagesFeedProps = {
  messages: NoDocenteContactMessageRecord[];
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "M";
}

export default function NoDocenteMessagesFeed({ messages }: NoDocenteMessagesFeedProps) {
  if (messages.length === 0) {
    return (
      <Card withBorder radius="md" p="lg" bg="white">
        <Group gap="md" align="flex-start" wrap="nowrap">
          <ThemeIcon size={42} radius="xl" variant="light" color="brand.7">
            <IconMail size={20} stroke={1.8} />
          </ThemeIcon>
          <Box>
            <Title order={3} c="brand.7">Sin mensajes</Title>
            <Text size="sm" c="dimmed" mt={4}>Todavía no hay consultas recibidas desde el formulario de contacto.</Text>
          </Box>
        </Group>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {messages.map((message, index) => (
        <Card key={message.id} withBorder radius="md" p={{ base: "md", sm: "lg" }} bg="white">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" gap="md">
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <Avatar radius="xl" size={44} color="brand" variant="light">
                  {getInitials(message.full_name)}
                </Avatar>
                <Box>
                  <Group gap="xs" align="center">
                    <Text fw={700}>{message.full_name}</Text>
                    {index === 0 ? <Badge variant="light" color="green" radius="xl">Más reciente</Badge> : null}
                  </Group>
                </Box>
              </Group>
              <Stack gap={4} align="flex-end">
                <Text size="xs" c="dimmed">{formatDateTime(message.created_at)}</Text>
                <Badge variant="light" color="blue" radius="xl">Contacto</Badge>
              </Stack>
            </Group>

            <Box>
              <Text fw={700} mb={4}>{message.subject}</Text>
              <Text size="md" c="neutral.8" lh={1.45} style={{ whiteSpace: "pre-line" }}>{message.message}</Text>
            </Box>

            <Group gap="md" c="dimmed">
              <Group gap={6} wrap="nowrap">
                <IconMail size={16} stroke={1.8} />
                <Text size="sm">{message.email}</Text>
              </Group>
              <Group gap={6} wrap="nowrap">
                <IconPhone size={16} stroke={1.8} />
                <Text size="sm">{message.phone}</Text>
              </Group>
              <Group gap={6} wrap="nowrap">
                <IconUserCircle size={16} stroke={1.8} />
                <Text size="sm">Mensaje #{messages.length - index}</Text>
              </Group>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
