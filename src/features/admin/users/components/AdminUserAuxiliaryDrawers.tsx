"use client";

import {
  Alert,
  Button,
  Drawer,
  PasswordInput,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconAlertCircle, IconTrash } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { USER_ROLE_LABELS } from "@/lib/auth/roles";
import type {
  AdminBootstrapStatus,
  AdminUserDetail,
  BootstrapAdminValues,
  DeleteUserValues,
  PendingRoleChange,
} from "../types";

type AdminUserAuxiliaryDrawersProps = {
  deleteModalOpened: boolean;
  onCloseDeleteUser: () => void;
  selectedUser: AdminUserDetail | null;
  deleteForm: UseFormReturnType<DeleteUserValues>;
  isDeletingUser: boolean;
  onDeleteUser: (values: DeleteUserValues) => Promise<void>;

  bootstrapModalOpened: boolean;
  onCloseBootstrap: () => void;
  bootstrapStatus: AdminBootstrapStatus | null;
  bootstrapForm: UseFormReturnType<BootstrapAdminValues>;
  isBootstrapping: boolean;
  onBootstrapAdmin: (values: BootstrapAdminValues) => Promise<void>;

  pendingRoleChange: PendingRoleChange | null;
  roleChangeReason: string;
  updatingUserId: string | null;
  onRoleChangeReasonChange: (value: string) => void;
  onConfirmRoleChange: () => Promise<void>;
  onCloseRoleChange: () => void;
};

export function AdminUserAuxiliaryDrawers({
  deleteModalOpened,
  onCloseDeleteUser,
  selectedUser,
  deleteForm,
  isDeletingUser,
  onDeleteUser,
  bootstrapModalOpened,
  onCloseBootstrap,
  bootstrapStatus,
  bootstrapForm,
  isBootstrapping,
  onBootstrapAdmin,
  pendingRoleChange,
  roleChangeReason,
  updatingUserId,
  onRoleChangeReasonChange,
  onConfirmRoleChange,
  onCloseRoleChange,
}: AdminUserAuxiliaryDrawersProps) {
  return (
    <>
      <Drawer
        opened={deleteModalOpened}
        onClose={onCloseDeleteUser}
        title="Baja lógica de usuario"
        position="right"
        size="min(100vw, 560px)"
        padding="xl"
      >
        {selectedUser ? (
          <form id="admin-delete-user-form" onSubmit={deleteForm.onSubmit(onDeleteUser)}>
            <Stack gap="blockGapLg">
              <Alert
                variant="filled"
                color="red"
                radius="md"
                icon={<IconAlertCircle size={18} />}
              >
                Vas a dar de <strong>baja lógica (estado Inactivo)</strong> a{" "}
                <strong>{selectedUser.fullName || selectedUser.email}</strong>. Se bloqueará su acceso al sistema preservando íntegramente su historial académico, materias, notas y asistencias.
              </Alert>
              <Textarea
                label="Justificación de la baja"
                placeholder="Ej. pase a otra institución / fin de ciclo"
                minRows={4}
                required
                {...deleteForm.getInputProps("reason")}
              />
              <Stack gap="sm">
                <Button
                  type="submit"
                  leftSection={<IconTrash size={18} />}
                  color="red"
                  radius="xl"
                  size="xl"
                  fullWidth
                  loading={isDeletingUser}
                  disabled={isDeletingUser}
                  style={{ minHeight: 56, fontWeight: 700 }}
                >
                  {isDeletingUser
                    ? "Aplicando baja lógica..."
                    : "Confirmar baja lógica (Inactivo)"}
                </Button>
                <CTAButton
                  type="button"
                  ctaVariant="secondary"
                  onClick={onCloseDeleteUser}
                  disabled={isDeletingUser}
                  fullWidth
                >
                  Cancelar
                </CTAButton>
              </Stack>
            </Stack>
          </form>
        ) : null}
      </Drawer>

      <Drawer
        opened={bootstrapModalOpened}
        onClose={onCloseBootstrap}
        title="Bootstrap del primer administrador"
        position="right"
        size="min(100vw, 560px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">
            Crealo una sola vez si todavía no existe un usuario administrativo.
          </Text>
        </Stack>
        <form id="admin-bootstrap-form" onSubmit={bootstrapForm.onSubmit(onBootstrapAdmin)}>
          <Stack gap="blockGapLg">
            <TextInput
              label="Nombre completo"
              placeholder="Ej. Admin Principal"
              withAsterisk
              {...bootstrapForm.getInputProps("fullName")}
            />
            <TextInput
              label="Correo electrónico"
              placeholder="admin@email.com"
              withAsterisk
              {...bootstrapForm.getInputProps("email")}
            />
            <PasswordInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              withAsterisk
              {...bootstrapForm.getInputProps("password")}
            />
            {bootstrapStatus?.requiresSecret ? (
              <PasswordInput
                label="Clave de bootstrap"
                placeholder="Ingresá ADMIN_BOOTSTRAP_SECRET"
                withAsterisk
                {...bootstrapForm.getInputProps("bootstrapSecret")}
              />
            ) : null}
            <Stack gap="sm">
              <CTAButton
                type="submit"
                disabled={isBootstrapping || bootstrapStatus?.enabled === false}
                fullWidth
              >
                {isBootstrapping ? "Creando administrador..." : "Crear primer administrador"}
              </CTAButton>
              <CTAButton
                type="button"
                ctaVariant="secondary"
                onClick={onCloseBootstrap}
                disabled={isBootstrapping}
                fullWidth
              >
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        </form>
      </Drawer>

      <Drawer
        opened={Boolean(pendingRoleChange)}
        onClose={onCloseRoleChange}
        title="Confirmar cambio de rol"
        position="right"
        size="min(100vw, 520px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">
            Dejá un motivo breve para la auditoría interna.
          </Text>
        </Stack>
        {pendingRoleChange ? (
          <Stack gap="blockGapLg">
            <Alert
              variant="filled"
              color="yellow"
              radius="md"
              icon={<IconAlertCircle size={18} />}
            >
              Vas a cambiar el rol de <strong>{pendingRoleChange.userLabel}</strong> a{" "}
              <strong>{USER_ROLE_LABELS[pendingRoleChange.nextRole]}</strong>.
            </Alert>

            <Textarea
              label="Motivo del cambio"
              placeholder="Ej. reasignación operativa"
              minRows={3}
              value={roleChangeReason}
              onChange={(event) => onRoleChangeReasonChange(event.currentTarget.value)}
              required
            />
            <Stack gap="sm">
              <CTAButton
                type="button"
                disabled={updatingUserId !== null}
                onClick={() => void onConfirmRoleChange()}
                fullWidth
              >
                {updatingUserId ? "Guardando..." : "Confirmar cambio"}
              </CTAButton>
              <CTAButton
                type="button"
                ctaVariant="secondary"
                onClick={onCloseRoleChange}
                disabled={updatingUserId !== null}
                fullWidth
              >
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>
    </>
  );
}

