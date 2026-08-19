"use client";

import { useState } from "react";
import { ActionIcon, Badge, Card, Drawer, Group, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";

import { CTAButton, StatusToneBadge } from "@/components/atoms";
import {
  PageHeader,
  ResponsiveDataTable,
  type PageHeaderBreadcrumbItem,
  type ResponsiveDataTableColumn,
} from "@/components/molecules";
import type { StudentGradeRecord } from "@/lib/studentDashboardShared";

type StudentCourseGradesFeatureProps = {
  courseName: string;
  breadcrumbs: PageHeaderBreadcrumbItem[];
  description: string;
  grades: StudentGradeRecord[];
  emptyMessage: string;
  commentItems: string[];
  backHref: string;
};

function approvalTone(value: boolean | null) {
  if (value === true) return "success" as const;
  if (value === false) return "pending" as const;
  return "review" as const;
}

function approvalLabel(value: boolean | null) {
  if (value === true) return "Aprobada";
  if (value === false) return "Pendiente";
  return "Sin definir";
}

function formatGradeValue(value: number | null, maxValue: number | null) {
  if (typeof value !== "number") {
    return "Sin nota";
  }

  if (typeof maxValue === "number" && maxValue > 0) {
    return `${value}/${maxValue}`;
  }

  return String(value);
}

export default function StudentCourseGradesFeature({
  courseName,
  breadcrumbs,
  description,
  grades,
  emptyMessage,
  backHref,
}: StudentCourseGradesFeatureProps) {
  const [selectedGrade, setSelectedGrade] = useState<StudentGradeRecord | null>(null);

  const columns: ResponsiveDataTableColumn<StudentGradeRecord>[] = [
    {
      key: "evaluation",
      header: <Text fw={700}>Evaluacion</Text>,
      mobileMinWidth: 240,
      render: (record) => <Text fw={600}>{record.evaluation_name}</Text>,
    },
    {
      key: "score",
      header: <Text fw={700}>Nota</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (record) => (
        <Badge variant="light" color={record.approved === false ? "red" : "brand.7"} radius="xl">
          {formatGradeValue(record.grade_value, record.max_grade_value)}
        </Badge>
      ),
    },
    {
      key: "approved",
      header: <Text fw={700}>Estado</Text>,
      mobileMinWidth: 140,
      noWrap: true,
      render: (record) => (
        <StatusToneBadge tone={approvalTone(record.approved)}>{approvalLabel(record.approved)}</StatusToneBadge>
      ),
    },
    {
      key: "actions",
      header: <Text fw={700}>Accion</Text>,
      mobileMinWidth: 110,
      noWrap: true,
      render: (record) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Ver observacion">
            <ActionIcon
              variant="transparent"
              radius="xl"
              size="lg"
              aria-label={`Ver observacion de ${record.evaluation_name}`}
              onClick={() => setSelectedGrade(record)}
              styles={{
                root: {
                  border: "none",
                  backgroundColor: "transparent",
                  transition: "transform 160ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    backgroundColor: "transparent",
                  },
                  "& svg": {
                    color: "var(--mantine-color-black)",
                    transition: "color 160ms ease",
                  },
                  "&:hover svg": {
                    color: "var(--mantine-color-brand-7)",
                  },
                },
              }}
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Drawer
        opened={Boolean(selectedGrade)}
        onClose={() => setSelectedGrade(null)}
        title="Observacion docente"
        position="right"
        size="min(100vw, 720px)"
        padding="xl"
      >
        {selectedGrade ? (
          <Card withBorder radius="md" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
            <Stack gap="lg">
              <div>
                <Text size="sm" c="dimmed">Evaluacion</Text>
                <Text fw={800} fz="1.4rem" c="brand.7">{selectedGrade.evaluation_name}</Text>
              </div>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text size="sm" c="dimmed">Nota</Text>
                    <Text fw={700}>{formatGradeValue(selectedGrade.grade_value, selectedGrade.max_grade_value)}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text size="sm" c="dimmed">Estado</Text>
                    <Text fw={700}>
                      {selectedGrade.approved === true
                        ? "Aprobada"
                        : selectedGrade.approved === false
                          ? "Pendiente"
                          : "Sin definir"}
                    </Text>
                  </Stack>
                </Card>
              </SimpleGrid>

              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">Comentario docente</Text>
                  <Text>
                    {selectedGrade.teacher_comment?.trim() || "Todavia no hay observacion docente registrada para esta evaluacion."}
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Card>
        ) : null}
      </Drawer>

      <Stack gap="pageGapLg">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={`Notas de ${courseName}`}
          description={description}
          action={
            <CTAButton href={backHref} ctaVariant="secondary" size="md">
              ← Volver al curso
            </CTAButton>
          }
        />


        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="md">
            <div>
              <Text fw={800} fz="1.5rem" c="brand.7">Registro de evaluaciones</Text>
              <Text size="sm" c="dimmed" mt={4}>
                La observacion de cada evaluacion se consulta desde la accion de la tabla.
              </Text>
            </div>

            <ResponsiveDataTable
              data={grades}
              columns={columns}
              rowKey={(record) => record.id}
              emptyMessage={emptyMessage}
            />
          </Stack>
        </Card>
      </Stack>
    </>
  );
}
