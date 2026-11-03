"use client";

import { Alert, Badge, Box, Button, Drawer, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendar,
  IconCopy,
  IconEyeOff,
  IconId,
  IconLink,
  IconPencil,
  IconShieldCheck,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import { RoleBadge } from "@/components/molecules";
import { USER_ROLE_LABELS } from "@/lib/auth/roles";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import type { AdminUserDetail } from "../types";
import {
  getRequestStatusLabel,
  getRoleDescription,
} from "../userUtils";

type AdminUserViewDrawerProps = {
  opened: boolean;
  onClose: () => void;
  classes: Record<string, string>;
  isLoadingDetail: boolean;
  detailError: string | null;
  selectedUser: AdminUserDetail | null;
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
};

export function AdminUserViewDrawer({
  opened,
  onClose,
  classes,
  isLoadingDetail,
  detailError,
  selectedUser,
  onEdit,
  onDelete,
}: AdminUserViewDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" wrap="nowrap" align="center">
          <Box className={classes.drawerHeaderIconCircle}>
            <IconUser size={18} />
          </Box>
          <Box>
            <Text fw={700} size="md" c="#0f172a" style={{ lineHeight: 1.2 }}>
              Detalle del usuario
            </Text>
            <Text size="xs" c="#94a3b8" style={{ lineHeight: 1.2 }}>
              Datos principales del usuario autenticable.
            </Text>
          </Box>
        </Group>
      }
      position="right"
      size="min(100vw, 680px)"
      padding="xl"
    >
      {detailError ? (
        <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
          {detailError}
        </Alert>
      ) : null}

      {isLoadingDetail ? <Text c="dimmed">Cargando detalle del usuario...</Text> : null}

      {selectedUser ? (
        <Stack gap="md" mt="md">
          <Box className={classes.detailHeroCard}>
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
              <Group gap="md" align="center">
                <Stack gap={3}>
                  <Text className={classes.detailHeroName}>
                    {selectedUser.fullName || "Usuario sin nombre"}
                  </Text>
                  <Group gap={4} align="center">
                    <Text fw={700} size="sm" c="#94a3b8">
                      @
                    </Text>
                    <Text className={classes.detailHeroEmail}>{selectedUser.email}</Text>
                  </Group>
                  <Box mt={4}>
                    <span className={classes.detailIdBadge}>
                      ID: {selectedUser.legajo ?? selectedUser.id.slice(0, 8)}
                      <button
                        type="button"
                        className={classes.copyBtn}
                        title="Copiar ID"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedUser.legajo ?? selectedUser.id,
                          );
                        }}
                      >
                        <IconCopy size={13} />
                      </button>
                    </span>
                  </Box>
                </Stack>
              </Group>

              <Stack gap="xs" align="flex-end">
                <RoleBadge role={selectedUser.role} />
                {selectedUser.status === "inactivo" || selectedUser.isActive === false ? (
                  <Badge variant="light" color="red" radius="xl">
                    Inactivo (Baja lógica)
                  </Badge>
                ) : (
                  <span className={classes.statusActiveBadge}>
                    <span className={classes.greenDot} /> Activo
                  </span>
                )}
              </Stack>
            </Group>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconUser size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>ROL</span>
                <div className={classes.detailCardValue}>
                  {USER_ROLE_LABELS[selectedUser.role] ?? selectedUser.role}
                </div>
                <span className={classes.detailCardSub}>
                  {getRoleDescription(selectedUser.role)}
                </span>
              </Box>
            </Box>

            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconShieldCheck size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>PERMISOS</span>
                <div className={classes.detailCardValue}>
                  {getRequestStatusLabel(selectedUser.requestStatus)}
                </div>
                <span className={classes.detailCardSub}>
                  No tiene permisos extraordinarios asignados.
                </span>
              </Box>
            </Box>

            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconCalendar size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>DNI</span>
                <div className={classes.detailCardValue}>
                  {selectedUser.dni ?? "Sin dato"}
                </div>
              </Box>
            </Box>

            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconId size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>LEGAJO</span>
                <div className={classes.detailCardValue}>
                  {selectedUser.legajo ?? "Sin asignar"}
                </div>
              </Box>
            </Box>

            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconCalendar size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>CREADO</span>
                <div className={classes.detailCardValue}>
                  {formatDateTime(selectedUser.createdAt)}
                </div>
                <span className={classes.detailCardSub}>
                  Usuario registrado en el sistema.
                </span>
              </Box>
            </Box>

            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconEyeOff size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>ÚLTIMO ACCESO</span>
                <div className={classes.detailCardValue}>
                  {selectedUser.lastSignInAt
                    ? formatDateTime(selectedUser.lastSignInAt)
                    : "Sin registro"}
                </div>
                <span className={classes.detailCardSub}>
                  {selectedUser.lastSignInAt
                    ? "Fecha del último acceso al sistema."
                    : "Aún no se ha registrado un acceso."}
                </span>
              </Box>
            </Box>

            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconUser size={20} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <span className={classes.detailCardLabel}>CONTACTO Y DOMICILIO</span>
                <div className={classes.detailCardValue}>
                  {selectedUser.phone ?? "Sin teléfono"}
                </div>
                <span className={classes.detailCardSub}>
                  {selectedUser.address
                    ? `Domicilio: ${selectedUser.address}`
                    : "Sin domicilio registrado"}
                  {selectedUser.specialty ? ` · Especialidad: ${selectedUser.specialty}` : ""}
                </span>
              </Box>
            </Box>

            {selectedUser.role === "alumno" ? (
              <Box className={classes.detailInfoCard}>
                <Box className={classes.detailIconCircle}>
                  <IconShieldCheck size={20} />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <span className={classes.detailCardLabel}>
                    EXTRACURRICULARES Y SERVICIOS
                  </span>
                  <div className={classes.detailCardValue}>
                    {selectedUser.sports.length > 0
                      ? selectedUser.sports.join(", ")
                      : "Sin deportes"}
                  </div>
                  <span className={classes.detailCardSub}>
                    Transporte: {selectedUser.transportRoute} · Comedor:{" "}
                    {selectedUser.diningService}
                  </span>
                </Box>
              </Box>
            ) : null}
          </SimpleGrid>

          <Box className={classes.detailInfoCard}>
            <Box className={classes.detailIconCircle}>
              <IconLink size={20} />
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <span className={classes.detailCardLabel}>SOLICITUD ASOCIADA</span>
              <div className={classes.detailCardValue}>
                {selectedUser.requestStudentFullName || "Sin solicitud vinculada"}
              </div>
              {(selectedUser.dni ?? selectedUser.requestStudentDni) ? (
                <span className={classes.detailCardSub}>
                  DNI vinculado: {selectedUser.dni ?? selectedUser.requestStudentDni}
                </span>
              ) : null}
            </Box>
          </Box>

          {selectedUser.linkedGuardians.length > 0 ? (
            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconUser size={20} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text className={classes.detailCardLabel}>TUTORES VINCULADOS</Text>
                <Stack gap={4} mt={4}>
                  {selectedUser.linkedGuardians.map((guardian) => (
                    <Box key={guardian.profileId}>
                      <Text size="sm" fw={600}>
                        {guardian.fullName} · {guardian.relationshipType}
                      </Text>
                      <Text size="xs" c="dimmed">
                        DNI {guardian.dni}
                        {guardian.isPrimary ? " · principal" : ""}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          ) : null}

          {selectedUser.linkedStudents.length > 0 ? (
            <Box className={classes.detailInfoCard}>
              <Box className={classes.detailIconCircle}>
                <IconUser size={20} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text className={classes.detailCardLabel}>ALUMNOS VINCULADOS</Text>
                <Stack gap={4} mt={4}>
                  {selectedUser.linkedStudents.map((student) => (
                    <Box key={student.profileId}>
                      <Text size="sm" fw={600}>
                        {student.fullName} · {student.relationshipType}
                      </Text>
                      <Text size="xs" c="dimmed">
                        DNI {student.dni}
                        {student.isPrimary ? " · principal" : ""}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          ) : null}

          <Group justify="flex-end" gap="sm" mt="lg" pt="md" style={{ borderTop: "1px solid #f1f5f9" }}>
            {onDelete ? (
              <Button
                variant="subtle"
                color="red"
                size="sm"
                radius="md"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  onClose();
                  onDelete(selectedUser.id);
                }}
              >
                Dar de baja
              </Button>
            ) : null}

            {onEdit ? (
              <Button
                variant="filled"
                color="blue"
                size="sm"
                radius="md"
                leftSection={<IconPencil size={16} />}
                onClick={() => {
                  onClose();
                  onEdit(selectedUser.id);
                }}
              >
                Editar usuario
              </Button>
            ) : null}
          </Group>
        </Stack>
      ) : null}
    </Drawer>
  );
}

