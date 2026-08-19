"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Box, Card, Drawer, Group, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { IconEye, IconX } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { NoDocenteContactMessageRecord, NoDocenteRequestRecord, NoDocenteStudentRecord, NoDocenteTaskRecord } from "@/lib/noDocenteDashboard";

export type NoDocenteReportDetailType = "students" | "incomplete_students" | "requests_pending" | "requests_review" | "tasks" | "messages" | "summary";

export type NoDocenteReportRow = {
  key: string;
  metric: string;
  value: number;
  detail: string;
  tone?: "green" | "blue" | "yellow" | "gray";
  detailType: NoDocenteReportDetailType;
};

type NoDocenteReportsTableProps = {
  rows: NoDocenteReportRow[];
  students: NoDocenteStudentRecord[];
  tasks: NoDocenteTaskRecord[];
  requests: NoDocenteRequestRecord[];
  contactMessages: NoDocenteContactMessageRecord[];
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

function formatDate(value: string | null) {
  if (!value) return "Sin vencimiento";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(date);
}

function EmptyDetailCard({ label }: { label: string }) {
  return (
    <Card withBorder radius="md" p="md" bg="white">
      <Text size="sm" c="dimmed">No hay registros para {label}.</Text>
    </Card>
  );
}

export default function NoDocenteReportsTable({ rows, students, tasks, requests, contactMessages }: NoDocenteReportsTableProps) {
  const [selectedRow, setSelectedRow] = useState<NoDocenteReportRow | null>(null);
  const incompleteStudents = useMemo(() => students.filter((student) => !student.email || !student.phone), [students]);
  const pendingRequests = useMemo(() => requests.filter((request) => request.status === "pendiente"), [requests]);
  const reviewRequests = useMemo(() => requests.filter((request) => request.status === "en_revision"), [requests]);
  const openTasks = useMemo(() => tasks.filter((task) => task.status === "pendiente" || task.status === "en_proceso"), [tasks]);

  const columns: ResponsiveDataTableColumn<NoDocenteReportRow>[] = [
    {
      key: "metric",
      header: "Indicador",
      mobileMinWidth: 240,
      render: (row) => (
        <>
          <Text fw={700}>{row.metric}</Text>
          <Text size="sm" c="dimmed">{row.detail}</Text>
        </>
      ),
    },
    {
      key: "value",
      header: "Total",
      noWrap: true,
      render: (row) => <Badge variant="light" color={row.tone ?? "gray"} radius="xl">{row.value}</Badge>,
    },
    {
      key: "actions",
      header: "Accion",
      noWrap: true,
      mobileMinWidth: 100,
      render: (row) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Ver detalle">
            <ActionIcon
              type="button"
              variant="transparent"
              radius="xl"
              aria-label={"Ver detalle de " + row.metric}
              onClick={() => setSelectedRow(row)}
              styles={{
                root: {
                  color: "var(--mantine-color-neutral-9)",
                  backgroundColor: "transparent",
                  "&:hover": {
                    color: "var(--mantine-color-brand-7)",
                    backgroundColor: "transparent",
                  },
                },
              }}
            >
              <IconEye size={18} stroke={1.9} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  const closeDrawer = () => setSelectedRow(null);

  const renderStudents = (items: NoDocenteStudentRecord[]) => items.length > 0 ? (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {items.map((student) => (
        <Card key={student.profile_id} withBorder radius="md" p="md" bg="white">
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text fw={700}>{student.full_name}</Text>
                <Text size="sm" c="dimmed">Legajo {student.student_code} · DNI {student.dni}</Text>
              </Box>
              <Badge variant="light" color="green" radius="xl">{student.current_status}</Badge>
            </Group>
            <Text size="sm">{student.email ?? "Sin email"}</Text>
            <Text size="sm" c="dimmed">{student.phone ?? "Sin teléfono"}</Text>
            <Text size="sm" c="dimmed">Cursos activos: {student.active_courses}</Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  ) : <EmptyDetailCard label="este indicador" />;

  const renderRequests = (items: NoDocenteRequestRecord[]) => items.length > 0 ? (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {items.map((request) => (
        <Card key={request.id} withBorder radius="md" p="md" bg="white">
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text fw={700}>{request.student_full_name}</Text>
                <Text size="sm" c="dimmed">DNI {request.student_dni} · {request.level}</Text>
              </Box>
              <Badge variant="light" color={request.status === "pendiente" ? "yellow" : "blue"} radius="xl">{REQUEST_STATUS_LABELS[request.status]}</Badge>
            </Group>
            <Text size="sm">{request.email}</Text>
            <Text size="sm" c="dimmed">{request.contact_phone}</Text>
            <Text size="sm" c="dimmed">{request.internal_notes ?? "Sin notas internas"}</Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  ) : <EmptyDetailCard label="este indicador" />;

  const renderTasks = (items: NoDocenteTaskRecord[]) => items.length > 0 ? (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {items.map((task) => (
        <Card key={task.id} withBorder radius="md" p="md" bg="white">
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text fw={700}>{task.title}</Text>
                <Text size="sm" c="dimmed">{task.category}</Text>
              </Box>
              <Badge variant="light" color={task.status === "pendiente" ? "yellow" : "blue"} radius="xl">{TASK_STATUS_LABELS[task.status]}</Badge>
            </Group>
            <Text size="sm" c="dimmed">{task.description ?? "Sin descripción"}</Text>
            <Text size="sm" c="dimmed">Prioridad {task.priority} · Vence {formatDate(task.due_date)}</Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  ) : <EmptyDetailCard label="este indicador" />;

  const renderMessages = (items: NoDocenteContactMessageRecord[]) => items.length > 0 ? (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {items.map((message) => (
        <Card key={message.id} withBorder radius="md" p="md" bg="white">
          <Stack gap={6}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text fw={700}>{message.full_name}</Text>
                <Text size="sm" c="dimmed">{formatDate(message.created_at)}</Text>
              </Box>
              <Badge variant="light" color="blue" radius="xl">Contacto</Badge>
            </Group>
            <Text size="sm">{message.subject}</Text>
            <Text size="sm" c="dimmed">{message.email} · {message.phone}</Text>
            <Text size="sm" c="dimmed">{message.message}</Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  ) : <EmptyDetailCard label="este indicador" />;

  const renderDrawerItems = () => {
    if (!selectedRow) return null;
    if (selectedRow.detailType === "students") return renderStudents(students);
    if (selectedRow.detailType === "incomplete_students") return renderStudents(incompleteStudents);
    if (selectedRow.detailType === "requests_pending") return renderRequests(pendingRequests);
    if (selectedRow.detailType === "requests_review") return renderRequests(reviewRequests);
    if (selectedRow.detailType === "tasks") return renderTasks(openTasks);
    if (selectedRow.detailType === "messages") return renderMessages(contactMessages);
    return <Text size="sm" c="dimmed">Este indicador es un resumen general. No tiene registros operativos asociados todavía.</Text>;
  };

  return (
    <>
      <ResponsiveDataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.key}
        emptyMessage="No hay indicadores disponibles."
      />

      <Drawer
        opened={Boolean(selectedRow)}
        onClose={closeDrawer}
        title={selectedRow?.metric ?? "Detalle"}
        position="right"
        size="min(100vw, 760px)"
        padding="xl"
      >
        {selectedRow ? (
          <Stack gap="md">
            <Card withBorder radius="md" p="md" bg="white">
              <Stack gap={8}>
                <Text size="sm" c="dimmed">{selectedRow.detail}</Text>
                <Badge variant="light" color={selectedRow.tone ?? "gray"} radius="xl" w="fit-content">Total: {selectedRow.value}</Badge>
              </Stack>
            </Card>
            {renderDrawerItems()}
            <Group justify="flex-end" pt="sm">
              <CTAButton ctaVariant="secondary" icon={<IconX size={16} />} onClick={closeDrawer}>
                Cerrar
              </CTAButton>
            </Group>
          </Stack>
        ) : null}
      </Drawer>
    </>
  );
}
