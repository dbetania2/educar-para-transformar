"use client";

import { Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCash,
  IconClockHour4,
  IconFileCheck,
} from "@tabler/icons-react";

import { AdminSectionCard } from "@/components/molecules";
import { formatArs } from "../constants";
import type { ResumenGerencial } from "../types";

type AdminPaymentsStatsGridProps = {
  resumen: ResumenGerencial;
};

export function AdminPaymentsStatsGrid({
  resumen,
}: AdminPaymentsStatsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
      <AdminSectionCard
        title="Total Recaudado"
        description={`${resumen.alumnos_al_dia} alumnos al día (sin deuda)`}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={800} fz="1.65rem" c="#166534">
            {formatArs(resumen.total_cobrado)}
          </Text>
          <ThemeIcon size={40} radius="md" variant="light" color="green">
            <IconCash size={22} />
          </ThemeIcon>
        </Group>
      </AdminSectionCard>

      <AdminSectionCard
        title="Saldo Pendiente"
        description="Cuotas en curso o en revisión"
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={800} fz="1.65rem" c="brand.7">
            {formatArs(resumen.total_pendiente)}
          </Text>
          <ThemeIcon size={40} radius="md" variant="light" color="blue">
            <IconClockHour4 size={22} />
          </ThemeIcon>
        </Group>
      </AdminSectionCard>

      <AdminSectionCard
        title="Saldo en Mora (Vencido)"
        description={`${resumen.alumnos_morosos} alumnos con cuotas vencidas`}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={800} fz="1.65rem" c="#b91c1c">
            {formatArs(resumen.total_vencido)}
          </Text>
          <ThemeIcon size={40} radius="md" variant="light" color="red">
            <IconAlertTriangle size={22} />
          </ThemeIcon>
        </Group>
      </AdminSectionCard>

      <AdminSectionCard
        title="Comprobantes en Revisión"
        description="Pendientes de validación administrativa"
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={800} fz="2rem" c="#0f172a">
            {resumen.comprobantes_en_revision}
          </Text>
          <ThemeIcon size={40} radius="md" variant="light" color="yellow">
            <IconFileCheck size={22} />
          </ThemeIcon>
        </Group>
      </AdminSectionCard>
    </SimpleGrid>
  );
}
