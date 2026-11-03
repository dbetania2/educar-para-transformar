"use client";

import { SimpleGrid, Text } from "@mantine/core";

import { AdminSectionCard } from "@/components/molecules";
import type { AdminReportsSummaryStats } from "../types";

type AdminReportsStatsGridProps = {
  stats: AdminReportsSummaryStats;
};

export function AdminReportsStatsGrid({ stats }: AdminReportsStatsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
      <AdminSectionCard title="Alumnos Activos" description="Legajos con matrícula vigente">
        <Text fw={800} fz="2rem" c="brand.7">
          {stats.activeStudentsCount}
        </Text>
      </AdminSectionCard>
      <AdminSectionCard title="Docentes en Actividad" description="Cuerpo académico titular">
        <Text fw={800} fz="2rem" c="brand.7">
          {stats.activeTeachersCount}
        </Text>
      </AdminSectionCard>
      <AdminSectionCard title="Comisiones Activas" description="Cursos del ciclo lectivo">
        <Text fw={800} fz="2rem" c="brand.7">
          {stats.activeCoursesCount}
        </Text>
      </AdminSectionCard>
      <AdminSectionCard title="Materias Dictadas" description="Plan curricular activo">
        <Text fw={800} fz="2rem" c="brand.7">
          {stats.activeSubjectsCount}
        </Text>
      </AdminSectionCard>
    </SimpleGrid>
  );
}

