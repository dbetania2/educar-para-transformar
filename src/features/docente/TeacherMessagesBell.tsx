"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Badge, Box, Divider, Group, Indicator, Menu, Stack, Text } from "@mantine/core";
import { IconBell, IconMessageCircle } from "@tabler/icons-react";

import { formatDate } from "@/lib/studentDashboardShared";

type TeacherMessagePreview = {
  id: number;
  message: string;
  created_at: string;
  read_at: string | null;
  tutor_name: string;
  student_name: string;
  course_name: string;
};

type TeacherMessagesBellProps = {
  messages: TeacherMessagePreview[];
  messagesHref: string;
};

function previewText(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 96 ? normalized.slice(0, 93) + "..." : normalized;
}

export default function TeacherMessagesBell({ messages, messagesHref }: TeacherMessagesBellProps) {
  const initiallyReadIds = useMemo(
    () => messages.filter((message) => message.read_at).map((message) => message.id),
    [messages],
  );
  const [readMessageIds, setReadMessageIds] = useState(() => new Set(initiallyReadIds));
  const recentMessages = messages.slice(0, 5);
  const hasMessages = messages.length > 0;
  const unreadCount = messages.filter((message) => !readMessageIds.has(message.id)).length;
  const hasUnreadMessages = unreadCount > 0;

  useEffect(() => {
    const handleMessagesRead = (event: Event) => {
      const detail = (event as CustomEvent<{ messageIds?: number[]; markAll?: boolean }>).detail;

      if (detail?.markAll) {
        setReadMessageIds(new Set(messages.map((message) => message.id)));
        return;
      }

      if (!detail?.messageIds?.length) return;

      setReadMessageIds((current) => {
        const next = new Set(current);
        detail.messageIds?.forEach((messageId) => next.add(messageId));
        return next;
      });
    };

    window.addEventListener("teacher-messages-read", handleMessagesRead);
    return () => window.removeEventListener("teacher-messages-read", handleMessagesRead);
  }, [messages]);

  const persistReadState = (payload: { messageIds?: number[]; markAll?: boolean }) => {
    void fetch("/api/docente/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const markMessagesAsRead = (messageIds: number[]) => {
    if (messageIds.length === 0) return;

    setReadMessageIds((current) => {
      const next = new Set(current);
      messageIds.forEach((messageId) => next.add(messageId));
      return next;
    });
    persistReadState({ messageIds });
  };

  const markAllAsRead = () => {
    const unreadIds = messages
      .filter((message) => !readMessageIds.has(message.id))
      .map((message) => message.id);

    if (unreadIds.length === 0) return;

    setReadMessageIds((current) => {
      const next = new Set(current);
      unreadIds.forEach((messageId) => next.add(messageId));
      return next;
    });
    persistReadState({ markAll: true });
  };

  const messageItemStyles = {
    item: {
      transition: "color 160ms ease, background-color 160ms ease",
      color: "var(--mantine-color-neutral-9)",
      "&:hover": {
        backgroundColor: "var(--mantine-color-brand-7)",
        color: "var(--mantine-color-white)",
      },
      "&:hover *": {
        color: "var(--mantine-color-white) !important",
      },
      "&:hover svg": {
        color: "var(--mantine-color-white) !important",
      },
    },
    itemLabel: {
      transition: "color 160ms ease",
      color: "var(--mantine-color-neutral-9)",
    },
    itemSection: {
      transition: "color 160ms ease",
      color: "var(--mantine-color-neutral-9)",
    },
  } as const;

  return (
    <Menu position="bottom-end" withArrow shadow="md" withinPortal width={360}>
      <Menu.Target>
        <Indicator disabled={!hasUnreadMessages} label={unreadCount} size={18} offset={6} color="adminDanger.7">
          <ActionIcon
            type="button"
            variant="transparent"
            radius="xl"
            size="lg"
            aria-label="Ver mensajes de tutores"
            data-active={hasUnreadMessages || undefined}
            styles={{
              root: {
                border: "none",
                backgroundColor: "transparent",
                color: "var(--mantine-color-neutral-9)",
                transition: "background-color 160ms ease, color 160ms ease, transform 160ms ease",
                "&[data-active='true']": {
                  backgroundColor: "transparent",
                  color: "var(--mantine-color-brand-7)",
                },
                "&[data-active='true']:hover": {
                  backgroundColor: "transparent",
                  color: "var(--mantine-color-brand-8)",
                  transform: "translateY(-1px)",
                },
                "&:not([data-active='true']):hover": {
                  backgroundColor: "transparent",
                  color: "var(--mantine-color-brand-7)",
                  transform: "translateY(-1px)",
                },
              },
            }}
          >
            <IconBell size={20} stroke={1.9} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={700} size="sm">Mensajes de tutores</Text>
            {hasUnreadMessages ? <Badge radius="xl" variant="light" color="brand.7">{unreadCount}</Badge> : null}
          </Group>
        </Menu.Label>

        {hasMessages ? (
          recentMessages.map((message) => (
            <Menu.Item
              key={message.id}
              component={Link}
              href={messagesHref}
              leftSection={<IconMessageCircle size={16} stroke={1.9} />}
              onClick={() => markMessagesAsRead([message.id])}
              styles={messageItemStyles}
            >
              <Stack gap={2}>
                <Group gap={6} wrap="nowrap">
                  <Text fw={700} size="sm" truncate>{message.student_name}</Text>
                  <Text size="xs" c="dimmed" truncate>{message.course_name}</Text>
                </Group>
                <Text size="xs" c="dimmed">{message.tutor_name} · {formatDate(message.created_at, { dateStyle: "short", timeStyle: "short" }) ?? "Sin fecha"}</Text>
                <Text size="xs">{previewText(message.message)}</Text>
              </Stack>
            </Menu.Item>
          ))
        ) : (
          <Box px="sm" py="xs">
            <Text size="sm" c="dimmed">No hay mensajes de tutores.</Text>
          </Box>
        )}

        <Divider my="xs" />
        <Menu.Item component={Link} href={messagesHref} leftSection={<IconMessageCircle size={16} stroke={1.9} />} onClick={markAllAsRead} styles={messageItemStyles}>
          Abrir bandeja de mensajes
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
