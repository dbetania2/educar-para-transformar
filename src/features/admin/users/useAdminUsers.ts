import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { type AppUserRole, USER_ROLE_LABELS } from "@/lib/auth/roles";

import type {
  AdminBootstrapStatus,
  AdminUser,
  AdminUserDetail,
  BootstrapAdminValues,
  CreateUserValues,
  DeleteUserValues,
  EditUserValues,
  PendingRoleChange,
} from "./types";
import {
  deleteAdminUserById,
  fetchAdminUserDetail,
  fetchAdminUsersList,
  patchAdminUserDetail,
  patchAdminUserRole,
  postBootstrapAdmin,
  postCreateAdminUser,
  postResetUserPasswordToDni,
} from "./userApiService";
import {
  createUserFormValidate,
  deleteInitialValues,
  deleteUserFormValidate,
  detailInitialValues,
  editUserFormValidate,
  getBootstrapFormValidate,
  initialCreateUserValues,
  mapUserDetailToEditValues,
} from "./userFormsConfig";

type UseAdminUsersOptions = {
  defaultCreateRole: AppUserRole;
  defaultRoleFilter: AppUserRole | null;
  lockedRoleFilter: AppUserRole | null;
};

function notifyError(title: string, message?: string) {
  notifications.show({
    title,
    message: message ?? "Intentá nuevamente.",
    color: "red",
  });
}

export function useAdminUsers({
  defaultCreateRole,
  defaultRoleFilter,
  lockedRoleFilter,
}: UseAdminUsersOptions) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [requiresBootstrap, setRequiresBootstrap] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<AdminBootstrapStatus | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [bootstrapModalOpened, setBootstrapModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<PendingRoleChange | null>(null);
  const [roleChangeReason, setRoleChangeReason] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppUserRole | null>(
    lockedRoleFilter ?? defaultRoleFilter ?? null,
  );

  const form = useForm<CreateUserValues>({
    initialValues: { ...initialCreateUserValues, role: defaultCreateRole },
    validate: createUserFormValidate,
  });
  const detailForm = useForm<EditUserValues>({
    initialValues: detailInitialValues,
    validate: editUserFormValidate,
  });
  const deleteForm = useForm<DeleteUserValues>({
    initialValues: deleteInitialValues,
    validate: deleteUserFormValidate,
  });
  const bootstrapForm = useForm<BootstrapAdminValues>({
    initialValues: { fullName: "", email: "", password: "", bootstrapSecret: "" },
    validate: getBootstrapFormValidate(bootstrapStatus),
  });

  const loadUsers = useCallback(async (notifyOnError = true) => {
    setIsLoading(true);
    setLoadError(null);
    setRequiresBootstrap(false);

    const { ok, payload } = await fetchAdminUsersList();
    if (!ok) {
      const nextError = payload?.error ?? "No se pudieron obtener los usuarios.";
      const nextRequiresBootstrap = payload?.code === "ADMIN_BOOTSTRAP_REQUIRED";
      setRequiresBootstrap(nextRequiresBootstrap);
      setBootstrapStatus(payload?.bootstrap ?? null);
      setLoadError(nextError);
      setIsLoading(false);
      if (!nextRequiresBootstrap && notifyOnError) {
        notifyError("No se pudo cargar el panel", nextError);
      }
      return;
    }

    setRequiresBootstrap(false);
    setBootstrapStatus(null);
    setUsers(payload?.users ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrapUsers = async () => {
      const { ok, payload } = await fetchAdminUsersList();
      if (cancelled) return;
      if (!ok) {
        setRequiresBootstrap(payload?.code === "ADMIN_BOOTSTRAP_REQUIRED");
        setBootstrapStatus(payload?.bootstrap ?? null);
        setLoadError(payload?.error ?? "No se pudieron obtener los usuarios.");
        setIsLoading(false);
        return;
      }
      setRequiresBootstrap(false);
      setBootstrapStatus(null);
      setUsers(payload?.users ?? []);
      setIsLoading(false);
    };
    void bootstrapUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUsersRefresh = () => void loadUsers();
    const handleUsersCreate = () => setCreateModalOpened(true);
    window.addEventListener("admin-users-refresh", handleUsersRefresh);
    window.addEventListener("admin-users-create", handleUsersCreate);
    return () => {
      window.removeEventListener("admin-users-refresh", handleUsersRefresh);
      window.removeEventListener("admin-users-create", handleUsersCreate);
    };
  }, [loadUsers]);

  const handleBootstrapAdmin = async (values: BootstrapAdminValues) => {
    setIsBootstrapping(true);
    const { ok, payload } = await postBootstrapAdmin(values);
    setIsBootstrapping(false);
    if (!ok) {
      notifyError("No se pudo crear el administrador inicial", payload?.error);
      return;
    }
    notifications.show({
      title: "Administrador inicial creado",
      message: `Ya podés iniciar sesión con ${payload?.user?.email ?? values.email}.`,
      color: "green",
    });
    bootstrapForm.reset();
    setLoadError(null);
    setRequiresBootstrap(false);
    void loadUsers();
  };

  const handleCreateUser = async (values: CreateUserValues) => {
    setIsCreating(true);
    const { ok, payload } = await postCreateAdminUser(values);
    setIsCreating(false);
    if (!ok) {
      notifyError("No se pudo crear el usuario", payload?.error ?? "Revisá los datos.");
      return;
    }
    notifications.show({
      title: "Usuario creado",
      message: payload?.user?.legajo
        ? `Se creó ${payload.user.email} con legajo ${payload.user.legajo}.`
        : `Se creó el usuario ${values.email} con rol ${USER_ROLE_LABELS[values.role]}.`,
      color: "green",
    });
    form.reset();
    setCreateModalOpened(false);
    void loadUsers();
  };

  const loadUserDetail = useCallback(
    async (userId: string, mode: "view" | "edit") => {
      setViewModalOpened(mode === "view");
      setEditModalOpened(mode === "edit");
      setIsLoadingDetail(true);
      setDetailError(null);
      setSelectedUser(null);
      detailForm.reset();
      deleteForm.reset();

      const { ok, payload } = await fetchAdminUserDetail(userId);
      setIsLoadingDetail(false);
      if (!ok || !payload?.user) {
        const errorMessage = payload?.error ?? "No se pudo cargar el detalle del usuario.";
        setDetailError(errorMessage);
        notifyError("No se pudo abrir el detalle", errorMessage);
        return;
      }
      setSelectedUser(payload.user);
      detailForm.setValues(mapUserDetailToEditValues(payload.user));
    },
    [deleteForm, detailForm],
  );

  const handleOpenUserView = useCallback(
    async (userId: string) => loadUserDetail(userId, "view"),
    [loadUserDetail],
  );
  const handleOpenUserEdit = useCallback(
    async (userId: string) => loadUserDetail(userId, "edit"),
    [loadUserDetail],
  );
  const handleCloseUserView = useCallback(() => {
    setViewModalOpened(false);
    setSelectedUser(null);
    setDetailError(null);
  }, []);
  const handleCloseUserEdit = useCallback(() => {
    setEditModalOpened(false);
    setSelectedUser(null);
    setDetailError(null);
    detailForm.reset();
  }, [detailForm]);

  const handleOpenDeleteUser = useCallback(
    async (userId: string) => {
      await loadUserDetail(userId, "view");
      setViewModalOpened(false);
      setDeleteModalOpened(true);
      deleteForm.reset();
    },
    [deleteForm, loadUserDetail],
  );
  const handleCloseDeleteUser = useCallback(() => {
    setDeleteModalOpened(false);
    setSelectedUser(null);
    setDetailError(null);
    deleteForm.reset();
  }, [deleteForm]);

  const handleResetPasswordToDni = async () => {
    const fallbackDni = selectedUser?.dni ?? selectedUser?.requestStudentDni;
    if (!selectedUser || !fallbackDni) return;
    setIsResettingPassword(true);
    const { ok, payload } = await postResetUserPasswordToDni(selectedUser.id);
    setIsResettingPassword(false);
    if (!ok) {
      notifyError("No se pudo restablecer la contraseña", payload?.error);
      return;
    }
    notifications.show({
      title: "Contraseña restablecida",
      message: `La contraseña volvió a ser el DNI ${payload?.passwordHint ?? fallbackDni}.`,
      color: "green",
    });
  };

  const handleDeleteUser = async (values: DeleteUserValues) => {
    if (!selectedUser) return;
    setIsDeletingUser(true);
    const { ok, payload } = await deleteAdminUserById(selectedUser.id, values.reason);
    setIsDeletingUser(false);
    if (!ok) {
      notifyError("No se pudo eliminar el usuario", payload?.error);
      return;
    }
    notifications.show({
      title: "Usuario dado de baja",
      message: `Se desactivó ${selectedUser.fullName || selectedUser.email}.`,
      color: "orange",
    });
    setUsers((current) =>
      current.map((u) =>
        u.id === selectedUser.id ? { ...u, status: "inactivo", isActive: false } : u,
      ),
    );
    handleCloseDeleteUser();
  };

  const handleSaveUserDetail = async (values: EditUserValues) => {
    if (!selectedUser) return;
    if (selectedUser.role !== values.role && values.reason.trim().length < 3) {
      detailForm.setFieldError("reason", "Ingresá un motivo breve para auditar el cambio de rol.");
      return;
    }
    setIsSavingDetail(true);
    const { ok, payload } = await patchAdminUserDetail(selectedUser.id, values);
    setIsSavingDetail(false);
    if (!ok || !payload?.user) {
      notifyError("No se pudo actualizar el usuario", payload?.error);
      return;
    }
    notifications.show({
      title: "Usuario actualizado",
      message: `Se actualizó ${payload.user.fullName || payload.user.email}.`,
      color: "green",
    });
    setSelectedUser(payload.user);
    detailForm.setValues(mapUserDetailToEditValues(payload.user));
    setUsers((current) =>
      current.map((u) =>
        u.id === payload.user?.id
          ? {
              ...u,
              fullName: payload.user?.fullName ?? u.fullName,
              email: payload.user?.email ?? u.email,
              legajo: payload.user?.legajo ?? u.legajo,
              role: payload.user?.role ?? u.role,
              createdAt: payload.user?.createdAt ?? u.createdAt,
              lastSignInAt: payload.user?.lastSignInAt ?? u.lastSignInAt,
            }
          : u,
      ),
    );
    handleCloseUserEdit();
  };

  const handleRoleChangeSelection = useCallback((user: AdminUser, nextRole: AppUserRole | null) => {
    if (!nextRole || nextRole === user.role) return;
    setRoleChangeReason("");
    setPendingRoleChange({
      userId: user.id,
      userLabel: user.fullName || user.email,
      nextRole,
    });
  }, []);

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    if (roleChangeReason.trim().length < 3) {
      notifications.show({
        title: "Falta justificar el cambio",
        message: "Ingresá un motivo breve para auditar el cambio de rol.",
        color: "yellow",
      });
      return;
    }
    setUpdatingUserId(pendingRoleChange.userId);
    const currentUser = users.find((u) => u.id === pendingRoleChange.userId);
    const { ok, payload } = await patchAdminUserRole({
      userId: pendingRoleChange.userId,
      fullName: currentUser?.fullName ?? pendingRoleChange.userLabel,
      email: currentUser?.email ?? "",
      dni: selectedUser?.id === pendingRoleChange.userId ? (selectedUser.dni ?? "") : "",
      role: pendingRoleChange.nextRole,
      reason: roleChangeReason,
    });
    setUpdatingUserId(null);
    if (!ok || !payload?.user) {
      notifyError("No se pudo actualizar el rol", payload?.error);
      return;
    }
    notifications.show({
      title: "Rol actualizado",
      message: `El usuario ahora tiene rol ${USER_ROLE_LABELS[pendingRoleChange.nextRole]}.`,
      color: "green",
    });
    setUsers((current) =>
      current.map((u) =>
        u.id === pendingRoleChange.userId
          ? {
              ...u,
              fullName: payload.user?.fullName ?? u.fullName,
              email: payload.user?.email ?? u.email,
              legajo: payload.user?.legajo ?? u.legajo,
              role: payload.user?.role ?? u.role,
            }
          : u,
      ),
    );
    if (selectedUser?.id === pendingRoleChange.userId) {
      setSelectedUser(payload.user);
    }
    setPendingRoleChange(null);
    setRoleChangeReason("");
  };

  // El input responde al instante; el filtrado de la lista se hace con prioridad baja.
  const deferredSearch = useDeferredValue(search);
  const filteredUsers = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const effectiveRoleFilter = lockedRoleFilter ?? roleFilter;
    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.legajo ?? "").toLowerCase().includes(normalizedSearch);
      const matchesRole = !effectiveRoleFilter || user.role === effectiveRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [deferredSearch, lockedRoleFilter, roleFilter, users]);

  return {
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
    isInitialLoading: isLoading && users.length === 0,
    emptyUsersMessage:
      users.length === 0
        ? "No hay usuarios cargados o no tenés permisos para verlos."
        : "No hay resultados para los filtros actuales.",
    setCreateModalOpened,
    setViewModalOpened,
    setEditModalOpened,
    setDeleteModalOpened,
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
    handleRoleChangeSelection,
    handleConfirmRoleChange,
  };
}
