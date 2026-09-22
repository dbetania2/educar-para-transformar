"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Indicator,
  Menu,
  Modal,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBell,
  IconCheck,
  IconChecks,
  IconExternalLink,
  IconFileText,
  IconInbox,
  IconMessageCircle,
  IconSearch,
  IconUserCheck,
} from "@tabler/icons-react";

export type NotificationItem = {
  id: string | number;
  title: string;
  description: string;
  created_at: string;
  read_at?: string | null;
  type?: "message" | "task" | "request" | "news" | "system";
  category?: string;
  sender?: string;
  href?: string;
};

type NotificationsBellProps = {
  notifications?: NotificationItem[];
  messagesHref?: string;
  roleTitle?: string;
  onMarkAsRead?: (id: string | number) => void;
  onMarkAllAsRead?: () => void;
};

export default function NotificationsBell({
  notifications = [],
  messagesHref,
  roleTitle,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsBellProps) {
  const [internalReadIds, setInternalReadIds] = useState<Set<string | number>>(new Set());
  const [modalOpened, setModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("all");

  const isRead = (item: NotificationItem) => {
    return Boolean(item.read_at) || internalReadIds.has(item.id);
  };

  const handleMarkAsRead = (id: string | number) => {
    setInternalReadIds((prev) => new Set(prev).add(id));
    onMarkAsRead?.(id);
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setInternalReadIds(new Set(allIds));
    onMarkAllAsRead?.();
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !isRead(n)).length;
  }, [notifications, internalReadIds]);

  const hasUnread = unreadCount > 0;
  const recentNotifications = notifications.slice(0, 5);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.sender && item.sender.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === "unread") return !isRead(item);
      if (activeTab === "messages") return item.type === "message";
      if (activeTab === "alerts") return item.type === "request" || item.type === "task" || item.type === "system";

      return true;
    });
  }, [notifications, searchQuery, activeTab, internalReadIds]);

  const getNotificationIcon = (type?: NotificationItem["type"]) => {
    switch (type) {
      case "message":
        return <IconMessageCircle size={18} style={{ color: "#2563eb" }} />;
      case "request":
        return <IconUserCheck size={18} style={{ color: "#d97706" }} />;
      case "task":
        return <IconFileText size={18} style={{ color: "#059669" }} />;
      case "news":
        return <IconFileText size={18} style={{ color: "#7c3aed" }} />;
      default:
        return <IconAlertCircle size={18} style={{ color: "#475569" }} />;
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Menu position="bottom-end" withArrow shadow="lg" withinPortal width={380} radius="md">
        <Menu.Target>
          <Indicator disabled={!hasUnread} label={unreadCount > 9 ? "9+" : unreadCount} size={18} offset={4} color="red">
            <ActionIcon
              type="button"
              variant="subtle"
              color="gray"
              size="lg"
              radius="xl"
              aria-label="Centro de notificaciones"
              styles={{
                root: {
                  transition: "all 150ms ease",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    transform: "translateY(-1px)",
                  },
                },
              }}
            >
              <IconBell size={20} stroke={1.8} />
            </ActionIcon>
          </Indicator>
        </Menu.Target>

        <Menu.Dropdown p="xs">
          <Menu.Label p="xs">
            <Group justify="space-between" wrap="nowrap">
              <Group gap={6}>
                <Text fw={700} size="sm" c="dark.8">
                  Notificaciones
                </Text>
                {hasUnread && (
                  <Badge size="xs" radius="xl" color="blue" variant="light">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </Group>

              {hasUnread && (
                <Button
                  variant="subtle"
                  size="xs"
                  color="blue"
                  leftSection={<IconChecks size={14} />}
                  onClick={handleMarkAllAsRead}
                  style={{ fontSize: 11, height: 24, padding: "0 6px" }}
                >
                  Leer todas
                </Button>

              )}
            </Group>
          </Menu.Label>

          <Box my={4} style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }} />

          {notifications.length === 0 ? (
            <Stack align="center" justify="center" py="xl" gap="xs">
              <IconInbox size={32} style={{ color: "#94a3b8" }} />
              <Text size="xs" c="dimmed">
                No tenés notificaciones pendientes
              </Text>
            </Stack>
          ) : (
            <Stack gap={4} py={4}>
              {recentNotifications.map((item) => {
                const read = isRead(item);
                return (
                  <Box
                    key={item.id}
                    p="xs"
                    style={{
                      borderRadius: 8,
                      backgroundColor: read ? "transparent" : "var(--mantine-color-blue-0)",
                      transition: "background-color 150ms ease",
                      cursor: item.href ? "pointer" : "default",
                      position: "relative",
                    }}
                    onClick={() => {
                      if (!read) handleMarkAsRead(item.id);
                    }}
                  >
                    <Group align="flex-start" wrap="nowrap" gap="xs">
                      <Box style={{ paddingTop: 2 }}>{getNotificationIcon(item.type)}</Box>

                      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="xs" fw={read ? 500 : 700} truncate c="dark.8">
                            {item.title}
                          </Text>
                          <Text size="10px" c="dimmed">
                            {formatDateLabel(item.created_at)}
                          </Text>
                        </Group>

                        <Text size="xs" c="gray.7" lineClamp={2}>
                          {item.description}
                        </Text>

                        <Group justify="space-between" mt={4} align="center">
                          {item.category && (
                            <Badge size="xs" variant="outline" color="gray">
                              {item.category}
                            </Badge>
                          )}

                          {item.href ? (
                            <Text
                              component={Link}
                              href={item.href}
                              size="10px"
                              fw={600}
                              c="blue.7"
                              style={{ display: "flex", alignItems: "center", gap: 2 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!read) handleMarkAsRead(item.id);
                              }}
                            >
                              Ver más <IconExternalLink size={10} />
                            </Text>
                          ) : (
                            messagesHref && (
                              <Text
                                component={Link}
                                href={messagesHref}
                                size="10px"
                                fw={600}
                                c="blue.7"
                                style={{ display: "flex", alignItems: "center", gap: 2 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!read) handleMarkAsRead(item.id);
                                }}
                              >
                                Ver más <IconExternalLink size={10} />
                              </Text>
                            )
                          )}
                        </Group>
                      </Stack>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Box my={4} style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }} />

          <Button
            variant="light"
            color="blue"
            fullWidth
            size="xs"
            mt={4}
            onClick={() => setModalOpened(true)}
          >
            Ver todas las notificaciones ({notifications.length})
          </Button>
        </Menu.Dropdown>
      </Menu>

      {/* Modal Extendido de Notificaciones */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="xs">
            <IconBell size={22} style={{ color: "#2563eb" }} />
            <Text fw={700} size="lg">
              Centro de Notificaciones {roleTitle ? `• ${roleTitle}` : ""}
            </Text>
          </Group>
        }
        size="lg"
        radius="md"
        padding="md"
      >
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <TextInput
              placeholder="Buscar por título, contenido o emisor..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
            />

            {hasUnread && (
              <Button
                variant="outline"
                color="blue"
                size="sm"
                leftSection={<IconChecks size={16} />}
                onClick={handleMarkAllAsRead}
              >
                Marcar todas leídas
              </Button>
            )}
          </Group>

          <Tabs value={activeTab} onChange={setActiveTab} variant="outline">
            <Tabs.List>
              <Tabs.Tab value="all" rightSection={<Badge size="xs" variant="light" color="gray">{notifications.length}</Badge>}>
                Todas
              </Tabs.Tab>
              <Tabs.Tab value="unread" rightSection={<Badge size="xs" color="red" variant="filled">{unreadCount}</Badge>}>
                Sin leer
              </Tabs.Tab>
              <Tabs.Tab value="messages">
                Mensajes
              </Tabs.Tab>
              <Tabs.Tab value="alerts">
                Avisos / Solicitudes
              </Tabs.Tab>
            </Tabs.List>

            <Box mt="md">
              <ScrollArea h={400} offsetScrollbars>
                {filteredNotifications.length === 0 ? (
                  <Stack align="center" justify="center" py={40} gap="sm">
                    <IconInbox size={48} style={{ color: "#cbd5e1" }} />
                    <Text fw={500} c="dimmed">
                      No hay notificaciones en esta sección
                    </Text>
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    {filteredNotifications.map((item) => {
                      const read = isRead(item);
                      const targetHref = item.href || messagesHref;
                      return (
                        <Card
                          key={item.id}
                          withBorder
                          padding="sm"
                          radius="md"
                          style={{
                            backgroundColor: read ? "#ffffff" : "#f0f9ff",
                            borderColor: read ? "var(--mantine-color-gray-3)" : "#bae6fd",
                          }}
                        >
                          <Group align="flex-start" justify="space-between" wrap="nowrap">
                            <Group align="flex-start" gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                              <Box style={{ paddingTop: 2 }}>{getNotificationIcon(item.type)}</Box>
                              <Stack gap={4} style={{ flex: 1 }}>
                                <Group justify="space-between" wrap="nowrap">
                                  <Text fw={700} size="sm" c="dark.8">
                                    {item.title}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {formatDateLabel(item.created_at)}
                                  </Text>
                                </Group>

                                {item.sender && (
                                  <Text size="xs" c="blue.8" fw={600}>
                                    De: {item.sender}
                                  </Text>
                                )}

                                <Text size="sm" c="gray.7">
                                  {item.description}
                                </Text>

                                <Group gap="xs" mt="xs" align="center">
                                  {item.category && (
                                    <Badge size="xs" variant="light" color="blue">
                                      {item.category}
                                    </Badge>
                                  )}
                                  {read ? (
                                    <Badge size="xs" variant="subtle" color="gray" leftSection={<IconCheck size={10} />}>
                                      Leída
                                    </Badge>
                                  ) : (
                                    <Badge size="xs" color="blue" variant="filled">
                                      Nueva
                                    </Badge>
                                  )}
                                </Group>
                              </Stack>
                            </Group>

                            <Group gap={6} align="center">
                              {!read && (
                                <ActionIcon
                                  variant="light"
                                  color="blue"
                                  size="sm"
                                  title="Marcar como leída"
                                  onClick={() => handleMarkAsRead(item.id)}
                                >
                                  <IconCheck size={14} />
                                </ActionIcon>
                              )}

                              {targetHref && (
                                <Button
                                  component={Link}
                                  href={targetHref}
                                  size="xs"
                                  variant="light"
                                  color="blue"
                                  rightSection={<IconExternalLink size={12} />}
                                  onClick={() => {
                                    if (!read) handleMarkAsRead(item.id);
                                    setModalOpened(false);
                                  }}
                                >
                                  Ir a vista
                                </Button>
                              )}
                            </Group>
                          </Group>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </ScrollArea>
            </Box>
          </Tabs>
        </Stack>
      </Modal>
    </>
  );
}
