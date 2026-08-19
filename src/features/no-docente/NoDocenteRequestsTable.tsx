"use client";

import { Badge, Text } from "@mantine/core";

import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { NoDocenteRequestRecord } from "@/lib/noDocenteDashboard";

const STATUS_LABELS: Record<NoDocenteRequestRecord["status"], string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const STATUS_COLORS: Record<NoDocenteRequestRecord["status"], string> = {
  pendiente: "yellow",
  en_revision: "blue",
  aprobada: "green",
  rechazada: "red",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

type NoDocenteRequestsTableProps = {
  requests: NoDocenteRequestRecord[];
};

export default function NoDocenteRequestsTable({ requests }: NoDocenteRequestsTableProps) {
  const columns: ResponsiveDataTableColumn<NoDocenteRequestRecord>[] = [
    {
      key: "student",
      header: "Alumno",
      mobileMinWidth: 230,
      render: (request) => (
        <>
          <Text fw={700}>{request.student_full_name}</Text>
          <Text size="sm" c="dimmed">DNI {request.student_dni} · {request.level}</Text>
        </>
      ),
    },
    {
      key: "contact",
      header: "Contacto",
      mobileMinWidth: 240,
      render: (request) => (
        <>
          <Text size="sm">{request.email}</Text>
          <Text size="sm" c="dimmed">{request.contact_phone}</Text>
        </>
      ),
    },
    {
      key: "status",
      header: "Estado",
      noWrap: true,
      render: (request) => <Badge variant="light" color={STATUS_COLORS[request.status]} radius="xl">{STATUS_LABELS[request.status]}</Badge>,
    },
    {
      key: "created",
      header: "Fecha",
      noWrap: true,
      mobileMinWidth: 160,
      render: (request) => <Text size="sm">{formatDate(request.created_at)}</Text>,
    },
  ];

  return (
    <ResponsiveDataTable
      data={requests}
      columns={columns}
      rowKey={(request) => request.id}
      emptyMessage="No hay solicitudes para este indicador."
    />
  );
}
