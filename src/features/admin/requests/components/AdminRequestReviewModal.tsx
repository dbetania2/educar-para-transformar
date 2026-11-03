"use client";

import {
  ActionIcon,
  Alert,
  Card,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle, IconTrash } from "@tabler/icons-react";

import { AdminStatusBadge, AppModal } from "@/components/atoms";
import { REQUEST_STATUS_OPTIONS } from "@/features/admin/requests/useAdminRequests";
import type {
  AdminRequest,
  AvailableCourseOption,
  RequestStatus,
} from "@/features/admin/requests/types";
import {
  DINING_SERVICE_OPTIONS,
  SPORT_OPTIONS,
  TRANSPORT_ROUTE_OPTIONS,
} from "@/lib/extracurricular";
import { formatDateTime } from "@/lib/utils/formatDateTime";

type AdminRequestReviewModalProps = {
  selectedRequest: AdminRequest | null;
  availableCourses: AvailableCourseOption[];
  workflowEnabled: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  draftStatus: RequestStatus;
  draftNotes: string;
  draftCourseIds: string[];
  draftSports: string[];
  draftTransportRoute: string;
  draftDiningService: string;
  deleteReason: string;
  onClose: () => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onChangeStatus: (status: RequestStatus) => void;
  onChangeNotes: (notes: string) => void;
  onChangeCourseIds: (courseIds: string[]) => void;
  onChangeSports: (sports: string[]) => void;
  onChangeTransportRoute: (route: string) => void;
  onChangeDiningService: (dining: string) => void;
  onChangeDeleteReason: (reason: string) => void;
};

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

export function AdminRequestReviewModal({
  selectedRequest,
  availableCourses,
  workflowEnabled,
  isUpdating,
  isDeleting,
  draftStatus,
  draftNotes,
  draftCourseIds,
  draftSports,
  draftTransportRoute,
  draftDiningService,
  deleteReason,
  onClose,
  onSave,
  onDelete,
  onChangeStatus,
  onChangeNotes,
  onChangeCourseIds,
  onChangeSports,
  onChangeTransportRoute,
  onChangeDiningService,
  onChangeDeleteReason,
}: AdminRequestReviewModalProps) {
  return (
    <AppModal
      opened={Boolean(selectedRequest)}
      onClose={onClose}
      title="Detalle de solicitud"
      description="Revisá la preinscripción, asigná cursos/servicios y actualizá su estado administrativo."
      layout="confirm"
      actionsLayout="stacked"
      actionsFullWidth
      size={760}
      primaryAction={{
        type: "button",
        onClick: onSave,
        disabled: isUpdating,
        label: isUpdating
          ? "Guardando..."
          : workflowEnabled
            ? draftStatus === "aprobada"
              ? "Aprobar e inscribir alumno"
              : "Guardar cambios"
            : "Solo lectura",
      }}
      secondaryAction={{
        type: "button",
        onClick: onClose,
        label: "Cerrar",
      }}
    >
      {selectedRequest ? (
        <Stack gap="blockGapLg">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
            <Card withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Alumno
                </Text>
                <Text fw={700}>{selectedRequest.student_full_name}</Text>
                <Text size="sm">DNI {selectedRequest.student_dni}</Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Contacto
                </Text>
                <Text fw={700}>{selectedRequest.email}</Text>
                <Text size="sm">{selectedRequest.contact_phone}</Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Responsable
                </Text>
                <Text size="sm">
                  {selectedRequest.responsible_type === "tutor" ? "Tutor" : "Padre y madre"}
                </Text>
                {renderResponsibleDetails(selectedRequest)}
              </Stack>
            </Card>
            <Card withBorder radius="md" p="md">
              <Stack gap={6}>
                <Text size="xs" c="dimmed">
                  Resumen administrativo
                </Text>
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
                <Text size="xs" c="dimmed">
                  Seguimiento
                </Text>
                <Text fw={700}>{formatDateTime(selectedRequest.reviewed_at)}</Text>
                <Text size="sm">{selectedRequest.reviewed_by || "Sin dato"}</Text>
              </Stack>
            </Card>
            <Card withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  Acceso inicial
                </Text>
                <Text fw={700}>Clave provisoria</Text>
                <Text size="sm">DNI {selectedRequest.student_dni}</Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {workflowEnabled ? (
            <Alert variant="light" color="blue" radius="md" icon={<IconAlertCircle size={18} />}>
              Contraseña inicial del alumno: <strong>{selectedRequest.student_dni}</strong>.
              {selectedRequest.responsible_type === "parents"
                ? " Tanto el padre como la madre recibirán acceso con su propio DNI."
                : " El tutor recibirá acceso con su propio DNI."}
            </Alert>
          ) : (
            <Alert variant="filled" color="yellow" radius="md" icon={<IconAlertCircle size={18} />}>
              Falta aplicar la migración administrativa en Supabase. Solo lectura.
            </Alert>
          )}

          <Select
            label="Estado administrativo"
            data={[...REQUEST_STATUS_OPTIONS]}
            value={draftStatus}
            onChange={(value) => onChangeStatus((value as RequestStatus) ?? "pendiente")}
            disabled={!workflowEnabled}
          />

          {draftStatus === "aprobada" && workflowEnabled ? (
            <Card withBorder radius="md" p="md" bg="#f8fafc">
              <Stack gap="md">
                <Stack gap={2}>
                  <Text fw={700} c="#0f172a">
                    Asignación Académica y Servicios (Alta de Inscripción)
                  </Text>
                  <Text size="xs" c="#64748b">
                    Seleccioná los cursos activos a los que ingresa el alumno y sus servicios opcionales (micro, comedor y deportes).
                  </Text>
                </Stack>

                <MultiSelect
                  label="Cursos / Comisiones a inscribir"
                  placeholder={
                    availableCourses.length > 0
                      ? "Seleccionar cursos activos..."
                      : "No hay cursos activos registrados"
                  }
                  data={availableCourses}
                  value={draftCourseIds}
                  onChange={onChangeCourseIds}
                  searchable
                  clearable
                />

                <MultiSelect
                  label="Deportes extracurriculares (máx. 2 sin superposición horaria)"
                  placeholder="Seleccionar hasta 2 disciplinas"
                  data={SPORT_OPTIONS}
                  value={draftSports}
                  onChange={onChangeSports}
                  maxValues={2}
                  searchable
                  clearable
                />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Select
                    label="Recorrido de Transporte (Micro)"
                    data={TRANSPORT_ROUTE_OPTIONS}
                    value={draftTransportRoute}
                    onChange={(val) => onChangeTransportRoute(val ?? "No Registrado")}
                  />
                  <Select
                    label="Servicio de Comedor"
                    data={DINING_SERVICE_OPTIONS}
                    value={draftDiningService}
                    onChange={(val) => onChangeDiningService(val ?? "No Registrado")}
                  />
                </SimpleGrid>
              </Stack>
            </Card>
          ) : null}

          <Textarea
            label="Notas internas"
            placeholder="Observaciones del proceso"
            minRows={3}
            value={draftNotes}
            onChange={(event) => onChangeNotes(event.currentTarget.value)}
            disabled={!workflowEnabled}
          />

          <Card withBorder radius="md" p="md">
            <Stack gap="sm">
              <Text fw={700} c="red.8">
                Eliminar solicitud
              </Text>
              <Textarea
                label="Justificación"
                placeholder="Ej. solicitud duplicada o baja solicitada"
                minRows={2}
                value={deleteReason}
                onChange={(event) => onChangeDeleteReason(event.currentTarget.value)}
                disabled={!workflowEnabled || isDeleting}
              />
              <Group justify="flex-end">
                <ActionIcon
                  variant="light"
                  color="red"
                  radius="xl"
                  size="lg"
                  aria-label="Eliminar solicitud"
                  onClick={() => void onDelete()}
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
  );
}

