"use client";

import { ActionIcon, Alert, Badge, Box, Button, Card, Drawer, Grid, GridCol, Group, Menu, NumberInput, PasswordInput, Select, SimpleGrid, Stack, Text, Textarea, TextInput, Title, Tooltip } from "@mantine/core";
import { IconAlertCircle, IconAt, IconCalendar, IconChevronDown, IconChevronLeft, IconChevronRight, IconClock, IconCopy, IconCreditCard, IconEye, IconEyeOff, IconId, IconLink, IconPencil, IconPlus, IconRefresh, IconSearch, IconShield, IconShieldCheck, IconShieldPlus, IconTrash, IconUser, IconUsers } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { roleUsesLegajo } from "@/lib/auth/legajo";
import { USER_ROLE_LABELS, USER_ROLE_OPTIONS, type AppUserRole } from "@/lib/auth/roles";
import { AdminPageLoader, AdminSectionCard, DniNumberInput, PageHeader, ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import { useAdminUsers } from "@/features/admin/users/useAdminUsers";
import type { AdminUser } from "@/features/admin/users/types";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { useStyles } from "@/components/templates/AdminUsersTemplate.style";

function getRoleDescription(role: string): string {
  if (role === "tutor") return "Puede gestionar y acompañar a los estudiantes a su cargo.";
  if (role === "docente") return "Puede gestionar calificaciones, asistencias y contenidos de sus cursos.";
  if (role === "alumno") return "Acceso a cursos, calificaciones, materiales y ficha del estudiante.";
  if (role === "administrativo") return "Acceso completo a la gestión del campus y usuarios.";
  if (role === "no_docente") return "Acceso a gestiones operativas y administrativas asignadas.";
  return "Usuario del sistema.";
}

function getUserInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

function getUserAvatarBg(role: string, name?: string | null): string {
  if (role === "administrativo") return "#2563eb";
  if (role === "tutor") {
    if (name?.toLowerCase().includes("ricardo")) return "#16a34a";
    if (name?.toLowerCase().includes("carolina")) return "#db2777";
    return "#7c3aed";
  }
  if (role === "docente") {
    if (name?.toLowerCase().includes("agustin")) return "#d97706";
    if (name?.toLowerCase().includes("nicolas")) return "#4f46e5";
    return "#0d9488";
  }
  return "#2563eb";
}

function renderRoleBadge(role: string, classes: Record<string, string>) {
  if (role === "administrativo") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeAdmin}`}>
        <IconShieldCheck size={14} /> ADMINISTRATIVO
      </span>
    );
  }
  if (role === "tutor") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeTutor}`}>
        <IconUser size={14} /> TUTOR
      </span>
    );
  }
  if (role === "docente") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeDocente}`}>
        <IconShieldCheck size={14} /> DOCENTE
      </span>
    );
  }
  if (role === "alumno") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeAlumno}`}>
        <IconUser size={14} /> ALUMNO
      </span>
    );
  }
  return (
    <span className={`${classes.roleBadge} ${classes.badgeNoDocente}`}>
      <IconUser size={14} /> {USER_ROLE_LABELS[role as AppUserRole] ?? role}
    </span>
  );
}

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
      header: <Text className={classes.tableHeader}>USUARIO</Text>,
      mobileMinWidth: 260,
      render: (user) => {
        const initials = getUserInitials(user.fullName, user.email);
        const avatarBg = getUserAvatarBg(user.role, user.fullName);

        return (
          <Box className={classes.userCell}>
            <Box className={classes.userAvatar} style={{ backgroundColor: avatarBg }}>
              {initials}
            </Box>
            <Stack gap={2}>
              <Text className={classes.userPrimary}>
                {user.fullName || "Sin nombre"}
              </Text>
              <Text className={classes.userSecondary}>
                {user.email}
              </Text>
              <Text className={classes.userId}>
                {user.legajo ?? user.id}
              </Text>
            </Stack>
          </Box>
        );
      },
    },
    {
      key: "role",
      header: <Text className={classes.tableHeader}>ROL</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (user) => renderRoleBadge(user.role, classes),
    },
    {
      key: "status",
      header: <Text className={classes.tableHeader}>ESTADO</Text>,
      mobileMinWidth: 130,
      noWrap: true,
      render: (user) => {
        const isInactive = user.status === "inactivo" || user.isActive === false;
        return (
          <Badge
            variant="light"
            color={isInactive ? "red" : "green"}
            radius="sm"
            size="sm"
            style={{ fontWeight: 600, textTransform: "uppercase" }}
          >
            {isInactive ? "Inactivo" : "Activo"}
          </Badge>
        );
      },
    },
    {
      key: "created",
      header: <Text className={classes.tableHeader}>ALTA</Text>,
      mobileMinWidth: 180,
      noWrap: true,
      render: (user) => (
        <Box className={classes.dateCell}>
          <IconCalendar size={15} style={{ color: "#94a3b8" }} />
          <span>{formatDateTime(user.createdAt)}</span>
        </Box>
      ),
    },
    {
      key: "last-sign-in",
      header: <Text className={classes.tableHeader}>ÚLTIMO ACCESO</Text>,
      mobileMinWidth: 180,
      noWrap: true,
      render: (user) => {
        if (!user.lastSignInAt) {
          return (
            <Box className={classes.noRecordCell}>
              <span className={classes.greenDot} />
              <span>Sin registro</span>
            </Box>
          );
        }

        return (
          <Box className={classes.dateCell}>
            <IconClock size={15} style={{ color: "#94a3b8" }} />
            <span>{formatDateTime(user.lastSignInAt)}</span>
          </Box>
        );
      },
    },
    {
      key: "actions",
      header: <Text className={classes.tableHeader}>ACCIONES</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (user) => (
        <Group gap={6} wrap="nowrap">
          <Tooltip label="Ver usuario">
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="md"
              className={classes.actionIconBtn}
              aria-label={`Ver ${user.fullName || user.email}`}
              onClick={() => void handleOpenUserView(user.id)}
            >
              <IconEye size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar usuario">
            <ActionIcon
              variant="subtle"
              radius="xl"
              size="md"
              className={classes.actionIconBtn}
              aria-label={`Editar ${user.fullName || user.email}`}
              onClick={() => void handleOpenUserEdit(user.id)}
            >
              <IconPencil size={17} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar usuario">
            <button
              type="button"
              className={classes.deleteActionBtn}
              aria-label={`Eliminar ${user.fullName || user.email}`}
              onClick={() => void handleOpenDeleteUser(user.id)}
            >
              <IconTrash size={16} />
            </button>
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
            {/* Top User Hero Card */}
            <Box className={classes.detailHeroCard}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <Group gap="md" align="center">
                  <Box className={classes.detailAvatarLarge} style={{ backgroundColor: getUserAvatarBg(selectedUser.role, selectedUser.fullName) }}>
                    {getUserInitials(selectedUser.fullName, selectedUser.email)}
                  </Box>
                  <Stack gap={3}>
                    <Text className={classes.detailHeroName}>
                      {selectedUser.fullName || "Usuario sin nombre"}
                    </Text>
                    <Group gap={4} align="center">
                      <Text fw={700} size="sm" c="#94a3b8">@</Text>
                      <Text className={classes.detailHeroEmail}>
                        {selectedUser.email}
                      </Text>
                    </Group>
                    <Box mt={4}>
                      <span className={classes.detailIdBadge}>
                        ID: {selectedUser.legajo ?? selectedUser.id.slice(0, 8)}
                        <button
                          type="button"
                          className={classes.copyBtn}
                          title="Copiar ID"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.legajo ?? selectedUser.id);
                          }}
                        >
                          <IconCopy size={13} />
                        </button>
                      </span>
                    </Box>
                  </Stack>
                </Group>

                <Stack gap="xs" align="flex-end">
                  {renderRoleBadge(selectedUser.role, classes)}
                  <span className={classes.statusActiveBadge}>
                    <span className={classes.greenDot} /> Activo
                  </span>
                </Stack>
              </Group>
            </Box>

            {/* 2-column Grid of Detail Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {/* Card 1: ROL */}
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

              {/* Card 2: PERMISOS */}
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

              {/* Card 3: DNI */}
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

              {/* Card 4: LEGAJO */}
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

              {/* Card 5: CREADO */}
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

              {/* Card 6: ÚLTIMO ACCESO */}
              <Box className={classes.detailInfoCard}>
                <Box className={classes.detailIconCircle}>
                  <IconEyeOff size={20} />
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <span className={classes.detailCardLabel}>ÚLTIMO ACCESO</span>
                  <div className={classes.detailCardValue}>
                    {selectedUser.lastSignInAt ? formatDateTime(selectedUser.lastSignInAt) : "Sin registro"}
                  </div>
                  <span className={classes.detailCardSub}>
                    {selectedUser.lastSignInAt ? "Fecha del último acceso al sistema." : "Aún no se ha registrado un acceso."}
                  </span>
                </Box>
              </Box>
            </SimpleGrid>

            {/* Card 7: SOLICITUD ASOCIADA */}
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

            {/* Relational info (Guardians/Students) if present */}
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
                        <Text size="sm" fw={600}>{guardian.fullName} · {guardian.relationshipType}</Text>
                        <Text size="xs" c="dimmed">DNI {guardian.dni}{guardian.isPrimary ? " · principal" : ""}</Text>
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
                        <Text size="sm" fw={600}>{student.fullName} · {student.relationshipType}</Text>
                        <Text size="xs" c="dimmed">DNI {student.dni}{student.isPrimary ? " · principal" : ""}</Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            ) : null}
          </Stack>
        ) : null}
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

        {/* Page Top Header with Title, Description, and Actions Dropdown */}
        <Box className={classes.headerBox}>
          <Box>
            <Text className={classes.headerSub}>Gestioná los usuarios del sistema, sus roles y accesos.</Text>
          </Box>

          <Menu position="bottom-end" shadow="sm">
            <Menu.Target>
              <Button
                variant="default"
                radius="md"
                rightSection={<IconChevronDown size={14} />}
                style={{ color: "#2563eb", borderColor: "#e2e8f0", fontWeight: 600 }}
              >
                Acciones
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
                Nuevo usuario
              </Menu.Item>
              <Menu.Item leftSection={<IconRefresh size={16} />} onClick={() => void loadUsers()}>
                Actualizar lista
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>

        {/* Filter and Actions Bar */}
        <Box className={classes.filterRow}>
          <TextInput
            placeholder="Nombre o email..."
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={16} color="#94a3b8" />}
            className={classes.searchInput}
          />

          {!lockedRoleFilter ? (
            <Select
              placeholder="Rol: Todos"
              data={[
                { value: "", label: "Todos los roles" },
                ...USER_ROLE_OPTIONS,
              ]}
              value={roleFilter ?? ""}
              onChange={(value) => setRoleFilter(value ? (value as AppUserRole) : null)}
              leftSection={<IconUsers size={16} color="#94a3b8" />}
              className={classes.roleSelect}
              clearable
            />
          ) : null}

          <Button
            className={classes.createBtn}
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpened(true)}
          >
            Nuevo usuario
          </Button>
        </Box>

        {/* Main Data Table Card */}
        <Box className={classes.tableCard}>
          <ResponsiveDataTable
            data={filteredUsers}
            columns={userTableColumns}
            rowKey={(user) => user.id}
            emptyMessage={emptyUsersMessage}
            loading={isLoading}
          />

          <Box className={classes.tableFooter}>
            <Text size="sm" c="dimmed">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </Text>

            <Group gap={6}>
              <button type="button" className={classes.paginationBtn} aria-label="Página anterior" disabled>
                <IconChevronLeft size={16} />
              </button>
              <button type="button" className={`${classes.paginationBtn} ${classes.paginationBtnActive}`}>
                1
              </button>
              <button type="button" className={classes.paginationBtn} aria-label="Página siguiente" disabled>
                <IconChevronRight size={16} />
              </button>
            </Group>
          </Box>
        </Box>
      </Stack>
    </>
  );
}
