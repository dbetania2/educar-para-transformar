"use client";

import { Avatar, ActionIcon, Alert, Box, Card, Group, Select, SimpleGrid, Stack, Text, Textarea } from "@mantine/core";
import { IconAlertCircle, IconEye, IconDotsVertical, IconTrash, IconChevronDown } from "@tabler/icons-react";

import { AdminStatusBadge, AppModal } from "@/components/atoms";
import { PastelBadge } from "@/components/atoms/PastelBadge/PastelBadge";
import { AdminPageLoader, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
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
      key: "student",
      header: "Alumno",
      mobileMinWidth: 240,
      render: (request) => {
        const initials = request.student_full_name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        
        return (
          <Group gap="sm" wrap="nowrap">
            <Avatar color="violet" radius="xl" size="md">{initials}</Avatar>
            <Stack gap={0}>
              <Text fw={600} size="sm" c="#0f172a">
                {request.student_full_name}
              </Text>
              <Text size="xs" c="#64748b">
                {request.email}
              </Text>
            </Stack>
          </Group>
        );
      },
    },
    {
      key: "level",
      header: "Nivel",
      mobileMinWidth: 130,
      noWrap: true,
      render: (request) => {
        let mantineColor = "blue";
        if (request.level.toLowerCase().includes("inicial")) mantineColor = "blue";
        else if (request.level.toLowerCase().includes("intermedio") || request.level.toLowerCase().includes("primaria")) mantineColor = "green";
        else if (request.level.toLowerCase().includes("avanzado") || request.level.toLowerCase().includes("secundaria")) mantineColor = "violet";
        
        return <PastelBadge label={request.level} mantineColor={mantineColor} />;
      }
    },
    {
      key: "status",
      header: "Estado",
      mobileMinWidth: 130,
      noWrap: true,
      render: (request) => <AdminStatusBadge status={request.status} />,
    },
    {
      key: "created",
      header: (
        <Group gap={4} wrap="nowrap" style={{ cursor: "pointer" }}>
          <Text size="inherit" fw="inherit" color="inherit" tt="inherit" style={{ letterSpacing: "inherit" }}>Creada</Text>
          <IconChevronDown size={14} style={{ opacity: 0.5 }} />
        </Group>
      ),
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
      header: "Acciones",
      mobileMinWidth: 90,
      noWrap: true,
      render: (request) => (
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="blue"
            radius="xl"
            aria-label={`Ver solicitud de ${request.student_full_name}`}
            onClick={() => openRequest(request)}
          >
            <IconEye size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            aria-label={`Opciones de ${request.student_full_name}`}
            onClick={() => openRequest(request)}
          >
            <IconDotsVertical size={18} />
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

      <AdminListTemplate
        title="Solicitudes"
        description="Seguimiento rápido de ingresos, revisiones y estado administrativo."
        breadcrumbs={adminRequestsBreadcrumbs}
        searchProps={{
          value: search,
          onChange: setSearch,
          placeholder: "Alumno, email o DNI",
        }}
        filtersSlot={
          <Select
            label="Estado"
            placeholder="Todos"
            data={[...REQUEST_STATUS_OPTIONS]}
            value={statusFilter}
            onChange={(value) => setStatusFilter((value as RequestStatus | null) ?? null)}
            clearable
            style={{ minWidth: 200 }}
          />
        }
      >
        {loadError ? (
          <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />} mb="md">
            {loadError}
          </Alert>
        ) : null}

        {schemaWarning ? (
          <Alert variant="filled" color="yellow" radius="md" icon={<IconAlertCircle size={18} />} mb="md">
            {schemaWarning}
          </Alert>
        ) : null}

        <ResponsiveDataTable
          data={filteredRequests}
          columns={requestTableColumns}
          rowKey={(request) => request.id}
          emptyMessage={emptyRequestsMessage}
          loading={isLoading}
        />
      </AdminListTemplate>
    </>
  );
}
