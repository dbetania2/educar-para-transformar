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

const LEVEL_OPTIONS = [
  { value: "Inicial", label: "Nivel Inicial (Jardín)" },
  { value: "Primario", label: "Nivel Primario" },
  { value: "Secundario", label: "Nivel Secundario" },
];

const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  Inicial: [
    "Actividades Integradas",
    "Educación Física Inicial",
    "Expresión Musical",
    "Taller de Arte",
    "Iniciación al Juego",
  ],
  Primario: [
    "Matemática",
    "Lengua y Literatura",
    "Ciencias Naturales",
    "Ciencias Sociales",
    "Inglés",
    "Educación Física",
    "Educación Artística",
    "Tecnología",
  ],
  Secundario: [
    "Matemática",
    "Lengua y Literatura",
    "Física",
    "Química",
    "Biología",
    "Historia",
    "Geografía",
    "Formación Ética y Ciudadana",
    "Inglés",
    "Educación Física",
    "Informática y Programación",
  ],
};

const COMMISSION_OPTIONS = [
  "1° A", "1° B", "2° A", "2° B", "3° A", "3° B", "4° A", "4° B", "5° A", "5° B", "6° A", "6° B"
];

const ACADEMIC_TERM_OPTIONS = [
  "Ciclo lectivo 2026",
  "Ciclo lectivo 2027",
  "Ciclo lectivo 2025",
];

const YEAR_OPTIONS = ["2026", "2027", "2025"];

const CLASSROOM_OPTIONS = [
  "Aula 1", "Aula 2", "Aula 3", "Aula 4", "Aula 5", "Laboratorio de Ciencias", "Laboratorio de Informática", "SUM / Gimnasio"
];

const SCHEDULE_OPTIONS = [
  "Lunes y miércoles 08:00 a 09:30",
  "Martes y jueves 08:00 a 09:30",
  "Lunes y miércoles 10:00 a 11:30",
  "Martes y jueves 10:00 a 11:30",
  "Viernes 09:00 a 10:30",
  "Lunes a viernes 14:00 a 16:00",
];

function CourseForm({
  form,
  teacherOptions,
  studentOptions,
  dbSubjects = [],
  dbTerms = [],
  dbClassrooms = [],
  dbSchedules = [],
}: {
  form: ReturnType<typeof useAdminCourses>["form"];
  teacherOptions: Array<{ value: string; label: string }>;
  studentOptions: Array<{ value: string; label: string }>;
  dbSubjects?: string[];
  dbTerms?: Array<{ name: string; year: number }>;
  dbClassrooms?: string[];
  dbSchedules?: string[];
}) {
  const currentLevel = form.values.level || "Primario";
  const catalogSubjects = SUBJECTS_BY_LEVEL[currentLevel] || SUBJECTS_BY_LEVEL.Primario;

  const currentSubjects = useMemo(() => {
    const list = Array.from(new Set([...dbSubjects, ...catalogSubjects]));
    if (form.values.subjectName && !list.includes(form.values.subjectName)) {
      list.unshift(form.values.subjectName);
    }
    return list;
  }, [catalogSubjects, dbSubjects, form.values.subjectName]);

  const currentTermNames = useMemo(() => {
    const fromDb = dbTerms.map((t) => t.name);
    const list = Array.from(new Set([...fromDb, ...ACADEMIC_TERM_OPTIONS]));
    if (form.values.academicTermName && !list.includes(form.values.academicTermName)) {
      list.unshift(form.values.academicTermName);
    }
    return list;
  }, [dbTerms, form.values.academicTermName]);

  const currentClassrooms = useMemo(() => {
    const list = Array.from(new Set([...dbClassrooms, ...CLASSROOM_OPTIONS]));
    if (form.values.classroom && !list.includes(form.values.classroom)) {
      list.unshift(form.values.classroom);
    }
    return list;
  }, [dbClassrooms, form.values.classroom]);

  const currentSchedules = useMemo(() => {
    const list = Array.from(new Set([...dbSchedules, ...SCHEDULE_OPTIONS]));
    if (form.values.scheduleSummary && !list.includes(form.values.scheduleSummary)) {
      list.unshift(form.values.scheduleSummary);
    }
    return list;
  }, [dbSchedules, form.values.scheduleSummary]);

  const handleLevelChange = (value: string | null) => {
    const nextLevel = value || "Primario";
    const availableSubjects = Array.from(new Set([...dbSubjects, ...(SUBJECTS_BY_LEVEL[nextLevel] || [])]));
    const nextSubject = availableSubjects[0] || "Matemática";
    const commission = form.values.commission || "1° A";

    form.setFieldValue("level", nextLevel);
    form.setFieldValue("subjectName", nextSubject);
    form.setFieldValue("name", `${nextSubject} - ${commission}`);
  };

  const handleSubjectChange = (value: string | null) => {
    const nextSubject = value || "Matemática";
    const commission = form.values.commission || "1° A";

    form.setFieldValue("subjectName", nextSubject);
    form.setFieldValue("name", `${nextSubject} - ${commission}`);
  };

  const handleTermChange = (value: string | null) => {
    const termName = value || `Ciclo lectivo ${new Date().getFullYear()}`;
    form.setFieldValue("academicTermName", termName);
    const found = dbTerms.find((t) => t.name === termName);
    if (found) {
      form.setFieldValue("academicTermYear", String(found.year));
    }
  };

  const handleCommissionChange = (value: string | null) => {
    const nextCommission = value || "1° A";
    const subject = form.values.subjectName || "Matemática";

    form.setFieldValue("commission", nextCommission);
    form.setFieldValue("name", `${subject} - ${nextCommission}`);
  };

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Select
          label="Nivel Educativo"
          data={LEVEL_OPTIONS}
          required
          value={form.values.level}
          onChange={handleLevelChange}
        />

        <Select
          label="Materia (extraída de la BD)"
          data={currentSubjects}
          required
          searchable
          value={form.values.subjectName || currentSubjects[0]}
          onChange={handleSubjectChange}
        />

        <Select
          label="Comisión / División"
          data={COMMISSION_OPTIONS}
          required
          value={form.values.commission || "1° A"}
          onChange={handleCommissionChange}
        />

        <TextInput
          label="Nombre asignado al curso"
          placeholder="Ej: Matemática - 1° A"
          required
          {...form.getInputProps("name")}
        />

        <Select
          label="Período Lectivo (definido en BD)"
          data={currentTermNames}
          required
          searchable
          value={form.values.academicTermName}
          onChange={handleTermChange}
        />

        <Select
          label="Año Lectivo"
          data={YEAR_OPTIONS}
          required
          {...form.getInputProps("academicTermYear")}
        />

        <Select
          label="Aula Asignada"
          data={currentClassrooms}
          searchable
          {...form.getInputProps("classroom")}
        />

        <Select
          label="Grilla Horaria"
          data={currentSchedules}
          searchable
          {...form.getInputProps("scheduleSummary")}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Select
          label="Docente titular a cargo"
          placeholder="Seleccionar docente del cuerpo académico"
          data={teacherOptions}
          searchable
          clearable
          nothingFoundMessage="No hay docentes cargados"
          {...form.getInputProps("teacherProfileId")}
        />
        <Select
          label="Estado del curso"
          data={COURSE_STATUS_OPTIONS}
          required
          {...form.getInputProps("status")}
        />
      </SimpleGrid>

      <MultiSelect
        label="Alumnos matriculados en la comisión"
        placeholder="Seleccionar estudiantes"
        data={studentOptions}
        searchable
        clearable
        hidePickedOptions
        nothingFoundMessage="No hay alumnos cargados"
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
    dbSubjects,
    dbTerms,
    dbClassrooms,
    dbSchedules,
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
    openCreateModal,
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
            <CourseForm
              form={form}
              teacherOptions={teacherOptions}
              studentOptions={studentOptions}
              dbSubjects={dbSubjects}
              dbTerms={dbTerms}
              dbClassrooms={dbClassrooms}
              dbSchedules={dbSchedules}
            />

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
          action={
            <CTAButton type="button" onClick={openCreateModal} size="md">
              + Nuevo curso
            </CTAButton>
          }
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
