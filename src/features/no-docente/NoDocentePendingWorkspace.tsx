"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge, Box, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconClockPlay, IconX } from "@tabler/icons-react";

import type { NoDocenteRequestRecord, NoDocenteTaskRecord } from "@/lib/noDocenteDashboard";

type NoDocentePendingWorkspaceProps = {
  tasks: NoDocenteTaskRecord[];
  requests: NoDocenteRequestRecord[];
};

const REQUEST_STATUS_LABELS: Record<NoDocenteRequestRecord["status"], string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const TASK_STATUS_LABELS: Record<NoDocenteTaskRecord["status"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

const PRIORITY_LABELS: Record<NoDocenteTaskRecord["priority"], string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
};

function formatDate(value: string | null) {
  if (!value) return "Sin vencimiento";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function getTaskTone(task: NoDocenteTaskRecord) {
  if (task.priority === "alta") return "red";
  if (task.status === "pendiente") return "yellow";
  return "blue";
}

export default function NoDocentePendingWorkspace({ tasks, requests }: NoDocentePendingWorkspaceProps) {
  const router = useRouter();
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const openTasks = useMemo(() => tasks.filter((task) => task.status === "pendiente" || task.status === "en_proceso"), [tasks]);
  const openRequests = useMemo(() => requests.filter((request) => request.status === "pendiente" || request.status === "en_revision"), [requests]);

  const updateTaskStatus = async (taskId: number, status: NoDocenteTaskRecord["status"]) => {
    setUpdatingTaskId(taskId);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/no-docente/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo actualizar la tarea.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar la tarea.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <Stack gap="lg">
      {errorMessage ? (
        <Card withBorder radius="md" p="md" bg="red.0" style={{ borderColor: "var(--mantine-color-red-3)" }}>
          <Text size="sm" c="red.8" fw={700}>{errorMessage}</Text>
        </Card>
      ) : null}

      <Stack gap="md">
        <Box>
          <Title order={3} c="brand.7">Solicitudes abiertas</Title>
          <Text size="sm" c="dimmed" mt={4}>Casos de inscripción que requieren revisión administrativa.</Text>
        </Box>

        {openRequests.length > 0 ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {openRequests.map((request) => (
              <Card key={request.id} withBorder radius="md" p="lg" bg="white">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box>
                      <Text fw={700}>{request.student_full_name}</Text>
                      <Text size="sm" c="dimmed">DNI {request.student_dni} · {request.level}</Text>
                    </Box>
                    <Badge variant="light" color={request.status === "pendiente" ? "yellow" : "blue"} radius="xl">
                      {REQUEST_STATUS_LABELS[request.status]}
                    </Badge>
                  </Group>
                  <Text size="sm">{request.email}</Text>
                  <Text size="sm" c="dimmed">{request.contact_phone}</Text>
                  <Text size="sm" c="dimmed">{request.internal_notes ?? "Sin notas internas"}</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card withBorder radius="md" p="md" bg="white">
            <Text size="sm" c="dimmed">No hay solicitudes abiertas.</Text>
          </Card>
        )}
      </Stack>

      <Stack gap="md">
        <Box>
          <Title order={3} c="brand.7">Tareas administrativas</Title>
          <Text size="sm" c="dimmed" mt={4}>Tomá una tarea, resolvela o cancelala cuando corresponda.</Text>
        </Box>

        {openTasks.length > 0 ? (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {openTasks.map((task) => {
              const isUpdating = updatingTaskId === task.id;

              return (
                <Card key={task.id} withBorder radius="md" p="lg" bg="white">
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Box>
                        <Text fw={700}>{task.title}</Text>
                        <Text size="sm" c="dimmed">{task.description ?? "Sin descripción"}</Text>
                      </Box>
                      <Badge variant="light" color={getTaskTone(task)} radius="xl">
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                    </Group>

                    <Group gap="xs">
                      <Badge variant="outline" color={task.priority === "alta" ? "red" : "gray"} radius="xl">
                        Prioridad {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      <Badge variant="light" color="gray" radius="xl">Vence {formatDate(task.due_date)}</Badge>
                      <Badge variant="light" color="gray" radius="xl">{task.category}</Badge>
                    </Group>

                    <Group gap="xs">
                      {task.status === "pendiente" ? (
                        <Button
                          size="xs"
                          radius="xl"
                          variant="light"
                          color="blue"
                          leftSection={<IconClockPlay size={14} />}
                          loading={isUpdating}
                          onClick={() => void updateTaskStatus(task.id, "en_proceso")}
                        >
                          Tomar
                        </Button>
                      ) : null}
                      <Button
                        size="xs"
                        radius="xl"
                        variant="light"
                        color="green"
                        leftSection={<IconCheck size={14} />}
                        loading={isUpdating}
                        onClick={() => void updateTaskStatus(task.id, "resuelta")}
                      >
                        Resolver
                      </Button>
                      <Button
                        size="xs"
                        radius="xl"
                        variant="subtle"
                        color="red"
                        leftSection={<IconX size={14} />}
                        loading={isUpdating}
                        onClick={() => void updateTaskStatus(task.id, "cancelada")}
                      >
                        Cancelar
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Card withBorder radius="md" p="md" bg="white">
            <Text size="sm" c="dimmed">No hay tareas administrativas abiertas.</Text>
          </Card>
        )}
      </Stack>
    </Stack>
  );
}
