"use client";

import { Text, Tooltip } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { getTutorStudentPathBySlug } from "@/lib/auth/roles";
import type { TutorStudentRecord } from "@/lib/tutorDashboard";

type TutorStudentsTableProps = {
  students: TutorStudentRecord[];
  slug: string;
};

function formatRelationship(value: string) {
  switch (value) {
    case "madre": return "Madre";
    case "padre": return "Padre";
    case "responsable": return "Responsable";
    case "tutor": return "Tutor";
    default: return "Otro";
  }
}

export default function TutorStudentsTable({ students, slug }: TutorStudentsTableProps) {
  const columns: ResponsiveDataTableColumn<TutorStudentRecord>[] = [
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
    { key: "code", header: "Legajo", render: (student) => student.student_code ?? "Sin legajo" },
    { key: "relationship", header: "Vínculo", render: (student) => formatRelationship(student.relationship_type) },
    { key: "email", header: "Correo", mobileMinWidth: 220, render: (student) => student.email ?? "Sin correo" },
    {
      key: "actions",
      header: "Acciones",
      render: (student) => (
        <Tooltip label="Ver cursos">
          <CTAButton
            href={getTutorStudentPathBySlug(slug, student.profile_id)}
            ctaVariant="secondary"
            size="md"
            icon={<IconEye size={18} />}
          >
            Ver cursos
          </CTAButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <ResponsiveDataTable
      data={students}
      columns={columns}
      rowKey={(student) => student.profile_id}
      emptyMessage="Todavía no hay hijos vinculados a este tutor."
    />
  );
}
