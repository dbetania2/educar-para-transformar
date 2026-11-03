"use client";

import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBallFootball,
  IconBus,
  IconCalendarTime,
  IconEye,
  IconId,
  IconSchool,
  IconToolsKitchen2,
  IconUserCheck,
} from "@tabler/icons-react";

import { PastelBadge, StatusToneBadge } from "@/components/atoms";
import type { ResponsiveDataTableColumn } from "@/components/molecules";
import { LEVEL_COLOR_HEX } from "../constants";
import type {
  SportReportGroupingMode,
  StudentByCourseReportRow,
  StudentBySportReportRow,
  StudentBySubjectReportRow,
  StudentByTransportReportRow,
  TeacherByLevelReportRow,
} from "../types";
import type { SelectedReportDetail } from "./AdminReportDetailDrawer";

export function getStudentByCourseColumns(
  onSelectDetail: (detail: SelectedReportDetail) => void,
): ResponsiveDataTableColumn<StudentByCourseReportRow>[] {
  return [
    {
      key: "legajo",
      header: "Legajo",
      noWrap: true,
      mobileMinWidth: 110,
      render: (row) => (
        <Badge variant="light" color="blue" radius="xl" leftSection={<IconId size={12} />}>
          {row.studentCode}
        </Badge>
      ),
    },
    {
      key: "student",
      header: "Apellido y Nombre",
      mobileMinWidth: 230,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.fullName}
          </Text>
          <Text size="xs" c="#64748b">
            DNI {row.dni} · {row.email ?? "Sin correo"}
          </Text>
        </Stack>
      ),
    },
    {
      key: "level",
      header: "Nivel Educativo",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) => (
        <PastelBadge label={`Nivel ${row.level}`} colorHex={LEVEL_COLOR_HEX[row.level]} />
      ),
    },
    {
      key: "course",
      header: "Curso / División",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <IconSchool size={15} color="#2563eb" />
          <Text size="sm" fw={600} c="#334155">
            {row.courseDivision}
          </Text>
        </Group>
      ),
    },
    {
      key: "subjectsCount",
      header: "Materias",
      noWrap: true,
      mobileMinWidth: 120,
      render: (row) => (
        <Badge variant="light" color="gray" radius="xl">
          {row.enrolledSubjects.length} materias
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Estado",
      noWrap: true,
      mobileMinWidth: 110,
      render: () => <StatusToneBadge tone="success">Activo</StatusToneBadge>,
    },
    {
      key: "actions",
      header: "Ficha",
      noWrap: true,
      mobileMinWidth: 90,
      render: (row) => (
        <Tooltip label="Ver ficha académica del alumno">
          <ActionIcon
            variant="subtle"
            color="blue"
            radius="xl"
            aria-label={`Ver ficha de ${row.fullName}`}
            onClick={() => onSelectDetail({ type: "student", data: row })}
          >
            <IconEye size={18} />
          </ActionIcon>
        </Tooltip>
      ),
    },
  ];
}

export function getStudentBySubjectColumns(): ResponsiveDataTableColumn<StudentBySubjectReportRow>[] {
  return [
    {
      key: "level",
      header: "Nivel Educativo",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) => (
        <PastelBadge label={`Nivel ${row.level}`} colorHex={LEVEL_COLOR_HEX[row.level]} />
      ),
    },
    {
      key: "course",
      header: "Curso",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) => (
        <Text size="sm" fw={600} c="#334155">
          {row.courseDivision}
        </Text>
      ),
    },
    {
      key: "subject",
      header: "Materia",
      mobileMinWidth: 200,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.subjectName}
          </Text>
          <Text size="xs" c="#64748b">
            {row.scheduleSummary ?? "Sin horario"} · {row.classroom ?? "Sin aula"}
          </Text>
        </Stack>
      ),
    },
    {
      key: "teacher",
      header: "Profesor a cargo",
      mobileMinWidth: 200,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <IconUserCheck size={15} color="#0d9488" />
          <Text size="sm" c="#334155">
            {row.teacherName}
          </Text>
        </Group>
      ),
    },
    {
      key: "student",
      header: "Alumno",
      mobileMinWidth: 210,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={600} size="sm" c="#0f172a">
            {row.fullName}
          </Text>
          <Text size="xs" c="#64748b">
            DNI {row.dni}
          </Text>
        </Stack>
      ),
    },
    {
      key: "legajo",
      header: "Legajo",
      noWrap: true,
      mobileMinWidth: 110,
      render: (row) => (
        <Badge variant="light" color="blue" radius="xl" leftSection={<IconId size={12} />}>
          {row.studentCode}
        </Badge>
      ),
    },
  ];
}

export function getTeacherByLevelColumns(
  onSelectDetail: (detail: SelectedReportDetail) => void,
): ResponsiveDataTableColumn<TeacherByLevelReportRow>[] {
  return [
    {
      key: "level",
      header: "Nivel Educativo",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) => (
        <PastelBadge label={`Nivel ${row.level}`} colorHex={LEVEL_COLOR_HEX[row.level]} />
      ),
    },
    {
      key: "teacher",
      header: "Profesor",
      mobileMinWidth: 220,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.fullName}
          </Text>
          <Text size="xs" c="#64748b">
            Legajo {row.teacherCode} · {row.specialty}
          </Text>
        </Stack>
      ),
    },
    {
      key: "subjects",
      header: "Materias a cargo",
      mobileMinWidth: 220,
      render: (row) => (
        <Group gap={6} wrap="wrap">
          {row.subjects.map((subject) => (
            <Badge key={subject} variant="light" color="indigo" radius="xl">
              {subject}
            </Badge>
          ))}
        </Group>
      ),
    },
    {
      key: "courses",
      header: "Cursos asignados",
      mobileMinWidth: 240,
      render: (row) => (
        <Stack gap={2}>
          <Text size="sm" fw={600} c="#334155">
            {row.courses.length} comisiones ({row.totalStudents} alumnos)
          </Text>
          <Text size="xs" c="#64748b">
            {row.courses.map((c) => c.commission).join(", ")}
          </Text>
        </Stack>
      ),
    },
    {
      key: "actions",
      header: "Detalle",
      noWrap: true,
      mobileMinWidth: 90,
      render: (row) => (
        <Tooltip label="Ver carga horaria y comisiones del docente">
          <ActionIcon
            variant="subtle"
            color="blue"
            radius="xl"
            aria-label={`Ver detalle de ${row.fullName}`}
            onClick={() => onSelectDetail({ type: "teacher", data: row })}
          >
            <IconEye size={18} />
          </ActionIcon>
        </Tooltip>
      ),
    },
  ];
}

export function getStudentBySportColumns(
  sportGroupingMode: SportReportGroupingMode,
): ResponsiveDataTableColumn<StudentBySportReportRow>[] {
  return [
    {
      key: "sport",
      header: "Deporte",
      noWrap: true,
      mobileMinWidth: 160,
      render: (row) => (
        <Badge
          variant="light"
          color="grape"
          radius="xl"
          leftSection={<IconBallFootball size={13} />}
        >
          {row.sportName}
        </Badge>
      ),
    },
    ...(sportGroupingMode !== "by_sport"
      ? [
          {
            key: "level",
            header: "Nivel Educativo",
            noWrap: true,
            mobileMinWidth: 140,
            render: (row: StudentBySportReportRow) => (
              <PastelBadge label={`Nivel ${row.level}`} colorHex={LEVEL_COLOR_HEX[row.level]} />
            ),
          },
        ]
      : []),
    ...(sportGroupingMode === "by_sport_level_schedule_teacher"
      ? [
          {
            key: "schedule",
            header: "Horario de Práctica",
            mobileMinWidth: 200,
            render: (row: StudentBySportReportRow) => (
              <Group gap={6} wrap="nowrap">
                <IconCalendarTime size={15} color="#64748b" />
                <Text size="sm" c="#334155">
                  {row.schedule}
                </Text>
              </Group>
            ),
          },
          {
            key: "teacher",
            header: "Profesor a cargo",
            mobileMinWidth: 200,
            render: (row: StudentBySportReportRow) => (
              <Group gap={6} wrap="nowrap">
                <IconUserCheck size={15} color="#0d9488" />
                <Text size="sm" fw={600} c="#334155">
                  {row.teacherName}
                </Text>
              </Group>
            ),
          },
        ]
      : []),
    {
      key: "student",
      header: "Apellido y Nombre",
      mobileMinWidth: 220,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.fullName}
          </Text>
          <Text size="xs" c="#64748b">
            DNI {row.dni} · {row.courseDivision}
          </Text>
        </Stack>
      ),
    },
    {
      key: "legajo",
      header: "Legajo",
      noWrap: true,
      mobileMinWidth: 110,
      render: (row) => (
        <Badge variant="light" color="blue" radius="xl" leftSection={<IconId size={12} />}>
          {row.studentCode}
        </Badge>
      ),
    },
  ];
}

export function getStudentByTransportColumns(): ResponsiveDataTableColumn<StudentByTransportReportRow>[] {
  return [
    {
      key: "route",
      header: "Recorrido de Micro",
      mobileMinWidth: 210,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <IconBus size={16} color="#2563eb" />
          <Text size="sm" fw={700} c="#0f172a">
            {row.transportRoute}
          </Text>
        </Group>
      ),
    },
    {
      key: "student",
      header: "Apellido y Nombre",
      mobileMinWidth: 220,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.fullName}
          </Text>
          <Text size="xs" c="#64748b">
            DNI {row.dni} · {row.phone ?? "Sin teléfono"}
          </Text>
        </Stack>
      ),
    },
    {
      key: "level",
      header: "Nivel / Curso",
      noWrap: true,
      mobileMinWidth: 160,
      render: (row) => (
        <Stack gap={4}>
          <PastelBadge label={`Nivel ${row.level}`} colorHex={LEVEL_COLOR_HEX[row.level]} />
          <Text size="xs" fw={600} c="#475569">
            {row.courseDivision}
          </Text>
        </Stack>
      ),
    },
    {
      key: "dining",
      header: "Régimen de Comedor",
      mobileMinWidth: 190,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <IconToolsKitchen2 size={15} color="#0d9488" />
          <Text size="sm" c="#334155">
            {row.diningService}
          </Text>
        </Group>
      ),
    },
    {
      key: "legajo",
      header: "Legajo",
      noWrap: true,
      mobileMinWidth: 110,
      render: (row) => (
        <Badge variant="light" color="blue" radius="xl" leftSection={<IconId size={12} />}>
          {row.studentCode}
        </Badge>
      ),
    },
  ];
}

