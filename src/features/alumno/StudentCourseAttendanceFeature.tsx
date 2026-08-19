"use client";

import { useState } from "react";
import { ActionIcon, Card, Drawer, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";

import { AttendanceStatusBadge, CTAButton } from "@/components/atoms";
import {
  PageHeader,
  ResponsiveDataTable,
  type PageHeaderBreadcrumbItem,
  type ResponsiveDataTableColumn,
} from "@/components/molecules";
import {
  formatDate,
  formatStudentAttendanceStatus,
  type StudentAttendanceRecord,
} from "@/lib/studentDashboardShared";

type StudentCourseAttendanceFeatureProps = {
  courseName: string;
  breadcrumbs: PageHeaderBreadcrumbItem[];
  description: string;
  records: StudentAttendanceRecord[];
  emptyMessage: string;
  summaryItems: string[];
  backHref: string;
};

export default function StudentCourseAttendanceFeature({
  courseName,
  breadcrumbs,
  description,
  records,
  emptyMessage,
  backHref,
}: StudentCourseAttendanceFeatureProps) {
  const [selectedRecord, setSelectedRecord] = useState<StudentAttendanceRecord | null>(null);

  const columns: ResponsiveDataTableColumn<StudentAttendanceRecord>[] = [
    {
      key: "date",
      header: <Text fw={700}>Fecha</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (record) => <Text size="sm">{formatDate(record.class_date) ?? "Sin fecha"}</Text>,
    },
    {
      key: "status",
      header: <Text fw={700}>Estado</Text>,
      mobileMinWidth: 160,
      noWrap: true,
      render: (record) => <AttendanceStatusBadge status={record.status} />,
    },
    {
      key: "actions",
      header: <Text fw={700}>Accion</Text>,
      mobileMinWidth: 110,
      noWrap: true,
      render: (record) => (
        <Tooltip label="Ver detalle">
          <ActionIcon
            variant="transparent"
            radius="xl"
            size="lg"
            aria-label={`Ver detalle de la asistencia del ${formatDate(record.class_date) ?? "registro"}`}
            onClick={() => setSelectedRecord(record)}
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
      ),
    },
  ];

  return (
    <>
      <Drawer
        opened={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Detalle de asistencia"
        position="right"
        size="min(100vw, 720px)"
        padding="xl"
      >
        {selectedRecord ? (
          <Card withBorder radius="md" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
            <Stack gap="lg">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text size="sm" c="dimmed">Fecha</Text>
                    <Text fw={700}>{formatDate(selectedRecord.class_date) ?? "Sin fecha"}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text size="sm" c="dimmed">Estado</Text>
                    <Text fw={700}>{formatStudentAttendanceStatus(selectedRecord.status)}</Text>
                  </Stack>
                </Card>
              </SimpleGrid>

              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap={6}>
                  <Text size="sm" c="dimmed">Observacion</Text>
                  <Text>
                    {selectedRecord.notes?.trim() || "Todavia no hay observaciones para este registro de asistencia."}
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
          title={`Asistencias de ${courseName}`}
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
              <Text fw={800} fz="1.5rem" c="brand.7">Detalle de asistencias</Text>
              <Text size="sm" c="dimmed" mt={4}>
                El detalle completo de cada registro se consulta desde la accion de la tabla.
              </Text>
            </div>

            <ResponsiveDataTable
              data={records}
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
