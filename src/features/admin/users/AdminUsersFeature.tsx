"use client";

import { useMemo } from "react";
import { Alert, Box, Button, Card, Group, Select, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconShieldPlus,
  IconUsers,
} from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { AdminPageLoader, ResponsiveDataTable } from "@/components/molecules";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
import { useStyles } from "@/components/templates/AdminListTemplate/AdminListTemplate.style";
import { USER_ROLE_OPTIONS, type AppUserRole } from "@/lib/auth/roles";
import { AdminUserAuxiliaryDrawers } from "./components/AdminUserAuxiliaryDrawers";
import { AdminUserCreateDrawer } from "./components/AdminUserCreateDrawer";
import { AdminUserEditDrawer } from "./components/AdminUserEditDrawer";
import { AdminUserViewDrawer } from "./components/AdminUserViewDrawer";
import { getAdminUserTableColumns } from "./components/userTableColumns";
import { useAdminUsers } from "./useAdminUsers";

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
    emptyUsersMessage,
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

  const userTableColumns = useMemo(
    () =>
      getAdminUserTableColumns({
        classes,
      }),
    [classes],
  );

  if (isInitialLoading) {
    return (
      <AdminPageLoader
        breadcrumbs={[...breadcrumbs]}
        title={pageTitle}
        loadingLabel={loadingLabel}
      />
    );
  }

  return (
    <>
      <AdminUserCreateDrawer
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title={createModalTitle}
        description={createModalDescription}
        lockedRoleFilter={lockedRoleFilter}
        isCreating={isCreating}
        form={form}
        onSubmit={handleCreateUser}
      />

      <AdminUserViewDrawer
        opened={viewModalOpened}
        onClose={handleCloseUserView}
        classes={classes}
        isLoadingDetail={isLoadingDetail}
        detailError={detailError}
        selectedUser={selectedUser}
        onEdit={(userId) => void handleOpenUserEdit(userId)}
        onDelete={(userId) => void handleOpenDeleteUser(userId)}
      />

      <AdminUserEditDrawer
        opened={editModalOpened}
        onClose={handleCloseUserEdit}
        isLoadingDetail={isLoadingDetail}
        isSavingDetail={isSavingDetail}
        isResettingPassword={isResettingPassword}
        detailError={detailError}
        selectedUser={selectedUser}
        detailForm={detailForm}
        onSave={handleSaveUserDetail}
        onResetPasswordToDni={handleResetPasswordToDni}
      />

      <AdminUserAuxiliaryDrawers
        deleteModalOpened={deleteModalOpened}
        onCloseDeleteUser={handleCloseDeleteUser}
        selectedUser={selectedUser}
        deleteForm={deleteForm}
        isDeletingUser={isDeletingUser}
        onDeleteUser={handleDeleteUser}
        bootstrapModalOpened={bootstrapModalOpened}
        onCloseBootstrap={() => setBootstrapModalOpened(false)}
        bootstrapStatus={bootstrapStatus}
        bootstrapForm={bootstrapForm}
        isBootstrapping={isBootstrapping}
        onBootstrapAdmin={handleBootstrapAdmin}
        pendingRoleChange={pendingRoleChange}
        roleChangeReason={roleChangeReason}
        updatingUserId={updatingUserId}
        onRoleChangeReasonChange={setRoleChangeReason}
        onConfirmRoleChange={handleConfirmRoleChange}
        onCloseRoleChange={() => {
          setPendingRoleChange(null);
          setRoleChangeReason("");
        }}
      />

      <AdminListTemplate
        title={pageTitle}
        description="Gestioná los usuarios del sistema, sus roles y accesos."
        breadcrumbs={breadcrumbs}
        createButtonLabel="Nuevo usuario"
        onCreate={() => setCreateModalOpened(true)}
        onRefresh={() => void loadUsers()}
        searchProps={{
          value: search,
          onChange: setSearch,
          placeholder: "Nombre o email...",
        }}
        filtersSlot={
          !lockedRoleFilter ? (
            <Select
              placeholder="Rol: Todos"
              data={[{ value: "", label: "Todos los roles" }, ...USER_ROLE_OPTIONS]}
              value={roleFilter ?? ""}
              onChange={(value) => setRoleFilter(value ? (value as AppUserRole) : null)}
              leftSection={<IconUsers size={16} color="#94a3b8" />}
              className={classes.roleSelect}
              clearable
            />
          ) : null
        }
        statsSlot={
          <Stack gap="sm">
            {loadError && !requiresBootstrap ? (
              <Alert variant="filled" color="red" radius="md" icon={<IconAlertCircle size={18} />}>
                {loadError}
              </Alert>
            ) : null}

            {requiresBootstrap && bootstrapStatus?.enabled === false ? (
              <Alert
                variant="filled"
                color="yellow"
                radius="md"
                icon={<IconAlertCircle size={18} />}
              >
                {bootstrapStatus.lockedReason}
              </Alert>
            ) : null}

            {requiresBootstrap ? (
              <Card withBorder radius="md" p={{ base: "cardPadSm", md: "cardPadLg" }}>
                <Stack gap="sectionGapLg">
                  <Box>
                    <Group gap="sm" align="center">
                      <IconShieldPlus size={22} />
                      <Title order={4} c="brand.7">
                        Bootstrap del primer administrador
                      </Title>
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
                      <Button
                        variant="default"
                        onClick={() => void loadUsers()}
                        loading={isLoading}
                      >
                        Revalidar
                      </Button>
                      <CTAButton
                        type="button"
                        onClick={() => setBootstrapModalOpened(true)}
                        disabled={bootstrapStatus?.enabled === false}
                      >
                        Crear primer administrador
                      </CTAButton>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            ) : null}
          </Stack>
        }
        tableFooterSlot={
          <Box className={classes.tableFooter}>
            <Text size="sm" c="dimmed">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </Text>

            <Group gap={6}>
              <button
                type="button"
                className={classes.paginationBtn}
                aria-label="Página anterior"
                disabled
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={`${classes.paginationBtn} ${classes.paginationBtnActive}`}
              >
                1
              </button>
              <button
                type="button"
                className={classes.paginationBtn}
                aria-label="Página siguiente"
                disabled
              >
                <IconChevronRight size={16} />
              </button>
            </Group>
          </Box>
        }
      >
        <ResponsiveDataTable
          data={filteredUsers}
          columns={userTableColumns}
          rowKey={(user) => user.id}
          pageSize={25}
          onRowClick={(user) => void handleOpenUserView(user.id)}
          emptyMessage={emptyUsersMessage}
          loading={isLoading}
        />
      </AdminListTemplate>
    </>
  );
}
