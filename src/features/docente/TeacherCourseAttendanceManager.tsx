"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ActionIcon, Badge, Drawer, Group, NativeSelect, Stack, Table, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconReportAnalytics, IconUserCheck } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { TeacherAttendanceSessionRecord, TeacherCourseStudentRecord } from "@/lib/teacherDashboard";

type Props = { courseId: number; sessions: TeacherAttendanceSessionRecord[]; students: TeacherCourseStudentRecord[] };
type Draft = { studentProfileId: string; status: "presente" | "ausente" | "justificada" | "tarde"; notes: string };
type AttendanceForm = { sessionId?: number; sessionDate: string; topic: string };

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: AttendanceForm = { sessionDate: getTodayInputDate(), topic: "" };

const attendanceStatusOptions = [
  { value: "presente", label: "Presente" },
  { value: "ausente", label: "Ausente" },
  { value: "justificada", label: "Justificada" },
  { value: "tarde", label: "Tarde" },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default function TeacherCourseAttendanceManager({ courseId, sessions, students }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState<AttendanceForm>(emptyForm);
  const [records, setRecords] = useState<Draft[]>([]);

  const studentNameById = useMemo(() => new Map(students.map((student) => [student.profile_id, student.full_name])), [students]);
  const courseBasePath = pathname.replace(/\/asistencias$/, "");

  const buildDefaultRecords = () => students.map((student) => ({ studentProfileId: student.profile_id, status: "presente" as const, notes: "" }));

  const openNewAttendance = () => {
    setForm({ ...emptyForm, sessionDate: getTodayInputDate() });
    setRecords(buildDefaultRecords());
    setOpened(true);
  };

  const openEditAttendance = (session: TeacherAttendanceSessionRecord) => {
    setForm({ sessionId: session.id, sessionDate: session.session_date.slice(0, 10), topic: session.topic ?? "" });
    setRecords(students.map((student) => {
      const existing = session.records.find((record) => record.student_profile_id === student.profile_id);
      return {
        studentProfileId: student.profile_id,
        status: existing?.status ?? "presente",
        notes: existing?.notes ?? "",
      };
    }));
    setOpened(true);
  };

  const closeDrawer = () => {
    setOpened(false);
    setForm({ ...emptyForm, sessionDate: getTodayInputDate() });
    setRecords([]);
  };

  const save = async () => {
    const response = await fetch(`/api/docente/courses/${courseId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, records }),
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      notifications.show({ title: "No se pudo guardar asistencia", message: payload?.error ?? "Revisá los datos.", color: "red" });
      return;
    }
    closeDrawer();
    notifications.show({ title: "Asistencia guardada", message: "La clase quedó registrada.", color: "green" });
    startTransition(() => router.refresh());
  };

  const columns: ResponsiveDataTableColumn<TeacherAttendanceSessionRecord>[] = [
    {
      key: "date",
      header: <Text fw={700}>Fecha</Text>,
      mobileMinWidth: 140,
      noWrap: true,
      render: (session) => <Text fw={700} c="brand.7">{formatDate(session.session_date)}</Text>,
    },
    {
      key: "topic",
      header: <Text fw={700}>Tema</Text>,
      mobileMinWidth: 260,
      render: (session) => <Text size="sm" c={session.topic ? undefined : "dimmed"}>{session.topic || "Sin tema cargado"}</Text>,
    },
    {
      key: "records",
      header: <Text fw={700}>Registros</Text>,
      mobileMinWidth: 110,
      noWrap: true,
      render: (session) => <Badge variant="light" color="brand.7" radius="xl">{session.record_count}</Badge>,
    },
    {
      key: "present",
      header: <Text fw={700}>Presentes</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (session) => <Badge variant="light" color="green" radius="xl">{session.present_count + session.late_count}</Badge>,
    },
    {
      key: "absent",
      header: <Text fw={700}>Ausentes</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (session) => <Badge variant="light" color="red" radius="xl">{session.absent_count}</Badge>,
    },
    {
      key: "actions",
      header: <Text fw={700}>Acciones</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (session) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Tomar asistencia">
            <ActionIcon
              variant="subtle"
              color="brand.7"
              radius="xl"
              size="lg"
              aria-label={`Tomar asistencia del ${formatDate(session.session_date)}`}
              disabled={students.length === 0}
              onClick={() => openEditAttendance(session)}
            >
              <IconUserCheck size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar clase">
            <ActionIcon
              variant="subtle"
              color="brand.7"
              radius="xl"
              size="lg"
              aria-label={`Editar clase del ${formatDate(session.session_date)}`}
              onClick={() => openEditAttendance(session)}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Group justify="space-between" align="center">
        <div>
          <Title order={3} c="brand.7">Clases registradas</Title>
          <Text size="sm" c="dimmed" mt={4}>Tomá y editá asistencia desde acciones.</Text>
        </div>
        <CTAButton onClick={openNewAttendance}>Nueva asistencia</CTAButton>
      </Group>

      <ResponsiveDataTable
        data={sessions}
        columns={columns}
        rowKey={(session) => session.id}
        emptyMessage="Todavía no hay clases cargadas para este curso."
      />

      <Drawer opened={opened} onClose={closeDrawer} title={form.sessionId ? "Editar asistencia" : "Nueva asistencia"} position="right" size="min(100vw, 720px)" padding="xl">
        <Stack gap="md">
          <TextInput
            label="Fecha"
            type="date"
            value={form.sessionDate}
            onChange={(event) => setForm({ ...form, sessionDate: event.currentTarget.value })}
          />
          <TextInput label="Tema" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.currentTarget.value })} />
          <Table.ScrollContainer minWidth={560}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Alumno</Table.Th>
                  <Table.Th w={170}>Estado</Table.Th>
                  <Table.Th>Observación</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {records.map((record, index) => (
                  <Table.Tr key={record.studentProfileId}>
                    <Table.Td>
                      <Group justify="space-between" gap="sm" wrap="nowrap">
                        <Text fw={700}>{studentNameById.get(record.studentProfileId) ?? "Alumno"}</Text>
                        <Tooltip label="Ver bitácora">
                          <ActionIcon
                            component={Link}
                            href={`${courseBasePath}/alumnos/${record.studentProfileId}/bitacora`}
                            variant="subtle"
                            color="brand.7"
                            radius="xl"
                            size="lg"
                            aria-label={`Ver bitácora de ${studentNameById.get(record.studentProfileId) ?? "alumno"}`}
                          >
                            <IconReportAnalytics size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <NativeSelect
                        aria-label={`Estado de asistencia de ${studentNameById.get(record.studentProfileId) ?? "alumno"}`}
                        data={attendanceStatusOptions}
                        value={record.status}
                        onChange={(event) => {
                          const status = event.currentTarget.value as Draft["status"];
                          setRecords((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, status } : item));
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        value={record.notes}
                        placeholder={attendanceStatusOptions.find((option) => option.value === record.status)?.label ?? "Observación"}
                        onChange={(event) => {
                          const notes = event.currentTarget.value;
                          setRecords((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, notes } : item));
                        }}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <CTAButton onClick={() => void save()} disabled={pending || students.length === 0} fullWidth>{form.sessionId ? "Guardar cambios" : "Guardar asistencia"}</CTAButton>
        </Stack>
      </Drawer>
    </>
  );
}
