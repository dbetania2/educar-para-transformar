"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBallFootball,
  IconBook,
  IconBus,
  IconCalendarTime,
  IconId,
  IconSchool,
  IconToolsKitchen2,
  IconUserCheck,
} from "@tabler/icons-react";

import { PastelBadge, StatusToneBadge } from "@/components/atoms";
import { AdminSectionCard } from "@/components/molecules";
import { AdminFormDrawerTemplate } from "@/components/templates/AdminFormDrawerTemplate/AdminFormDrawerTemplate";
import { LEVEL_COLOR_HEX } from "../constants";
import type {
  StudentByCourseReportRow,
  TeacherByLevelReportRow,
} from "../types";

export type SelectedReportDetail =
  | { type: "student"; data: StudentByCourseReportRow }
  | { type: "teacher"; data: TeacherByLevelReportRow }
  | null;

type AdminReportDetailDrawerProps = {
  detail: SelectedReportDetail;
  onClose: () => void;
};

export function AdminReportDetailDrawer({
  detail,
  onClose,
}: AdminReportDetailDrawerProps) {
  if (!detail) {
    return (
      <AdminFormDrawerTemplate
        opened={false}
        onClose={onClose}
        title="Detalle de reporte"
        hideFooter
      >
        {null}
      </AdminFormDrawerTemplate>
    );
  }

  if (detail.type === "student") {
    const student = detail.data;

    return (
      <AdminFormDrawerTemplate
        opened
        onClose={onClose}
        title={student.fullName}
        description={`Legajo ${student.studentCode} · DNI ${student.dni}`}
        hideFooter
      >
        <Stack gap="md">
          <Group gap="xs" wrap="wrap">
            <PastelBadge
              label={`Nivel ${student.level}`}
              colorHex={LEVEL_COLOR_HEX[student.level]}
            />
            <Badge
              variant="light"
              color="blue"
              radius="xl"
              leftSection={<IconSchool size={13} />}
            >
              {student.courseDivision}
            </Badge>
            <StatusToneBadge tone="success">Alumno Activo</StatusToneBadge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <AdminSectionCard title="Legajo Académico" description="Identificador único">
              <Group gap="xs">
                <IconId size={18} color="#2563eb" />
                <Text fw={800} fz="1.25rem" c="brand.7">
                  {student.studentCode}
                </Text>
              </Group>
            </AdminSectionCard>

            <AdminSectionCard title="Materias Cursadas" description={`En ${student.courseDivision}`}>
              <Group gap="xs">
                <IconBook size={18} color="#2563eb" />
                <Text fw={800} fz="1.25rem" c="brand.7">
                  {student.enrolledSubjects.length}
                </Text>
              </Group>
            </AdminSectionCard>
          </SimpleGrid>

          <Card withBorder radius="lg" p="md" bg="white">
            <Stack gap="xs">
              <Text fw={700} c="#0f172a">
                Datos de contacto
              </Text>
              <Group justify="space-between" wrap="wrap">
                <Text size="sm" c="#64748b">
                  Correo electrónico
                </Text>
                <Text size="sm" fw={600} c="#0f172a">
                  {student.email ?? "Sin correo registrado"}
                </Text>
              </Group>
              <Group justify="space-between" wrap="wrap">
                <Text size="sm" c="#64748b">
                  Teléfono
                </Text>
                <Text size="sm" fw={600} c="#0f172a">
                  {student.phone ?? "Sin teléfono registrado"}
                </Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder radius="lg" p="md" bg="white">
            <Stack gap="sm">
              <Text fw={700} c="brand.7">
                Materias y docentes asignados ({student.enrolledSubjects.length})
              </Text>
              {student.enrolledSubjects.map((item) => (
                <Card
                  key={item.courseId}
                  withBorder
                  radius="md"
                  p="sm"
                  bg="#f8fafc"
                >
                  <Stack gap={4}>
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Text fw={700} size="sm" c="#0f172a">
                        {item.subjectName}
                      </Text>
                      <Badge variant="light" color="blue" radius="xl" size="xs">
                        {student.courseDivision}
                      </Badge>
                    </Group>
                    <Text size="xs" c="#64748b">
                      Docente: <strong>{item.teacherName}</strong>
                    </Text>
                    {item.schedule ? (
                      <Group gap={6}>
                        <IconCalendarTime size={13} color="#64748b" />
                        <Text size="xs" c="#64748b">
                          {item.schedule}
                        </Text>
                      </Group>
                    ) : null}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Card>

          <Card withBorder radius="lg" p="md" bg="white">
            <Stack gap="sm">
              <Text fw={700} c="brand.7">
                Servicios Extracurriculares
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <Card withBorder radius="md" p="sm" bg="#f8fafc">
                  <Group gap="xs" wrap="nowrap">
                    <IconBus size={16} color="#2563eb" />
                    <Stack gap={2}>
                      <Text size="xs" c="#64748b" fw={700} tt="uppercase">
                        Transporte Escolar
                      </Text>
                      <Text size="sm" fw={600} c="#0f172a">
                        {student.transportRoute}
                      </Text>
                    </Stack>
                  </Group>
                </Card>

                <Card withBorder radius="md" p="sm" bg="#f8fafc">
                  <Group gap="xs" wrap="nowrap">
                    <IconToolsKitchen2 size={16} color="#0d9488" />
                    <Stack gap={2}>
                      <Text size="xs" c="#64748b" fw={700} tt="uppercase">
                        Comedor
                      </Text>
                      <Text size="sm" fw={600} c="#0f172a">
                        {student.diningService}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              </SimpleGrid>

              <Stack gap="xs">
                <Group gap={6}>
                  <IconBallFootball size={15} color="#7c3aed" />
                  <Text size="sm" fw={700} c="#0f172a">
                    Disciplinas deportivas ({student.sports.length}/2)
                  </Text>
                </Group>
                {student.sports.length > 0 ? (
                  student.sports.map((sport) => (
                    <Card key={sport.name} withBorder radius="md" p="sm" bg="#f8fafc">
                      <Stack gap={2}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="sm" fw={700} c="#0f172a">
                            {sport.name}
                          </Text>
                          <Badge variant="light" color="grape" radius="xl" size="xs">
                            {sport.schedule}
                          </Badge>
                        </Group>
                        <Text size="xs" c="#64748b">
                          Profesor a cargo: <strong>{sport.teacherName}</strong>
                        </Text>
                      </Stack>
                    </Card>
                  ))
                ) : (
                  <Text size="xs" c="#64748b">
                    No inscripto en talleres deportivos.
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </AdminFormDrawerTemplate>
    );
  }

  const teacher = detail.data;

  return (
    <AdminFormDrawerTemplate
      opened
      onClose={onClose}
      title={teacher.fullName}
      description={`Legajo ${teacher.teacherCode} · ${teacher.specialty}`}
      hideFooter
    >
      <Stack gap="md">
        <Group gap="xs" wrap="wrap">
          <PastelBadge
            label={`Nivel ${teacher.level}`}
            colorHex={LEVEL_COLOR_HEX[teacher.level]}
          />
          <Badge
            variant="light"
            color="blue"
            radius="xl"
            leftSection={<IconUserCheck size={13} />}
          >
            {teacher.specialty}
          </Badge>
          <StatusToneBadge tone="success">Docente Activo</StatusToneBadge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <AdminSectionCard title="Comisiones a cargo" description={`En Nivel ${teacher.level}`}>
            <Text fw={800} fz="1.5rem" c="brand.7">
              {teacher.courses.length}
            </Text>
          </AdminSectionCard>

          <AdminSectionCard title="Alumnos alcanzados" description="Total en sus comisiones">
            <Text fw={800} fz="1.5rem" c="brand.7">
              {teacher.totalStudents}
            </Text>
          </AdminSectionCard>
        </SimpleGrid>

        <Card withBorder radius="lg" p="md" bg="white">
          <Stack gap="xs">
            <Text fw={700} c="#0f172a">
              Ficha institucional del docente
            </Text>
            <Group justify="space-between" wrap="wrap">
              <Text size="sm" c="#64748b">
                DNI
              </Text>
              <Text size="sm" fw={600} c="#0f172a">
                {teacher.dni}
              </Text>
            </Group>
            <Group justify="space-between" wrap="wrap">
              <Text size="sm" c="#64748b">
                Correo electrónico
              </Text>
              <Text size="sm" fw={600} c="#0f172a">
                {teacher.email ?? "Sin correo registrado"}
              </Text>
            </Group>
            <Group justify="space-between" wrap="wrap">
              <Text size="sm" c="#64748b">
                Materias que dicta
              </Text>
              <Text size="sm" fw={600} c="#0f172a">
                {teacher.subjects.join(", ")}
              </Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder radius="lg" p="md" bg="white">
          <Stack gap="sm">
            <Text fw={700} c="brand.7">
              Cursos y horarios asignados ({teacher.courses.length})
            </Text>
            {teacher.courses.map((course) => (
              <Card
                key={course.courseId}
                withBorder
                radius="md"
                p="sm"
                bg="#f8fafc"
              >
                <Stack gap={4}>
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Text fw={700} size="sm" c="#0f172a">
                      {course.subjectName} · {course.commission}
                    </Text>
                    <Badge variant="light" color="blue" radius="xl" size="xs">
                      {course.studentCount} alumnos
                    </Badge>
                  </Group>
                  <Text size="xs" c="#64748b">
                    {course.scheduleSummary ?? "Sin horario"} · {course.classroom ?? "Sin aula"}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      </Stack>
    </AdminFormDrawerTemplate>
  );
}

