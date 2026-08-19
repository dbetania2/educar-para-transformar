"use client";

import { useMemo, useState } from "react";
import { Card, Stack, Table, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { IconEye, IconSearch } from "@tabler/icons-react";

import { AttendanceStatusBadge, CTAButton } from "@/components/atoms";

type AttendanceStatus = "presente" | "ausente" | "justificada" | "tarde" | "sin_registro";

type TeacherCourseStudentRow = {
  profileId: string;
  fullName: string;
  dni: string;
  email: string | null;
  studentCode: string;
  latestAttendance: {
    status: AttendanceStatus;
    date: string | null;
  };
};

type TeacherCourseStudentsTableProps = {
  students: TeacherCourseStudentRow[];
  coursePath: string;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default function TeacherCourseStudentsTable({ students, coursePath }: TeacherCourseStudentsTableProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);

  const filteredStudents = useMemo(() => {
    if (!normalizedQuery) {
      return students;
    }

    return students.filter((student) => {
      const haystack = normalizeSearch([student.fullName, student.studentCode, student.dni].join(" "));
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, students]);

  return (
    <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
      <Stack gap="md">
        <div>
          <Title order={3} c="brand.7">Alumnos inscriptos</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Estado según la última asistencia registrada y acceso directo a la bitácora del alumno.
          </Text>
        </div>

        <TextInput
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Buscar por legajo, apellido, nombre o DNI"
          leftSection={<IconSearch size={18} />}
          radius="xl"
        />

        <TableScrollContainer minWidth={760}>
          <Table striped highlightOnHover verticalSpacing="sm">
            <TableThead>
              <TableTr>
                <TableTh>Alumno</TableTh>
                <TableTh>Legajo</TableTh>
                <TableTh>Contacto</TableTh>
                <TableTh>Estado</TableTh>
                <TableTh>Última clase</TableTh>
                <TableTh>Acciones</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableTr key={student.profileId}>
                  <TableTd>
                    <Text fw={700}>{student.fullName}</Text>
                    <Text size="sm" c="dimmed">DNI {student.dni}</Text>
                  </TableTd>
                  <TableTd>{student.studentCode}</TableTd>
                  <TableTd>{student.email ?? "Sin correo"}</TableTd>
                  <TableTd><AttendanceStatusBadge status={student.latestAttendance.status} /></TableTd>
                  <TableTd>{formatDate(student.latestAttendance.date) ?? "Sin registro"}</TableTd>
                  <TableTd>
                    <Tooltip label="Ver bitácora">
                      <CTAButton
                        href={`${coursePath}/alumnos/${student.profileId}/bitacora`}
                        ctaVariant="secondary"
                        size="md"
                        icon={<IconEye size={18} />}
                      >
                        Ver bitácora
                      </CTAButton>
                    </Tooltip>
                  </TableTd>
                </TableTr>
              )) : (
                <TableTr>
                  <TableTd colSpan={6}>No hay alumnos para la búsqueda actual.</TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </TableScrollContainer>
      </Stack>
    </Card>
  );
}

export type { TeacherCourseStudentRow };
