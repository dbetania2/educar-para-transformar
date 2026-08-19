"use client";

import { Badge, Text } from "@mantine/core";

import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { NoDocenteStudentRecord } from "@/lib/noDocenteDashboard";

type NoDocenteStudentsTableProps = {
  students: NoDocenteStudentRecord[];
};

function formatStatus(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function NoDocenteStudentsTable({ students }: NoDocenteStudentsTableProps) {
  const columns: ResponsiveDataTableColumn<NoDocenteStudentRecord>[] = [
    {
      key: "student",
      header: "Alumno",
      mobileMinWidth: 240,
      render: (student) => (
        <>
          <Text fw={700}>{student.full_name}</Text>
          <Text size="sm" c="dimmed">DNI {student.dni}</Text>
        </>
      ),
    },
    { key: "code", header: "Legajo", noWrap: true, render: (student) => student.student_code },
    {
      key: "contact",
      header: "Contacto",
      mobileMinWidth: 260,
      render: (student) => (
        <>
          <Text size="sm">{student.email ?? "Sin email"}</Text>
          <Text size="sm" c="dimmed">{student.phone ?? "Sin teléfono"}</Text>
        </>
      ),
    },
    {
      key: "status",
      header: "Estado",
      noWrap: true,
      render: (student) => <Badge variant="light" color="green" radius="xl">{formatStatus(student.current_status)}</Badge>,
    },
    {
      key: "courses",
      header: "Cursos activos",
      noWrap: true,
      render: (student) => String(student.active_courses),
    },
  ];

  return (
    <ResponsiveDataTable
      data={students}
      columns={columns}
      rowKey={(student) => student.profile_id}
      emptyMessage="No hay alumnos activos para mostrar."
    />
  );
}
