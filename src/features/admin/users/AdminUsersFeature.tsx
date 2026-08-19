"use client";

import { ActionIcon, Alert, Badge, Box, Button, Card, Drawer, Grid, GridCol, Group, NumberInput, PasswordInput, Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconEye, IconPencil, IconSearch, IconShieldPlus, IconTrash } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { roleUsesLegajo } from "@/lib/auth/legajo";
import { USER_ROLE_LABELS, USER_ROLE_OPTIONS, type AppUserRole } from "@/lib/auth/roles";
import { AdminPageLoader, AdminSectionCard, DniNumberInput, PageHeader, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { useAdminUsers } from "@/features/admin/users/useAdminUsers";
import type { AdminUser } from "@/features/admin/users/types";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { useStyles } from "@/components/templates/AdminUsersTemplate.style";

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

type AdminUsersFeatureProps = {
  breadcrumbs?: AdminBreadcrumb[];
  pageTitle?: string;
  loadingLabel?: string;
  createModalTitle?: string;
  createModalDescription?: string;
  defaultCreateRole?: AppUserRole;
  defaultRoleFilter?: AppUserRole | null;
  lockedRoleFilter?: AppUserRole | null;
};

const adminUsersBreadcrumbs: AdminBreadcrumb[] = [
  { label: "Admin", href: "/admin/usuarios" },
  { label: "Usuarios" },
];

const STUDENT_LEVEL_OPTIONS = [
  { value: "Inicial", label: "Inicial" },
  { value: "Primario", label: "Primario" },
  { value: "Secundario", label: "Secundario" },
];

function getRequestStatusLabel(status: string | null) {
  if (status === "pendiente") {
    return "Pendiente";
  }

  if (status === "en_revision") {
    return "En revisión";
  }

  if (status === "aprobada") {
    return "Aprobada";
  }

  if (status === "rechazada") {
    return "Rechazada";
  }

  return "Sin solicitud asociada";
}

function getRequestStatusColor(status: string | null) {
  if (status === "aprobada") {
    return "green";
  }

  if (status === "rechazada") {
    return "red";
  }

  if (status === "en_revision") {
    return "yellow";
  }

  if (status === "pendiente") {
    return "blue";
  }

  return "gray";
}

export default function AdminUsersFeature({
  breadcrumbs = adminUsersBreadcrumbs,
  pageTitle = "Usuarios",
  loadingLabel = "Cargando usuarios...",
  createModalTitle = "Nuevo usuario",
  createModalDescription = "Alta manual para alumnos, tutores, docentes, administrativos y no docentes.",
  defaultCreateRole = "alumno",
  defaultRoleFilter = null,
  lockedRoleFilter = null,
}: AdminUsersFeatureProps) {
  const { classes } = useStyles();
  const {
    users,
    isLoading,
    isCreating,
    isLoadingDetail,
    isSavingDetail,
    isDeletingUser,
    isResettingPassword,
    updatingUserId,
    loadError,
    detailError,
    isBootstrapping,
    requiresBootstrap,
    bootstrapStatus,
    createModalOpened,
    viewModalOpened,
    editModalOpened,
    deleteModalOpened,
    bootstrapModalOpened,
    selectedUser,
    pendingRoleChange,
    roleChangeReason,
    search,
    roleFilter,
    form,
    detailForm,
    deleteForm,
    bootstrapForm,
    filteredUsers,
    isInitialLoading,
    setCreateModalOpened,
    setBootstrapModalOpened,
    setPendingRoleChange,
    setRoleChangeReason,
    setSearch,
    setRoleFilter,
    loadUsers,
    handleBootstrapAdmin,
    handleCreateUser,
    handleOpenUserView,
    handleOpenUserEdit,
    handleCloseUserView,
    handleCloseUserEdit,
    handleOpenDeleteUser,
    handleCloseDeleteUser,
    handleDeleteUser,
    handleResetPasswordToDni,
    handleSaveUserDetail,
    handleConfirmRoleChange,
  } = useAdminUsers({
    defaultCreateRole,
    defaultRoleFilter,
    lockedRoleFilter,
  });
  const userTableColumns: ResponsiveDataTableColumn<AdminUser>[] = [
    {
      key: "name",
      header: <Text className={classes.tableHeader}>Usuario</Text>,
      mobileMinWidth: 240,
      render: (user) => (
        <Stack gap={4}>
          <Text fw={700} className={classes.userPrimary}>
            {user.fullName || "Sin nombre"}
          </Text>
          <Text size="sm" className={classes.userSecondary}>
            {user.email}
          </Text>
          <Text size="xs" c="dimmed">{user.legajo ?? user.id}</Text>
        </Stack>
      ),
    },
    {
      key: "role",
      header: <Text className={classes.tableHeader}>Rol</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (user) => (
        <Badge variant="light" color="brand.7" radius="xl">
          {USER_ROLE_LABELS[user.role] ?? user.role}
        </Badge>
      ),
    },
    {
      key: "created",
      header: <Text className={classes.tableHeader}>Alta</Text>,
      mobileMinWidth: 170,
      noWrap: true,
      render: (user) => (
        <Badge variant="light" color="brand.6" radius="xl">
          {formatDateTime(user.createdAt)}
        </Badge>
      ),
    },
    {
      key: "last-sign-in",
      header: <Text className={classes.tableHeader}>Último acceso</Text>,
      mobileMinWidth: 170,
      noWrap: true,
      render: (user) => <Text size="sm">{formatDateTime(user.lastSignInAt)}</Text>,
    },
    {
      key: "actions",
      header: <Text className={classes.tableHeader}>Acciones</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (user) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Ver usuario">
            <ActionIcon
              variant="transparent"
              radius="xl"
              size="lg"
              aria-label={`Ver ${user.fullName || user.email}`}
              onClick={() => void handleOpenUserView(user.id)}
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
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar usuario">
            <ActionIcon
              variant="transparent"
              radius="xl"
              size="lg"
              aria-label={`Editar ${user.fullName || user.email}`}
              onClick={() => void handleOpenUserEdit(user.id)}
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
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar usuario">
            <ActionIcon
              variant="transparent"
              radius="xl"
              size="lg"
              aria-label={`Eliminar ${user.fullName || user.email}`}
              onClick={() => void handleOpenDeleteUser(user.id)}
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
          </Tooltip>
        </Group>
      ),
    },
  ];

  const emptyUsersMessage =
    users.length === 0
      ? "No hay usuarios cargados o no tenés permisos para verlos."
      : "No hay resultados para los filtros actuales.";

  if (isInitialLoading) {
    return <AdminPageLoader breadcrumbs={[...breadcrumbs]} title={pageTitle} loadingLabel={loadingLabel} />;
  }

  return (
    <>
      <Drawer
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title={createModalTitle}
        position="right"
        size="min(100vw, 560px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">
            {createModalDescription}
          </Text>
        </Stack>

        <form id="admin-create-user-form" onSubmit={form.onSubmit(handleCreateUser)}>
          <Stack gap="blockGapLg">
            <SimpleGrid cols={1} spacing="lg" verticalSpacing="md">
              <TextInput label="Nombre completo" placeholder="Ej. Ana Pérez" description="Nombre visible." withAsterisk {...form.getInputProps("fullName")} />
              <TextInput label="Correo electrónico" placeholder="ana@email.com" description="Correo interno del usuario." withAsterisk {...form.getInputProps("email")} />
              <DniNumberInput label="DNI" placeholder="Solo números" description="Se usa como contraseña inicial en accesos por legajo." withAsterisk={roleUsesLegajo(form.values.role)} value={form.values.dni} error={form.errors.dni} onChange={(value) => form.setFieldValue("dni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
              {!roleUsesLegajo(form.values.role) ? (
                <PasswordInput label="Contraseña inicial" placeholder="Mínimo 6 caracteres" withAsterisk {...form.getInputProps("password")} />
              ) : null}
              <Select
                label="Rol"
                data={lockedRoleFilter ? USER_ROLE_OPTIONS.filter((option) => option.value === lockedRoleFilter) : [...USER_ROLE_OPTIONS]}
                disabled={Boolean(lockedRoleFilter)}
                withAsterisk
                {...form.getInputProps("role")}
              />

              {form.values.role === "tutor" ? (
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap="md">
                    <Box>
                      <Text fw={700}>Vinculación con alumno</Text>
                      <Text size="sm" c="dimmed">Buscamos el alumno por DNI y vinculamos este tutor a su seguimiento.</Text>
                    </Box>
                    <DniNumberInput label="DNI del alumno" placeholder="DNI del alumno existente" withAsterisk value={form.values.tutorStudentDni} error={form.errors.tutorStudentDni} onChange={(value) => form.setFieldValue("tutorStudentDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
                  </Stack>
                </Card>
              ) : null}

              {form.values.role === "alumno" ? (
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap="md">
                    <Box>
                      <Text fw={700}>Ficha inicial del alumno</Text>
                      <Text size="sm" c="dimmed">Se guarda aprobada directamente para que el campus ya tenga nivel, contacto y responsables.</Text>
                    </Box>
                    <Select label="Nivel" placeholder="Seleccioná un nivel" data={STUDENT_LEVEL_OPTIONS} withAsterisk {...form.getInputProps("level")} />
                    <NumberInput label="Teléfono de contacto" placeholder="Ej. 3624..." allowDecimal={false} allowNegative={false} clampBehavior="none" hideControls inputMode="numeric" isAllowed={({ value }) => /^\d{0,15}$/.test(value)} maxLength={15} thousandSeparator={false} trimLeadingZeroesOnBlur={false} type="tel" value={form.values.contactPhone} valueIsNumericString withAsterisk error={form.errors.contactPhone} onChange={(value) => form.setFieldValue("contactPhone", String(value ?? "").replace(/\D/g, "").slice(0, 15))} />
                    <Select
                      label="Responsable"
                      withAsterisk
                      data={[
                        { value: "tutor", label: "Tutor" },
                        { value: "parents", label: "Padre y madre" },
                      ]}
                      {...form.getInputProps("responsibleType")}
                    />
                    {form.values.responsibleType === "tutor" ? (
                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
                        <TextInput label="Nombre del tutor" withAsterisk {...form.getInputProps("tutorFullName")} />
                        <DniNumberInput label="DNI del tutor" withAsterisk value={form.values.tutorDni} error={form.errors.tutorDni} onChange={(value) => form.setFieldValue("tutorDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
                      </SimpleGrid>
                    ) : null}
                    {form.values.responsibleType === "parents" ? (
                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
                        <TextInput label="Nombre del padre" withAsterisk {...form.getInputProps("fatherFullName")} />
                        <DniNumberInput label="DNI del padre" withAsterisk value={form.values.fatherDni} error={form.errors.fatherDni} onChange={(value) => form.setFieldValue("fatherDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
                        <TextInput label="Nombre de la madre" withAsterisk {...form.getInputProps("motherFullName")} />
                        <DniNumberInput label="DNI de la madre" withAsterisk value={form.values.motherDni} error={form.errors.motherDni} onChange={(value) => form.setFieldValue("motherDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
                      </SimpleGrid>
                    ) : null}
                  </Stack>
                </Card>
              ) : null}

              <Stack gap="sm">
                <CTAButton
                  type="submit"
                  disabled={isCreating}
                  fullWidth
                >
                  {isCreating ? "Creando..." : "Crear usuario"}
                </CTAButton>
                <CTAButton
                  type="button"
                  ctaVariant="secondary"
                  onClick={() => setCreateModalOpened(false)}
                  disabled={isCreating}
                  fullWidth
                >
                  Cancelar
                </CTAButton>
              </Stack>
            </SimpleGrid>
          </Stack>
        </form>
      </Drawer>

      <Drawer
        opened={viewModalOpened}
        onClose={handleCloseUserView}
        title="Detalle del usuario"
        position="right"
        size="min(100vw, 760px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">Datos principales del usuario autenticable.</Text>
        </Stack>
        {detailError ? (
          <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
            {detailError}
          </Alert>
        ) : null}

        {isLoadingDetail ? <Text c="dimmed">Cargando detalle del usuario...</Text> : null}

        {selectedUser ? (
          <Card withBorder radius="md" p={{ base: "cardPadSm", md: "cardPadLg" }} className={classes.detailCard}>
            <Stack gap="sectionGapLg">
              <Box>
                <Group justify="space-between" align="flex-start" wrap="wrap">
                  <Box>
                    <Title order={3} c="brand.7">
                      {selectedUser.fullName || "Usuario sin nombre"}
                    </Title>
                    <Text size="sm" c="dimmed" mt={4}>
                      {selectedUser.email}
                    </Text>
                  </Box>
                  <Badge variant="light" color={getRequestStatusColor(selectedUser.requestStatus)} radius="xl" size="lg">
                    {getRequestStatusLabel(selectedUser.requestStatus)}
                  </Badge>
                </Group>
              </Box>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" verticalSpacing="lg">
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text className={classes.infoLabel}>Rol</Text>
                    <Text fw={700} className={classes.infoValue}>{USER_ROLE_LABELS[selectedUser.role] ?? selectedUser.role}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text className={classes.infoLabel}>Legajo</Text>
                    <Text ff="monospace" size="sm" className={classes.infoValue}>{selectedUser.legajo ?? "Sin asignar"}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text className={classes.infoLabel}>DNI</Text>
                    <Text fw={700} className={classes.infoValue}>{selectedUser.dni ?? "Sin dato"}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text className={classes.infoLabel}>ID de usuario</Text>
                    <Text ff="monospace" size="sm" className={classes.infoValue}>{selectedUser.id}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text className={classes.infoLabel}>Creado</Text>
                    <Text fw={700} className={classes.infoValue}>{formatDateTime(selectedUser.createdAt)}</Text>
                  </Stack>
                </Card>
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap={6}>
                    <Text className={classes.infoLabel}>Último acceso</Text>
                    <Text fw={700} className={classes.infoValue}>{formatDateTime(selectedUser.lastSignInAt)}</Text>
                  </Stack>
                </Card>
              </SimpleGrid>

              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap={6}>
                  <Text className={classes.infoLabel}>Solicitud asociada</Text>
                  <Text fw={700} className={classes.infoValue}>{selectedUser.requestStudentFullName || "Sin solicitud vinculada"}</Text>
                  {(selectedUser.dni ?? selectedUser.requestStudentDni) ? (
                    <Text size="sm" c="dimmed">DNI vinculado: <strong>{selectedUser.dni ?? selectedUser.requestStudentDni}</strong></Text>
                  ) : null}
                  {selectedUser.dni ?? selectedUser.requestStudentDni ? (
                    <Alert variant="light" color="blue" radius="md" title="Acceso inicial">
                      La contraseña inicial es el DNI del usuario: <strong>{selectedUser.dni ?? selectedUser.requestStudentDni}</strong>.
                    </Alert>
                  ) : null}
                </Stack>
              </Card>

              {selectedUser.linkedGuardians.length > 0 ? (
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap="sm">
                    <Text className={classes.infoLabel}>Tutores vinculados</Text>
                    {selectedUser.linkedGuardians.map((guardian) => (
                      <Box key={guardian.profileId}>
                        <Text size="sm"><strong>{guardian.fullName}</strong> · {guardian.relationshipType}</Text>
                        <Text size="sm" c="dimmed">DNI {guardian.dni}{guardian.isPrimary ? " · principal" : ""}</Text>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              ) : null}

              {selectedUser.linkedStudents.length > 0 ? (
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap="sm">
                    <Text className={classes.infoLabel}>Alumnos vinculados</Text>
                    {selectedUser.linkedStudents.map((student) => (
                      <Box key={student.profileId}>
                        <Text size="sm"><strong>{student.fullName}</strong> · {student.relationshipType}</Text>
                        <Text size="sm" c="dimmed">DNI {student.dni}{student.isPrimary ? " · principal" : ""}</Text>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              ) : null}

              {selectedUser.requestLevel || selectedUser.requestContactPhone || selectedUser.requestResponsibleType ? (
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap="sm">
                    <Text className={classes.infoLabel}>Ficha del alumno</Text>
                    {selectedUser.requestLevel ? (
                      <Text size="sm">Nivel: <strong>{selectedUser.requestLevel}</strong></Text>
                    ) : null}
                    {selectedUser.requestContactPhone ? (
                      <Text size="sm">Teléfono: <strong>{selectedUser.requestContactPhone}</strong></Text>
                    ) : null}
                    {selectedUser.requestResponsibleType === "tutor" ? (
                      <Stack gap={4}>
                        <Text size="sm">Tutor: <strong>{selectedUser.requestTutorFullName || "Sin dato"}</strong></Text>
                        {selectedUser.requestTutorDni ? (
                          <Text size="sm" c="dimmed">DNI del tutor: <strong>{selectedUser.requestTutorDni}</strong></Text>
                        ) : null}
                      </Stack>
                    ) : null}
                    {selectedUser.requestResponsibleType === "parents" ? (
                      <Stack gap={4}>
                        <Text size="sm">Padre: <strong>{selectedUser.requestFatherFullName || "Sin dato"}</strong></Text>
                        {selectedUser.requestFatherDni ? (
                          <Text size="sm" c="dimmed">DNI del padre: <strong>{selectedUser.requestFatherDni}</strong></Text>
                        ) : null}
                        <Text size="sm">Madre: <strong>{selectedUser.requestMotherFullName || "Sin dato"}</strong></Text>
                        {selectedUser.requestMotherDni ? (
                          <Text size="sm" c="dimmed">DNI de la madre: <strong>{selectedUser.requestMotherDni}</strong></Text>
                        ) : null}
                      </Stack>
                    ) : null}
                  </Stack>
                </Card>
              ) : null}
            </Stack>
          </Card>
        ) : null}
        <Stack gap="sm" mt="lg">
          <CTAButton type="button" ctaVariant="secondary" onClick={handleCloseUserView} fullWidth>
            Cerrar
          </CTAButton>
        </Stack>
      </Drawer>

      <Drawer
        opened={editModalOpened}
        onClose={handleCloseUserEdit}
        title="Editar usuario"
        position="right"
        size="min(100vw, 760px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">Actualizá los datos principales del usuario autenticable.</Text>
        </Stack>
        {detailError ? (
          <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
            {detailError}
          </Alert>
        ) : null}

        {isLoadingDetail ? <Text c="dimmed">Cargando detalle del usuario...</Text> : null}

        {selectedUser ? (
          <form id="admin-edit-user-form" onSubmit={detailForm.onSubmit(handleSaveUserDetail)}>
            <Stack gap="blockGapLg">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" verticalSpacing="md">
                <TextInput label="Nombre completo" withAsterisk {...detailForm.getInputProps("fullName")} />
                <TextInput label="Correo electrónico" withAsterisk {...detailForm.getInputProps("email")} />
                <DniNumberInput label="DNI" withAsterisk={roleUsesLegajo(detailForm.values.role)} value={detailForm.values.dni} error={detailForm.errors.dni} onChange={(value) => detailForm.setFieldValue("dni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
                <Select label="Rol" data={USER_ROLE_OPTIONS} withAsterisk {...detailForm.getInputProps("role")} />
                <TextInput label="Legajo" value={selectedUser.legajo ?? "Sin asignar"} readOnly />
                {detailForm.values.role === "tutor" ? (
                  <DniNumberInput label="DNI del alumno vinculado" placeholder="DNI del alumno existente" value={detailForm.values.tutorStudentDni} error={detailForm.errors.tutorStudentDni} onChange={(value) => detailForm.setFieldValue("tutorStudentDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))} />
                ) : null}
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" verticalSpacing="md">
                <Box>
                  <Text size="sm" fw={500} mb={6}>Creado</Text>
                  <Badge variant="light" color="brand.6" radius="xl">{formatDateTime(selectedUser.createdAt)}</Badge>
                </Box>
                <Box>
                  <Text size="sm" fw={500} mb={6}>Último acceso</Text>
                  <Text size="sm">{formatDateTime(selectedUser.lastSignInAt)}</Text>
                </Box>
                <Box>
                  <Text size="sm" fw={500} mb={6}>Solicitud asociada</Text>
                  <Badge variant="light" color={getRequestStatusColor(selectedUser.requestStatus)} radius="xl">{getRequestStatusLabel(selectedUser.requestStatus)}</Badge>
                </Box>
              </SimpleGrid>

              {selectedUser.requestStudentFullName ? (
                <Text size="sm" c="dimmed">Nombre de solicitud aprobada: <strong>{selectedUser.requestStudentFullName}</strong></Text>
              ) : null}

              {selectedUser.dni ?? selectedUser.requestStudentDni ? (
                <Card withBorder radius="md" p="md" bg="white">
                  <Stack gap="sm">
                    <Text fw={600}>Acceso inicial del usuario</Text>
                    <Text size="sm" c="dimmed">
                      Podés restablecer la contraseña al DNI: <strong>{selectedUser.dni ?? selectedUser.requestStudentDni}</strong>.
                    </Text>
                    <Group justify="flex-start">
                      <Button type="button" variant="light" color="blue" loading={isResettingPassword} onClick={() => void handleResetPasswordToDni()}>
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
                  onClick={handleCloseUserEdit}
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

      <Drawer
        opened={deleteModalOpened}
        onClose={handleCloseDeleteUser}
        title="Eliminar usuario"
        position="right"
        size="min(100vw, 560px)"
        padding="xl"
      >
        {selectedUser ? (
          <form id="admin-delete-user-form" onSubmit={deleteForm.onSubmit(handleDeleteUser)}>
            <Stack gap="blockGapLg">
              <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
                Vas a eliminar <strong>{selectedUser.fullName || selectedUser.email}</strong>. Esta acción borra su acceso y su perfil relacional asociado.
              </Alert>
              <Textarea
                label="Justificación"
                placeholder="Ej. baja solicitada por administración"
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
                  {isDeletingUser ? "Eliminando..." : "Eliminar usuario"}
                </Button>
                <CTAButton type="button" ctaVariant="secondary" onClick={handleCloseDeleteUser} disabled={isDeletingUser} fullWidth>
                  Cancelar
                </CTAButton>
              </Stack>
            </Stack>
          </form>
        ) : null}
      </Drawer>

      <Drawer
        opened={bootstrapModalOpened}
        onClose={() => setBootstrapModalOpened(false)}
        title="Bootstrap del primer administrador"
        position="right"
        size="min(100vw, 560px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">Crealo una sola vez si todavía no existe un usuario administrativo.</Text>
        </Stack>
        <form id="admin-bootstrap-form" onSubmit={bootstrapForm.onSubmit(handleBootstrapAdmin)}>
          <Stack gap="blockGapLg">
            <TextInput label="Nombre completo" placeholder="Ej. Admin Principal" withAsterisk {...bootstrapForm.getInputProps("fullName")} />
            <TextInput label="Correo electrónico" placeholder="admin@email.com" withAsterisk {...bootstrapForm.getInputProps("email")} />
            <PasswordInput label="Contraseña" placeholder="Mínimo 6 caracteres" withAsterisk {...bootstrapForm.getInputProps("password")} />
            {bootstrapStatus?.requiresSecret ? (
              <PasswordInput label="Clave de bootstrap" placeholder="Ingresá ADMIN_BOOTSTRAP_SECRET" withAsterisk {...bootstrapForm.getInputProps("bootstrapSecret")} />
            ) : null}
            <Stack gap="sm">
              <CTAButton type="submit" disabled={isBootstrapping || bootstrapStatus?.enabled === false} fullWidth>
                {isBootstrapping ? "Creando administrador..." : "Crear primer administrador"}
              </CTAButton>
              <CTAButton type="button" ctaVariant="secondary" onClick={() => setBootstrapModalOpened(false)} disabled={isBootstrapping} fullWidth>
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        </form>
      </Drawer>

      <Drawer
        opened={Boolean(pendingRoleChange)}
        onClose={() => {
          setPendingRoleChange(null);
          setRoleChangeReason("");
        }}
        title="Confirmar cambio de rol"
        position="right"
        size="min(100vw, 520px)"
        padding="xl"
      >
        <Stack gap="xs" mb="lg">
          <Text size="sm" c="dimmed">Dejá un motivo breve para la auditoría interna.</Text>
        </Stack>
        {pendingRoleChange ? (
          <Stack gap="blockGapLg">
            <Alert variant="filled" color="yellow" radius="md" icon={<IconAlertCircle size={18} />}>
              Vas a cambiar el rol de <strong>{pendingRoleChange.userLabel}</strong> a <strong>{USER_ROLE_LABELS[pendingRoleChange.nextRole]}</strong>.
            </Alert>

            <Textarea
              label="Motivo del cambio"
              placeholder="Ej. reasignación operativa"
              minRows={3}
              value={roleChangeReason}
              onChange={(event) => setRoleChangeReason(event.currentTarget.value)}
              required
            />
            <Stack gap="sm">
              <CTAButton type="button" disabled={updatingUserId !== null} onClick={handleConfirmRoleChange} fullWidth>
                {updatingUserId ? "Guardando..." : "Confirmar cambio"}
              </CTAButton>
              <CTAButton
                type="button"
                ctaVariant="secondary"
                onClick={() => {
                  setPendingRoleChange(null);
                  setRoleChangeReason("");
                }}
                disabled={updatingUserId !== null}
                fullWidth
              >
                Cancelar
              </CTAButton>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>

      <Stack gap="pageGapSm" className={classes.page}>
        <PageHeader title={pageTitle} breadcrumbs={breadcrumbs} />

        {loadError && !requiresBootstrap ? (
          <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
            {loadError}
          </Alert>
        ) : null}

        {requiresBootstrap && bootstrapStatus?.enabled === false ? (
          <Alert variant="filled" color="yellow" radius="md" icon={<IconAlertCircle size={18} />}>
            {bootstrapStatus.lockedReason}
          </Alert>
        ) : null}

        {requiresBootstrap ? (
          <Card withBorder radius="md" p={{ base: "cardPadSm", md: "cardPadLg" }}>
            <Stack gap="sectionGapLg">
              <Box>
                <Group gap="sm" align="center">
                  <IconShieldPlus size={22} />
                  <Title order={4} c="brand.7">Bootstrap del primer administrador</Title>
                </Group>
                <Text size="sm" c="dimmed" mt={6}>
                  El panel se habilita cuando exista un usuario con rol administrativo.
                </Text>
              </Box>

              <Group justify="space-between" align="flex-end">
                <Text size="sm" c="dimmed" maw={520}>
                  Si todavía no existe, podés crearlo desde acá.
                </Text>

                <Group>
                  <Button variant="default" onClick={() => void loadUsers()} loading={isLoading}>Revalidar</Button>
                  <CTAButton type="button" onClick={() => setBootstrapModalOpened(true)} disabled={bootstrapStatus?.enabled === false}>
                    Crear primer administrador
                  </CTAButton>
                </Group>
              </Group>
            </Stack>
          </Card>
        ) : null}

        <AdminSectionCard
          compact
          overlayVisible={isLoading && users.length > 0}
        >
          <Grid gutter="md" mb="md" align="end" className={classes.filtersGrid}>
            <GridCol span={{ base: 12, md: lockedRoleFilter ? 12 : 6 }}>
              <TextInput
                label="Buscar"
                placeholder="Nombre o email"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
              />
            </GridCol>
            {!lockedRoleFilter ? (
              <GridCol span={{ base: 12, md: 6 }}>
                <Select
                  label="Rol"
                  placeholder="Todos"
                  data={USER_ROLE_OPTIONS}
                  value={roleFilter}
                  onChange={(value) => setRoleFilter((value as AppUserRole | null) ?? null)}
                  clearable
                />
              </GridCol>
            ) : null}
          </Grid>

          <ResponsiveDataTable
            data={filteredUsers}
            columns={userTableColumns}
            rowKey={(user) => user.id}
            emptyMessage={emptyUsersMessage}
            loading={isLoading}
          />
        </AdminSectionCard>
      </Stack>
    </>
  );
}
