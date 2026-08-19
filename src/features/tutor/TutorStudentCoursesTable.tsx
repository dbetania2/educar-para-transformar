"use client";

import { Text, Tooltip } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { getTutorStudentCoursePathBySlug } from "@/lib/auth/roles";
import type { TutorCourseRecord } from "@/lib/tutorDashboard";

type TutorStudentCoursesTableProps = {
  courses: TutorCourseRecord[];
  slug: string;
  studentProfileId: string;
};

export default function TutorStudentCoursesTable({
  courses,
  slug,
  studentProfileId,
}: TutorStudentCoursesTableProps) {
  const columns: ResponsiveDataTableColumn<TutorCourseRecord>[] = [
    {
      key: "course",
      header: "Curso",
      mobileMinWidth: 280,
      render: (course) => (
        <>
          <Text fw={700}>{course.course_name}</Text>
          <Text size="sm" c="dimmed">{course.subject_name ?? "Materia"}</Text>
        </>
      ),
    },
    { key: "teacher", header: "Docente", mobileMinWidth: 220, render: (course) => course.teacher_name ?? "Sin docente" },
    {
      key: "actions",
      header: "Acciones",
      render: (course) => (
        <Tooltip label="Ver bitácora">
          <CTAButton
            href={getTutorStudentCoursePathBySlug(slug, studentProfileId, course.id)}
            ctaVariant="secondary"
            size="md"
            icon={<IconEye size={18} />}
          >
            Ver bitácora
          </CTAButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <ResponsiveDataTable
      data={courses}
      columns={columns}
      rowKey={(course) => course.id}
      emptyMessage="Este alumno todavía no tiene cursos activos."
      mobileMinWidth={680}
    />
  );
}
