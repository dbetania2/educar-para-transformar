"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Alert, Badge, Box, Card, Drawer, Grid, GridCol, Group, MultiSelect, Select, SimpleGrid, Stack, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconEye, IconPencil, IconSearch } from "@tabler/icons-react";

import { CTAButton, StatusToneBadge } from "@/components/atoms";
import { AdminPageLoader, AdminSectionCard, PageHeader, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { useAdminCourses } from "@/features/admin/courses/useAdminCourses";
import type { AdminCourse, CourseFormValues } from "@/features/admin/courses/types";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { useStyles } from "@/components/templates/AdminUsersTemplate.style";

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

const adminCoursesBreadcrumbs: AdminBreadcrumb[] = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Cursos" },
];

const COURSE_STATUS_OPTIONS = [
  { value: "activa", label: "Activa" },
  { value: "completada", label: "Completada" },
  { value: "pausada", label: "Pausada" },
  { value: "cancelada", label: "Cancelada" },
];

function courseStatusTone(status: AdminCourse["status"]) {
  if (status === "activa") return "success" as const;
  if (status === "pausada") return "review" as const;
  if (status === "cancelada") return "danger" as const;
  return "pending" as const;
}

function courseStatusLabel(status: AdminCourse["status"]) {
  return COURSE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function CourseForm({
  form,
  teacherOptions,
  studentOptions,
}: {
  form: ReturnType<typeof useAdminCourses>["form"];
  teacherOptions: Array<{ value: string; label: string }>;
  studentOptions: Array<{ value: string; label: string }>;
}) {
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <TextInput label="Nombre del curso" placeholder="Matemática 1A" required {...form.getInputProps("name")} />
        <TextInput label="Materia" placeholder="Matemática" required {...form.getInputProps("subjectName")} />
        <TextInput label="Período" placeholder="Ciclo lectivo 2026" required {...form.getInputProps("academicTermName")} />
        <TextInput label="Año" placeholder="2026" required {...form.getInputProps("academicTermYear")} />
        <TextInput label="Comisión" placeholder="1A" {...form.getInputProps("commission")} />
        <TextInput label="Aula" placeholder="Aula 3" {...form.getInputProps("classroom")} />
      </SimpleGrid>

      <TextInput label="Horario" placeholder="Lunes y miércoles 8:00 a 10:00" {...form.getInputProps("scheduleSummary")} />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Select
          label="Docente titular"
          placeholder="Seleccionar docente"
          data={teacherOptions}
          searchable
          clearable
          nothingFoundMessage="No hay docentes"
          {...form.getInputProps("teacherProfileId")}
        />
        <Select label="Estado" data={COURSE_STATUS_OPTIONS} required {...form.getInputProps("status")} />
      </SimpleGrid>

      <MultiSelect
        label="Alumnos asignados"
        placeholder="Seleccionar alumnos"
        data={studentOptions}
        searchable
        clearable
        hidePickedOptions
        nothingFoundMessage="No hay alumnos"
        {...form.getInputProps("studentProfileIds")}
      />
    </Stack>
  );
}

export default function AdminCoursesFeature() {
  const { classes } = useStyles();
  const [viewCourse, setViewCourse] = useState<AdminCourse | null>(null);
  const {
    courses,
    teachers,
    students,
    isLoading,
    isSaving,
    loadError,
    search,
    filteredCourses,
    createModalOpened,
    editModalOpened,
    selectedCourse,
    form,
    teacherOptions,
    studentOptions,
    setSearch,
    openEditModal,
    closeModals,
    saveCourse,
  } = useAdminCourses();

  const viewCourseStudents = useMemo(() => {
    if (!viewCourse) return [];

    const studentsById = new Map(students.map((student) => [student.profileId, student]));
    return viewCourse.studentProfileIds.map((profileId) => studentsById.get(profileId)).filter(Boolean);
  }, [students, viewCourse]);

  const columns: ResponsiveDataTableColumn<AdminCourse>[] = [
    {
      key: "course",
      header: <Text className={classes.tableHeader}>Curso</Text>,
      mobileMinWidth: 260,
      render: (course) => (
        <Stack gap={4}>
          <Text fw={700} className={classes.userPrimary}>{course.name}</Text>
          <Text size="sm" className={classes.userSecondary}>{course.subjectName}</Text>
          <Text size="xs" c="dimmed">{course.academicTermName} {course.academicTermYear}</Text>
        </Stack>
      ),
    },
    {
      key: "teacher",
      header: <Text className={classes.tableHeader}>Docente</Text>,
      mobileMinWidth: 220,
      render: (course) => <Text size="sm">{course.teacherName ?? "Sin docente"}</Text>,
    },
    {
      key: "students",
      header: <Text className={classes.tableHeader}>Alumnos</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (course) => <Badge variant="light" color="brand.7" radius="xl">{course.studentCount}</Badge>,
    },
    {
      key: "status",
      header: <Text className={classes.tableHeader}>Estado</Text>,
      mobileMinWidth: 140,
      noWrap: true,
      render: (course) => <StatusToneBadge tone={courseStatusTone(course.status)}>{courseStatusLabel(course.status)}</StatusToneBadge>,
    },
    {
      key: "created",
      header: <Text className={classes.tableHeader}>Alta</Text>,
      mobileMinWidth: 160,
      noWrap: true,
      render: (course) => <Text size="sm">{formatDateTime(course.createdAt)}</Text>,
    },
    {
      key: "actions",
      header: <Text className={classes.tableHeader}>Acciones</Text>,
      mobileMinWidth: 110,
      noWrap: true,
      render: (course) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Ver curso">
            <ActionIcon
              variant="transparent"
              radius="xl"
              size="lg"
              aria-label={`Ver ${course.name}`}
              onClick={() => setViewCourse(course)}
              styles={{
                root: {
                  border: "none",
                  backgroundColor: "transparent",
                  "& svg": { color: "var(--mantine-color-black)" },
                  "&:hover svg": { color: "var(--mantine-color-brand-7)" },
                },
              }}
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar curso">
            <ActionIcon
              variant="transparent"
              radius="xl"
              size="lg"
              aria-label={`Editar ${course.name}`}
              onClick={() => openEditModal(course)}
              styles={{
                root: {
                  border: "none",
                  backgroundColor: "transparent",
                  "& svg": { color: "var(--mantine-color-black)" },
                  "&:hover svg": { color: "var(--mantine-color-brand-7)" },
                },
              }}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  const emptyMessage = courses.length === 0
    ? "Todavía no hay cursos cargados."
    : "No hay cursos para los filtros actuales.";

  if (isLoading && courses.length === 0) {
    return <AdminPageLoader title="Cargando cursos" loadingLabel="Cargando cursos y asignaciones..." breadcrumbs={adminCoursesBreadcrumbs} />;
  }

  return (
    <>
      <Drawer
        opened={Boolean(viewCourse)}
        onClose={() => setViewCourse(null)}
        title="Detalle del curso"
        position="right"
        size="min(100vw, 640px)"
        padding="xl"
      >
        {viewCourse ? (
          <Stack gap="blockGapLg">
            <Stack gap="xs">
              <StatusToneBadge tone={courseStatusTone(viewCourse.status)}>{courseStatusLabel(viewCourse.status)}</StatusToneBadge>
              <Title order={2} c="brand.7">{viewCourse.name}</Title>
              <Text c="dimmed">{viewCourse.subjectName}</Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <AdminSectionCard title="Docente" description={viewCourse.teacherName ?? "Sin docente asignado"}>
                <Text fw={700} c="brand.7">{viewCourse.teacherName ?? "-"}</Text>
              </AdminSectionCard>
              <AdminSectionCard title="Alumnos" description="Asignados al curso">
                <Text fw={800} fz="2rem" c="brand.7">{viewCourse.studentCount}</Text>
              </AdminSectionCard>
            </SimpleGrid>

            <Card withBorder radius="lg" p="md">
              <Stack gap="sm">
                <Group justify="space-between" gap="md" wrap="wrap">
                  <Text fw={700}>Período</Text>
                  <Text c="dimmed">{viewCourse.academicTermName} {viewCourse.academicTermYear}</Text>
                </Group>
                <Group justify="space-between" gap="md" wrap="wrap">
                  <Text fw={700}>Comisión</Text>
                  <Text c="dimmed">{viewCourse.commission ?? "Sin comisión"}</Text>
                </Group>
                <Group justify="space-between" gap="md" wrap="wrap">
                  <Text fw={700}>Aula</Text>
                  <Text c="dimmed">{viewCourse.classroom ?? "Sin aula"}</Text>
                </Group>
                <Group justify="space-between" gap="md" wrap="wrap">
                  <Text fw={700}>Horario</Text>
                  <Text c="dimmed">{viewCourse.scheduleSummary ?? "Sin horario"}</Text>
                </Group>
                <Group justify="space-between" gap="md" wrap="wrap">
                  <Text fw={700}>Alta</Text>
                  <Text c="dimmed">{formatDateTime(viewCourse.createdAt)}</Text>
                </Group>
              </Stack>
            </Card>

            <Card withBorder radius="lg" p="md">
              <Stack gap="sm">
                <Text fw={700} c="brand.7">Alumnos asignados</Text>
                {viewCourseStudents.length > 0 ? (
                  <Stack gap="xs">
                    {viewCourseStudents.map((student) => student ? (
                      <Group key={student.profileId} justify="space-between" gap="md" wrap="wrap">
                        <Text>{student.fullName}</Text>
                        <Text size="sm" c="dimmed">DNI {student.dni}</Text>
                      </Group>
                    ) : null)}
                  </Stack>
                ) : (
                  <Text c="dimmed">No hay alumnos asignados.</Text>
                )}
              </Stack>
            </Card>

            <CTAButton type="button" ctaVariant="secondary" fullWidth onClick={() => setViewCourse(null)}>
              Cerrar
            </CTAButton>
          </Stack>
        ) : null}
      </Drawer>

      <Drawer
        opened={createModalOpened || editModalOpened}
        onClose={closeModals}
        title={selectedCourse ? "Editar curso" : "Nuevo curso"}
        position="right"
        size="min(100vw, 640px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">
            Definí materia, período, docente titular y alumnos asignados.
          </Text>
        </Stack>

        <form id="admin-course-form" onSubmit={form.onSubmit((values: CourseFormValues) => void saveCourse(values))}>
          <Stack gap="blockGapLg">
            <CourseForm form={form} teacherOptions={teacherOptions} studentOptions={studentOptions} />
            <Stack gap="sm">
              <CTAButton type="submit" disabled={isSaving} fullWidth>
                {selectedCourse ? "Guardar cambios" : "Crear curso"}
              </CTAButton>
              <CTAButton type="button" ctaVariant="secondary" onClick={closeModals} disabled={isSaving} fullWidth>
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        </form>
      </Drawer>

      <Stack gap="pageGapLg">
        <PageHeader
          breadcrumbs={adminCoursesBreadcrumbs}
          title="Cursos"
          description="Gestioná cursos, docente titular y alumnos asignados desde el panel administrativo."
        />

        {loadError ? (
          <Alert color="red" icon={<IconAlertCircle size={18} />} title="No se pudieron cargar los cursos">
            {loadError}
          </Alert>
        ) : null}

        <Grid gutter="lg">
          <GridCol span={{ base: 12, md: 4 }}>
            <AdminSectionCard title="Cursos" description="Cursos registrados">
              <Text fw={800} fz="2rem" c="brand.7">{courses.length}</Text>
            </AdminSectionCard>
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <AdminSectionCard title="Docentes" description="Disponibles para asignar">
              <Text fw={800} fz="2rem" c="brand.7">{teachers.length}</Text>
            </AdminSectionCard>
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <AdminSectionCard title="Alumnos" description="Disponibles para inscribir">
              <Text fw={800} fz="2rem" c="brand.7">{students.length}</Text>
            </AdminSectionCard>
          </GridCol>
        </Grid>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="lg">
            <Box>
              <Title order={3} c="brand.7">Listado de cursos</Title>
              <Text size="sm" c="dimmed" mt={4}>Editá asignaciones de docentes y alumnos desde cada fila.</Text>
            </Box>

            <TextInput
              placeholder="Buscar por curso, materia, docente o período"
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />

            <ResponsiveDataTable
              data={filteredCourses}
              columns={columns}
              rowKey={(course) => course.id}
              emptyMessage={emptyMessage}
              loading={isLoading}
            />
          </Stack>
        </Card>
      </Stack>
    </>
  );
}
