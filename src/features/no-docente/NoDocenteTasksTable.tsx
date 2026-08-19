"use client";

import { Badge, Text } from "@mantine/core";

import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { NoDocenteTaskRecord } from "@/lib/noDocenteDashboard";

type NoDocenteTasksTableProps = {
  tasks: NoDocenteTaskRecord[];
};

const STATUS_LABELS: Record<NoDocenteTaskRecord["status"], string> = {
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

export default function NoDocenteTasksTable({ tasks }: NoDocenteTasksTableProps) {
  const columns: ResponsiveDataTableColumn<NoDocenteTaskRecord>[] = [
    {
      key: "task",
      header: "Tarea",
      mobileMinWidth: 280,
      render: (task) => (
        <>
          <Text fw={700}>{task.title}</Text>
          <Text size="sm" c="dimmed">{task.description ?? "Sin descripción"}</Text>
        </>
      ),
    },
    { key: "category", header: "Categoría", noWrap: true, render: (task) => task.category },
    {
      key: "status",
      header: "Estado",
      noWrap: true,
      render: (task) => <Badge variant="light" color={task.status === "pendiente" ? "yellow" : "blue"} radius="xl">{STATUS_LABELS[task.status]}</Badge>,
    },
    {
      key: "priority",
      header: "Prioridad",
      noWrap: true,
      render: (task) => <Badge variant="outline" color={task.priority === "alta" ? "red" : "gray"} radius="xl">{PRIORITY_LABELS[task.priority]}</Badge>,
    },
    { key: "due", header: "Vence", noWrap: true, render: (task) => formatDate(task.due_date) },
  ];

  return (
    <ResponsiveDataTable
      data={tasks}
      columns={columns}
      rowKey={(task) => task.id}
      emptyMessage="No hay tareas administrativas abiertas."
    />
  );
}
