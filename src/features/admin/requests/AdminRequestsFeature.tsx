"use client";

import { ActionIcon, Alert, Badge, Box, Card, Grid, GridCol, Group, Select, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { IconAlertCircle, IconFileDescription, IconSearch, IconTrash } from "@tabler/icons-react";

import { AdminStatusBadge, AppModal } from "@/components/atoms";
import { AdminPageLoader, AdminSectionCard, PageHeader, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { REQUEST_STATUS_OPTIONS, useAdminRequests } from "@/features/admin/requests/useAdminRequests";
import type { AdminRequest, RequestStatus } from "@/features/admin/requests/types";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { useStyles } from "@/components/templates/AdminRequestsTemplate.style";

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

const adminRequestsBreadcrumbs: AdminBreadcrumb[] = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Solicitudes" },
];

function renderResponsibleDetails(request: AdminRequest) {
  if (request.responsible_type === "tutor") {
    return (
      <Stack gap={4}>
        <Text fw={700}>{request.tutor_full_name || "Tutor"}</Text>
        <Text size="sm">DNI {request.tutor_dni || "Sin dato"}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Stack gap={4}>
        <Text fw={700}>{request.father_full_name || "Padre"}</Text>
        <Text size="sm">DNI {request.father_dni || "Sin dato"}</Text>
      </Stack>
      <Stack gap={4}>
        <Text fw={700}>{request.mother_full_name || "Madre"}</Text>
        <Text size="sm">DNI {request.mother_dni || "Sin dato"}</Text>
      </Stack>
    </Stack>
  );
}

export default function AdminRequestsFeature() {
  const { classes } = useStyles();
  const {
    requests,
    isLoading,
    loadError,
    schemaWarning,
    workflowEnabled,
    selectedRequest,
    isUpdating,
    isDeleting,
    deleteReason,
    draftStatus,
    draftNotes,
    search,
    statusFilter,
    filteredRequests,
    isInitialLoading,
    emptyRequestsMessage,
    setSelectedRequest,
    setDraftStatus,
    setDraftNotes,
    setDeleteReason,
    setSearch,
    setStatusFilter,
    handleSaveRequest,
    handleDeleteRequest,
    openRequest,
  } = useAdminRequests();

  const requestTableColumns: ResponsiveDataTableColumn<AdminRequest>[] = [
    {
      key: "student",
      header: <Text className={classes.tableHeader}>Alumno</Text>,
      mobileMinWidth: 240,
      render: (request) => (
        <Stack gap={4}>
          <Text fw={700} className={classes.recordPrimary}>
            {request.student_full_name}
          </Text>
          <Text size="sm" className={classes.recordSecondary}>
            {request.email}
          </Text>
          <Badge variant="light" color="gray" radius="xl">
            DNI {request.student_dni}
          </Badge>
        </Stack>
      ),
    },
    {
      key: "level",
      header: <Text className={classes.tableHeader}>Nivel</Text>,
      mobileMinWidth: 130,
      noWrap: true,
      render: (request) => request.level,
    },
    {
      key: "status",
      header: <Text className={classes.tableHeader}>Estado</Text>,
      mobileMinWidth: 130,
      noWrap: true,
      render: (request) => <AdminStatusBadge status={request.status} />,
    },
    {
      key: "created",
      header: <Text className={classes.tableHeader}>Creada</Text>,
      mobileMinWidth: 170,
      noWrap: true,
      render: (request) => (
        <Text size="sm" className={classes.noWrap}>
          {formatDateTime(request.created_at)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: <Text className={classes.tableHeader}>Acciones</Text>,
      mobileMinWidth: 90,
      noWrap: true,
      render: (request) => (
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="transparent"
            radius="xl"
            size="lg"
            aria-label={`Ver solicitud de ${request.student_full_name}`}
            onClick={() => openRequest(request)}
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
            <IconFileDescription size={18} />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            radius="xl"
            size="lg"
            aria-label={`Eliminar solicitud de ${request.student_full_name}`}
            onClick={() => openRequest(request)}
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
                  color: "var(--mantine-color-red-7)",
                  transition: "color 160ms ease",
                },
                "&:hover svg": {
                  color: "var(--mantine-color-red-9)",
                },
              },
            }}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  if (isInitialLoading) {
    return (
      <AdminPageLoader
        breadcrumbs={[...adminRequestsBreadcrumbs]}
        title="Solicitudes de inscripción"
        loadingLabel="Cargando solicitudes..."
      />
    );
  }

  return (
    <>
      <AppModal
        opened={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title="Detalle de solicitud"
        description="Revisá la preinscripción y actualizá su estado administrativo."
        layout="confirm"
        actionsLayout="stacked"
        actionsFullWidth
        size={760}
        primaryAction={{
          type: "button",
          onClick: handleSaveRequest,
          disabled: isUpdating,
          label: isUpdating
            ? "Guardando..."
            : workflowEnabled
              ? "Guardar cambios"
              : "Solo lectura",
        }}
        secondaryAction={{
          type: "button",
          onClick: () => setSelectedRequest(null),
          label: "Cerrar",
        }}
      >
        {selectedRequest ? (
          <Stack gap="blockGapLg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
              <Card withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Alumno</Text>
                  <Text fw={700}>{selectedRequest.student_full_name}</Text>
                  <Text size="sm">DNI {selectedRequest.student_dni}</Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Contacto</Text>
                  <Text fw={700}>{selectedRequest.email}</Text>
                  <Text size="sm">{selectedRequest.contact_phone}</Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Responsable</Text>
                  <Text size="sm">{selectedRequest.responsible_type === "tutor" ? "Tutor" : "Padre y madre"}</Text>
                  {renderResponsibleDetails(selectedRequest)}
                </Stack>
              </Card>
              <Card withBorder radius="md" p="md">
                <Stack gap={6}>
                  <Text size="xs" c="dimmed">Resumen administrativo</Text>
                  <Group justify="space-between" align="flex-start" gap="sm">
                    <Stack gap={4}>
                      <Text fw={700}>{selectedRequest.level}</Text>
                      <Text size="sm">Creada {formatDateTime(selectedRequest.created_at)}</Text>
                    </Stack>
                    <AdminStatusBadge status={selectedRequest.status} />
                  </Group>
                </Stack>
              </Card>
              <Card withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Seguimiento</Text>
                  <Text fw={700}>{formatDateTime(selectedRequest.reviewed_at)}</Text>
                  <Text size="sm">{selectedRequest.reviewed_by || "Sin dato"}</Text>
                </Stack>
              </Card>
              <Card withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">Acceso inicial</Text>
                  <Text fw={700}>Clave provisoria</Text>
                  <Text size="sm">DNI {selectedRequest.student_dni}</Text>
                </Stack>
              </Card>
            </SimpleGrid>

            {workflowEnabled ? (
              <Alert variant="light" color="blue" radius="md" icon={<IconAlertCircle size={18} />}>
                Contraseña inicial del alumno: <strong>{selectedRequest.student_dni}</strong>.
              </Alert>
            ) : null}

            {!workflowEnabled ? (
              <Alert variant="filled" color="yellow" radius="md" icon={<IconAlertCircle size={18} />}>
                Falta aplicar la migración administrativa en Supabase. Solo lectura.
              </Alert>
            ) : null}

            <Select
              label="Estado administrativo"
              data={[...REQUEST_STATUS_OPTIONS]}
              value={draftStatus}
              onChange={(value) => setDraftStatus((value as RequestStatus) ?? "pendiente")}
              disabled={!workflowEnabled}
            />

            <Textarea
              label="Notas internas"
              placeholder="Observaciones del proceso"
              minRows={4}
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.currentTarget.value)}
              disabled={!workflowEnabled}
            />

            <Card withBorder radius="md" p="md">
              <Stack gap="sm">
                <Text fw={700} c="red.8">Eliminar solicitud</Text>
                <Textarea
                  label="Justificación"
                  placeholder="Ej. solicitud duplicada o baja solicitada"
                  minRows={3}
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.currentTarget.value)}
                  disabled={!workflowEnabled || isDeleting}
                />
                <Group justify="flex-end">
                  <ActionIcon
                    variant="light"
                    color="red"
                    radius="xl"
                    size="lg"
                    aria-label="Eliminar solicitud"
                    onClick={handleDeleteRequest}
                    loading={isDeleting}
                    disabled={!workflowEnabled}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          </Stack>
        ) : null}
      </AppModal>

      <Stack gap="pageGapSm" className={classes.page}>
        <Box className={classes.hero}>
          <Group justify="space-between" align="flex-start" gap="lg" className={classes.heroInner}>
            <PageHeader
              title="Solicitudes"
              description="Seguimiento rápido de ingresos, revisiones y estado administrativo."
              breadcrumbs={adminRequestsBreadcrumbs}
            />
          </Group>
        </Box>

        {loadError ? (
          <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
            {loadError}
          </Alert>
        ) : null}

        {schemaWarning ? (
          <Alert variant="filled" color="yellow" radius="md" icon={<IconAlertCircle size={18} />}>
            {schemaWarning}
          </Alert>
        ) : null}

        <AdminSectionCard
          compact
          overlayVisible={isLoading && requests.length > 0}
        >
          <Grid gutter="md" mb="md" align="end" className={classes.filtersGrid}>
            <GridCol span={{ base: 12, md: 6 }}>
              <TextInput
                label="Buscar"
                placeholder="Alumno, email o DNI"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
              />
            </GridCol>
            <GridCol span={{ base: 12, md: 6 }}>
              <Select
                label="Estado"
                placeholder="Todos"
                data={[...REQUEST_STATUS_OPTIONS]}
                value={statusFilter}
                onChange={(value) => setStatusFilter((value as RequestStatus | null) ?? null)}
                clearable
              />
            </GridCol>
          </Grid>

          <Box className={classes.tableArea}>
            <ResponsiveDataTable
              data={filteredRequests}
              columns={requestTableColumns}
              rowKey={(request) => request.id}
              emptyMessage={emptyRequestsMessage}
              loading={isLoading}
            />
          </Box>
        </AdminSectionCard>
      </Stack>
    </>
  );
}
