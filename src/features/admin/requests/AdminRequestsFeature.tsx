"use client";

import { useMemo } from "react";
import { ActionIcon, Alert, Avatar, Group, Select, Stack, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconChevronDown,
  IconDotsVertical,
  IconEye,
} from "@tabler/icons-react";

import { AdminStatusBadge } from "@/components/atoms";
import { PastelBadge } from "@/components/atoms/PastelBadge/PastelBadge";
import {
  AdminPageLoader,
  ResponsiveDataTable,
  type ResponsiveDataTableColumn,
} from "@/components/molecules";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
import { AdminRequestReviewModal } from "@/features/admin/requests/components/AdminRequestReviewModal";
import { REQUEST_STATUS_OPTIONS, useAdminRequests } from "@/features/admin/requests/useAdminRequests";
import type { AdminRequest, RequestStatus } from "@/features/admin/requests/types";
import { formatDateTime } from "@/lib/utils/formatDateTime";

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

const adminRequestsBreadcrumbs: AdminBreadcrumb[] = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Solicitudes" },
];

export default function AdminRequestsFeature() {
  const {
    availableCourses,
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
    draftCourseIds,
    draftSports,
    draftTransportRoute,
    draftDiningService,
    search,
    statusFilter,
    filteredRequests,
    isInitialLoading,
    emptyRequestsMessage,
    setSelectedRequest,
    setDraftStatus,
    setDraftNotes,
    setDraftCourseIds,
    setDraftSports,
    setDraftTransportRoute,
    setDraftDiningService,
    setDeleteReason,
    setSearch,
    setStatusFilter,
    handleSaveRequest,
    handleDeleteRequest,
    openRequest,
  } = useAdminRequests();

  const requestTableColumns: ResponsiveDataTableColumn<AdminRequest>[] = useMemo(
    () => [
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
              <Avatar color="violet" radius="xl" size="md">
                {initials}
              </Avatar>
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
          else if (
            request.level.toLowerCase().includes("intermedio") ||
            request.level.toLowerCase().includes("primaria")
          ) {
            mantineColor = "green";
          } else if (
            request.level.toLowerCase().includes("avanzado") ||
            request.level.toLowerCase().includes("secundaria")
          ) {
            mantineColor = "violet";
          }

          return <PastelBadge label={request.level} mantineColor={mantineColor} />;
        },
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
            <Text
              size="inherit"
              fw="inherit"
              color="inherit"
              tt="inherit"
              style={{ letterSpacing: "inherit" }}
            >
              Creada
            </Text>
            <IconChevronDown size={14} style={{ opacity: 0.5 }} />
          </Group>
        ),
        mobileMinWidth: 170,
        noWrap: true,
        render: (request) => (
          <Text size="sm" c="#64748b">
            {formatDateTime(request.created_at)}
          </Text>
        ),
      },
    ],
    [],
  );

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
      <AdminRequestReviewModal
        selectedRequest={selectedRequest}
        availableCourses={availableCourses}
        workflowEnabled={workflowEnabled}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        draftStatus={draftStatus}
        draftNotes={draftNotes}
        draftCourseIds={draftCourseIds}
        draftSports={draftSports}
        draftTransportRoute={draftTransportRoute}
        draftDiningService={draftDiningService}
        deleteReason={deleteReason}
        onClose={() => setSelectedRequest(null)}
        onSave={handleSaveRequest}
        onDelete={handleDeleteRequest}
        onChangeStatus={setDraftStatus}
        onChangeNotes={setDraftNotes}
        onChangeCourseIds={setDraftCourseIds}
        onChangeSports={setDraftSports}
        onChangeTransportRoute={setDraftTransportRoute}
        onChangeDiningService={setDraftDiningService}
        onChangeDeleteReason={setDeleteReason}
      />

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
          pageSize={25}
          onRowClick={(request) => openRequest(request)}
          emptyMessage={emptyRequestsMessage}
          loading={isLoading}
        />
      </AdminListTemplate>
    </>
  );
}
