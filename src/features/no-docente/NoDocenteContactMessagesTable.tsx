"use client";

import { Text } from "@mantine/core";

import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { NoDocenteContactMessageRecord } from "@/lib/noDocenteDashboard";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

type NoDocenteContactMessagesTableProps = {
  messages: NoDocenteContactMessageRecord[];
};

export default function NoDocenteContactMessagesTable({ messages }: NoDocenteContactMessagesTableProps) {
  const columns: ResponsiveDataTableColumn<NoDocenteContactMessageRecord>[] = [
    {
      key: "sender",
      header: "Contacto",
      mobileMinWidth: 230,
      render: (message) => (
        <>
          <Text fw={700}>{message.full_name}</Text>
          <Text size="sm" c="dimmed">{message.email}</Text>
          <Text size="sm" c="dimmed">{message.phone}</Text>
        </>
      ),
    },
    {
      key: "subject",
      header: "Consulta",
      mobileMinWidth: 300,
      render: (message) => (
        <>
          <Text fw={700}>{message.subject}</Text>
          <Text size="sm" c="dimmed" lineClamp={2}>{message.message}</Text>
        </>
      ),
    },
    {
      key: "created",
      header: "Fecha",
      mobileMinWidth: 160,
      noWrap: true,
      render: (message) => <Text size="sm">{formatDate(message.created_at)}</Text>,
    },
  ];

  return (
    <ResponsiveDataTable
      data={messages}
      columns={columns}
      rowKey={(message) => message.id}
      emptyMessage="No hay mensajes de contacto cargados."
    />
  );
}
