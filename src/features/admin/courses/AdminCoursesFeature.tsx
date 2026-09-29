"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Alert, Badge, Box, Card, Grid, GridCol, Group, SimpleGrid, Stack, Text, Textarea, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconEye, IconPencil, IconTrash } from "@tabler/icons-react";

import { StatusToneBadge } from "@/components/atoms";
import { AdminPageLoader, AdminSectionCard, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { useAdminCourses } from "@/features/admin/courses/useAdminCourses";
import type { AdminCourse, CourseFormValues } from "@/features/admin/courses/types";
import { CourseForm } from "./CourseForm";
import { courseStatusTone, courseStatusLabel } from "./constants";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
import { AdminFormDrawerTemplate } from "@/components/templates/AdminFormDrawerTemplate/AdminFormDrawerTemplate";

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

const adminCoursesBreadcrumbs: AdminBreadcrumb[] = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Cursos" },
];




export default function AdminCoursesFeature() {
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
    openDeleteModal,
    closeModals,
    saveCourse,
    deleteCourse,
    deleteForm,
    deleteModalOpened,
  } = useAdminCourses();


  const viewCourseStudents = useMemo(() => {
    if (!viewCourse) return [];

    const studentsById = new Map(students.map((student) => [student.profileId, student]));
    return viewCourse.studentProfileIds.map((profileId) => studentsById.get(profileId)).filter(Boolean);
  }, [students, viewCourse]);

  const columns: ResponsiveDataTableColumn<AdminCourse>[] = [
    {
      key: "selection",
      header: "",
      mobileMinWidth: 50,
      render: () => (
        <Box pl="sm">
          <input type="checkbox" style={{ width: 16, height: 16, borderRadius: 4, border: "1px solid #cbd5e1", cursor: "pointer", accentColor: "#0ea5e9" }} />
        </Box>
      ),
    },
    {
      key: "course",
      header: "Curso",
      mobileMinWidth: 260,
      render: (course) => (
        <Stack gap={0}>
          <Text fw={600} size="sm" c="#0f172a">{course.name}</Text>
          <Text size="xs" c="#64748b">{course.subjectName}</Text>
        </Stack>
      ),
    },
    {
      key: "teacher",
      header: "Docente",
      mobileMinWidth: 220,
      render: (course) => <Text size="sm" c="#334155">{course.teacherName ?? "Sin docente"}</Text>,
    },
    {
      key: "students",
      header: "Alumnos",
      mobileMinWidth: 120,
      noWrap: true,
      render: (course) => <Badge variant="light" color="blue" radius="xl">{course.studentCount}</Badge>,
    },
    {
      key: "status",
      header: "Estado",
      mobileMinWidth: 140,
      noWrap: true,
      render: (course) => <StatusToneBadge tone={courseStatusTone(course.status)}>{courseStatusLabel(course.status)}</StatusToneBadge>,
    },
    {
      key: "created",
      header: "Alta",
      mobileMinWidth: 160,
      noWrap: true,
      render: (course) => <Text size="sm" c="#64748b">{formatDateTime(course.createdAt)}</Text>,
    },
    {
      key: "actions",
      header: "Acciones",
      mobileMinWidth: 130,
      noWrap: true,
      render: (course) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Ver curso">
            <ActionIcon
              variant="subtle"
              color="blue"
              radius="xl"
              aria-label={`Ver ${course.name}`}
              onClick={() => setViewCourse(course)}
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar curso">
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              aria-label={`Editar ${course.name}`}
              onClick={() => openEditModal(course)}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar curso">
            <ActionIcon
              variant="subtle"
              color="red"
              radius="xl"
              aria-label={`Eliminar ${course.name}`}
              onClick={() => openDeleteModal(course)}
            >
              <IconTrash size={18} />
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
      <AdminFormDrawerTemplate
        opened={Boolean(viewCourse)}
        onClose={() => setViewCourse(null)}
        title={viewCourse?.name ?? "Detalle"}
        description={viewCourse?.subjectName}
        hideFooter
      >
        {viewCourse ? (
          <Stack gap="blockGapLg">
            <Group>
              <StatusToneBadge tone={courseStatusTone(viewCourse.status)}>{courseStatusLabel(viewCourse.status)}</StatusToneBadge>
            </Group>

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
          </Stack>
        ) : null}
      </AdminFormDrawerTemplate>

      <AdminFormDrawerTemplate
        opened={createModalOpened || editModalOpened}
        onClose={closeModals}
        title={selectedCourse ? "Editar curso" : "Nuevo curso"}
        description="Definí materia, período, docente titular y alumnos asignados."
        submitLabel={selectedCourse ? "Guardar cambios" : "Crear curso"}
        cancelLabel="Cancelar"
        isSubmitting={isSaving}
        formId="admin-course-form"
      >
        <form id="admin-course-form" onSubmit={form.onSubmit((values: CourseFormValues) => void saveCourse(values))}>
          <CourseForm
            form={form}
            teacherOptions={teacherOptions}
            studentOptions={studentOptions}
            dbSubjects={dbSubjects}
            dbTerms={dbTerms}
            dbClassrooms={dbClassrooms}
            dbSchedules={dbSchedules}
          />
        </form>
      </AdminFormDrawerTemplate>

      <AdminFormDrawerTemplate
        opened={deleteModalOpened}
        onClose={closeModals}
        title="Eliminar curso"
        description="Esta acción es irreversible y eliminará el acceso de todos los alumnos."
        submitLabel="Eliminar curso"
        submitIcon={<IconTrash size={18} />}
        cancelLabel="Cancelar"
        formId="admin-course-delete-form"
      >
        <form id="admin-course-delete-form" onSubmit={deleteForm.onSubmit((values: { reason: string }) => void deleteCourse(values))}>
          <Stack gap="blockGapLg">
            <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
              Vas a eliminar <strong>{selectedCourse?.name || "el curso seleccionado"}</strong>. Esta acción borra su acceso y su información asignada.
            </Alert>
            <Textarea
              label="Justificación"
              placeholder="Ej. baja solicitada por administración"
              minRows={4}
              required
              {...deleteForm.getInputProps("reason")}
            />
          </Stack>
        </form>
      </AdminFormDrawerTemplate>

      <AdminListTemplate
        title="Cursos"
        description="Gestioná cursos, docente titular y alumnos asignados desde el panel administrativo."
        breadcrumbs={[
          { label: "Admin", href: "/admin/usuarios" },
          { label: "Cursos" },
        ]}
        createButtonLabel="Nuevo curso"
        onCreate={openCreateModal}
        searchProps={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por curso, materia, docente o período...",
        }}
        statsSlot={
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
        }
      >
        {loadError ? (
          <Alert color="red" icon={<IconAlertCircle size={18} />} title="No se pudieron cargar los cursos" mb="md">
            {loadError}
          </Alert>
        ) : null}

        <ResponsiveDataTable
          data={filteredCourses}
          columns={columns}
          rowKey={(course) => course.id}
          emptyMessage={emptyMessage}
          loading={isLoading}
        />
      </AdminListTemplate>
    </>
  );
}
