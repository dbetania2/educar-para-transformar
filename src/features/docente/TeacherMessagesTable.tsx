"use client";

import { useEffect, useMemo } from "react";
import { Avatar, Badge, Box, Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBook2, IconMail, IconUserCircle } from "@tabler/icons-react";

import { formatDate } from "@/lib/studentDashboardShared";
import type { TutorTeacherMessageRecord } from "@/lib/tutorDashboard";

type TeacherMessagesTableProps = {
  messages: TutorTeacherMessageRecord[];
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return initials.toUpperCase() || "T";
}

export default function TeacherMessagesTable({ messages }: TeacherMessagesTableProps) {
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [messages],
  );
  const unreadMessageIds = useMemo(
    () => sortedMessages.filter((message) => !message.read_at).map((message) => message.id),
    [sortedMessages],
  );

  useEffect(() => {
    if (unreadMessageIds.length === 0) return;

    window.dispatchEvent(new CustomEvent("teacher-messages-read", { detail: { markAll: true } }));

    void fetch("/api/docente/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  }, [unreadMessageIds]);

  if (sortedMessages.length === 0) {
    return (
      <Card withBorder radius="md" p="lg" bg="white">
        <Group gap="md" align="flex-start" wrap="nowrap">
          <ThemeIcon size={42} radius="xl" variant="light" color="brand.7">
            <IconMail size={20} stroke={1.8} />
          </ThemeIcon>
          <Box>
            <Title order={3} c="brand.7">Sin mensajes</Title>
            <Text size="sm" c="dimmed" mt={4}>Todavía no hay mensajes de tutores para tus cursos.</Text>
          </Box>
        </Group>
      </Card>
    );
  }

  return (
    <Stack gap="sm">
      {sortedMessages.map((message, index) => {
        const isUnread = !message.read_at;
        const formattedDate = formatDate(message.created_at, { dateStyle: "medium", timeStyle: "short" }) ?? "Sin fecha";

        return (
          <Card key={message.id} withBorder radius="md" p="sm" bg="white">
            <Stack gap={6}>
              <Group justify="space-between" align="flex-start" gap="md">
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <Avatar radius="xl" size={36} color="brand" variant="light">
                    {getInitials(message.tutor_name)}
                  </Avatar>
                  <Box>
                    <Group gap="xs" align="center">
                      <Text fw={700}>{message.tutor_name}</Text>
                      {index === 0 ? <Badge variant="light" color="green" radius="xl">Más reciente</Badge> : null}
                      {isUnread ? <Badge variant="light" color="yellow" radius="xl">Nuevo</Badge> : null}
                    </Group>
                  </Box>
                </Group>
                <Stack gap={4} align="flex-end">
                  <Text size="xs" c="dimmed">{formattedDate}</Text>
                  <Badge variant="light" color="blue" radius="xl">Tutor</Badge>
                </Stack>
              </Group>

              <Box>
                <Text size="md" c="neutral.8" lh={1.45} style={{ whiteSpace: "pre-line" }}>{message.message}</Text>
              </Box>

              <Group gap="md" c="dimmed" mt={0}>
                <Group gap={6} wrap="nowrap">
                  <IconUserCircle size={16} stroke={1.8} />
                  <Text size="sm">{message.student_name}</Text>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <IconBook2 size={16} stroke={1.8} />
                  <Text size="sm">{message.course_name}</Text>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <IconMail size={16} stroke={1.8} />
                  <Text size="sm">Mensaje #{sortedMessages.length - index}</Text>
                </Group>
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
