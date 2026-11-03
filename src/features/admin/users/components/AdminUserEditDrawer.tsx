"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Drawer,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { DniNumberInput } from "@/components/molecules";
import { roleUsesLegajo } from "@/lib/auth/legajo";
import { USER_ROLE_OPTIONS } from "@/lib/auth/roles";
import {
  DINING_SERVICE_OPTIONS,
  SPORT_OPTIONS,
  TRANSPORT_ROUTE_OPTIONS,
} from "@/lib/extracurricular";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import type { AdminUserDetail, EditUserValues } from "../types";
import { getRequestStatusColor, getRequestStatusLabel } from "../userUtils";

type AdminUserEditDrawerProps = {
  opened: boolean;
  onClose: () => void;
  isLoadingDetail: boolean;
  isSavingDetail: boolean;
  isResettingPassword: boolean;
  detailError: string | null;
  selectedUser: AdminUserDetail | null;
  detailForm: UseFormReturnType<EditUserValues>;
  onSave: (values: EditUserValues) => Promise<void>;
  onResetPasswordToDni: () => Promise<void>;
};

export function AdminUserEditDrawer({
  opened,
  onClose,
  isLoadingDetail,
  isSavingDetail,
  isResettingPassword,
  detailError,
  selectedUser,
  detailForm,
  onSave,
  onResetPasswordToDni,
}: AdminUserEditDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Editar usuario"
      position="right"
      size="min(100vw, 760px)"
      padding="xl"
    >
      <Stack gap="xs" mb="lg">
        <Text size="sm" c="dimmed">
          Actualizá los datos principales del usuario autenticable.
        </Text>
      </Stack>

      {detailError ? (
        <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
          {detailError}
        </Alert>
      ) : null}

      {isLoadingDetail ? <Text c="dimmed">Cargando detalle del usuario...</Text> : null}

      {selectedUser ? (
        <form id="admin-edit-user-form" onSubmit={detailForm.onSubmit(onSave)}>
          <Stack gap="blockGapLg">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" verticalSpacing="md">
              <TextInput
                label="Nombre completo"
                withAsterisk
                {...detailForm.getInputProps("fullName")}
              />
              <TextInput
                label="Correo electrónico"
                withAsterisk
                {...detailForm.getInputProps("email")}
              />
              <DniNumberInput
                label="DNI (Bloqueado)"
                description={
                  selectedUser.dni
                    ? "Inmutable por normativa institucional"
                    : "Ingresá DNI de 8 dígitos"
                }
                withAsterisk={roleUsesLegajo(detailForm.values.role)}
                value={detailForm.values.dni}
                error={detailForm.errors.dni}
                disabled={Boolean(selectedUser.dni)}
                onChange={(value) =>
                  detailForm.setFieldValue(
                    "dni",
                    String(value ?? "").replace(/\D/g, "").slice(0, 8),
                  )
                }
              />
              <TextInput
                label="Legajo (Bloqueado)"
                description="Identificador único correlativo"
                value={selectedUser.legajo ?? "Sin asignar"}
                readOnly
                disabled
              />
              <TextInput
                label="Teléfono de contacto"
                placeholder="Ej. 3624..."
                {...detailForm.getInputProps("phone")}
              />
              <TextInput
                label="Domicilio"
                placeholder="Ej. Av. 9 de Julio 1250"
                {...detailForm.getInputProps("address")}
              />
              {detailForm.values.role === "docente" ? (
                <TextInput
                  label="Especialidad / Título"
                  placeholder="Ej. Profesorado en Matemática"
                  {...detailForm.getInputProps("specialty")}
                />
              ) : null}
              <Select
                label="Rol"
                data={USER_ROLE_OPTIONS}
                withAsterisk
                {...detailForm.getInputProps("role")}
              />
              {detailForm.values.role === "tutor" ? (
                <DniNumberInput
                  label="DNI del alumno vinculado"
                  placeholder="DNI del alumno existente"
                  value={detailForm.values.tutorStudentDni}
                  error={detailForm.errors.tutorStudentDni}
                  onChange={(value) =>
                    detailForm.setFieldValue(
                      "tutorStudentDni",
                      String(value ?? "").replace(/\D/g, "").slice(0, 8),
                    )
                  }
                />
              ) : null}
            </SimpleGrid>

            {detailForm.values.role === "alumno" ? (
              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap="md">
                  <Box>
                    <Text fw={700}>
                      Servicios Extracurriculares (Deportes, Transporte y Comedor)
                    </Text>
                    <Text size="sm" c="dimmed">
                      Máximo 2 deportes sin superposición horaria y asignación a 1 de los 4 recorridos de micro.
                    </Text>
                  </Box>
                  <MultiSelect
                    label="Deportes inscriptos (máx. 2)"
                    placeholder="Seleccionar hasta 2 disciplinas"
                    data={SPORT_OPTIONS}
                    maxValues={2}
                    clearable
                    searchable
                    {...detailForm.getInputProps("sports")}
                  />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      label="Recorrido de Transporte (Micro)"
                      data={TRANSPORT_ROUTE_OPTIONS}
                      {...detailForm.getInputProps("transportRoute")}
                    />
                    <Select
                      label="Servicio de Comedor"
                      data={DINING_SERVICE_OPTIONS}
                      {...detailForm.getInputProps("diningService")}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>
            ) : null}

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" verticalSpacing="md">
              <Box>
                <Text size="sm" fw={500} mb={6}>
                  Creado
                </Text>
                <Badge variant="light" color="brand.6" radius="xl">
                  {formatDateTime(selectedUser.createdAt)}
                </Badge>
              </Box>
              <Box>
                <Text size="sm" fw={500} mb={6}>
                  Último acceso
                </Text>
                <Text size="sm">{formatDateTime(selectedUser.lastSignInAt)}</Text>
              </Box>
              <Box>
                <Text size="sm" fw={500} mb={6}>
                  Solicitud asociada
                </Text>
                <Badge
                  variant="light"
                  color={getRequestStatusColor(selectedUser.requestStatus)}
                  radius="xl"
                >
                  {getRequestStatusLabel(selectedUser.requestStatus)}
                </Badge>
              </Box>
            </SimpleGrid>

            {selectedUser.requestStudentFullName ? (
              <Text size="sm" c="dimmed">
                Nombre de solicitud aprobada:{" "}
                <strong>{selectedUser.requestStudentFullName}</strong>
              </Text>
            ) : null}

            {selectedUser.dni ?? selectedUser.requestStudentDni ? (
              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap="sm">
                  <Text fw={600}>Acceso inicial del usuario</Text>
                  <Text size="sm" c="dimmed">
                    Podés restablecer la contraseña al DNI:{" "}
                    <strong>{selectedUser.dni ?? selectedUser.requestStudentDni}</strong>.
                  </Text>
                  <Group justify="flex-start">
                    <Button
                      type="button"
                      variant="light"
                      color="blue"
                      loading={isResettingPassword}
                      onClick={() => void onResetPasswordToDni()}
                    >
                      Restablecer contraseña al DNI
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ) : null}

            {selectedUser.role !== detailForm.values.role ? (
              <Textarea
                label="Motivo del cambio de rol"
                placeholder="Ej. reasignación operativa"
                minRows={3}
                required
                {...detailForm.getInputProps("reason")}
              />
            ) : null}

            <Stack gap="sm">
              <CTAButton
                type="submit"
                disabled={isSavingDetail || isLoadingDetail || !selectedUser}
                fullWidth
              >
                {isSavingDetail ? "Guardando..." : "Guardar cambios"}
              </CTAButton>
              <CTAButton
                type="button"
                ctaVariant="secondary"
                onClick={onClose}
                disabled={isSavingDetail}
                fullWidth
              >
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        </form>
      ) : null}
    </Drawer>
  );
}

