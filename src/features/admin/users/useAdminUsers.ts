import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { roleUsesLegajo } from "@/lib/auth/legajo";
import {
  type AppUserRole,
  USER_ROLE_LABELS,
} from "@/lib/auth/roles";

import type {
  AdminBootstrapStatus,
  AdminUser,
  AdminUserDetail,
  BootstrapAdminValues,
  CreateUserValues,
  DeleteUserValues,
  EditUserValues,
  PendingRoleChange,
  UserDetailResponsePayload,
  UsersResponsePayload,
} from "./types";

const initialValues: CreateUserValues = {
  fullName: "",
  email: "",
  password: "",
  dni: "",
  role: "alumno",
  level: "",
  contactPhone: "",
  responsibleType: "tutor",
  tutorFullName: "",
  tutorDni: "",
  fatherFullName: "",
  fatherDni: "",
  motherFullName: "",
  motherDni: "",
  tutorStudentDni: "",
};

const detailInitialValues: EditUserValues = {
  fullName: "",
  email: "",
  dni: "",
  role: "alumno",
  reason: "",
  tutorStudentDni: "",
};

const deleteInitialValues: DeleteUserValues = {
  reason: "",
};

type UseAdminUsersOptions = {
  defaultCreateRole: AppUserRole;
  defaultRoleFilter: AppUserRole | null;
  lockedRoleFilter: AppUserRole | null;
};

function isManualStudentRole(role: AppUserRole) {
  return role === "alumno";
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
    initialValues: {
      ...initialValues,
      role: defaultCreateRole,
    },
    validate: {
      fullName: (value) =>
        value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un correo válido.",
      dni: (value, values) =>
        roleUsesLegajo(values.role)
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá un DNI válido."
          : null,
      password: (value, values) =>
        !roleUsesLegajo(values.role) && value.trim().length < 6
          ? "Ingresá una contraseña de al menos 6 caracteres."
          : null,
      level: (value, values) =>
        isManualStudentRole(values.role) && value.trim().length < 3
          ? "Ingresá el nivel del alumno."
          : null,
      contactPhone: (value, values) =>
        isManualStudentRole(values.role)
          ? /^\d{8,15}$/.test(value.trim())
            ? null
            : "Ingresá un teléfono de contacto válido."
          : null,
      responsibleType: (value, values) =>
        isManualStudentRole(values.role) && value !== "tutor" && value !== "parents"
          ? "Seleccioná quién queda como responsable."
          : null,
      tutorFullName: (value, values) =>
        isManualStudentRole(values.role) && values.responsibleType === "tutor" && value.trim().length < 3
          ? "Ingresá el nombre del tutor."
          : null,
      tutorDni: (value, values) =>
        isManualStudentRole(values.role) && values.responsibleType === "tutor"
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá un DNI válido para el tutor."
          : null,
      fatherFullName: (value, values) =>
        isManualStudentRole(values.role) && values.responsibleType === "parents" && value.trim().length < 3
          ? "Ingresá el nombre del padre."
          : null,
      fatherDni: (value, values) =>
        isManualStudentRole(values.role) && values.responsibleType === "parents"
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá un DNI válido para el padre."
          : null,
      motherFullName: (value, values) =>
        isManualStudentRole(values.role) && values.responsibleType === "parents" && value.trim().length < 3
          ? "Ingresá el nombre de la madre."
          : null,
      motherDni: (value, values) =>
        isManualStudentRole(values.role) && values.responsibleType === "parents"
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá un DNI válido para la madre."
          : null,
      tutorStudentDni: (value, values) =>
        values.role === "tutor"
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá el DNI del alumno a vincular."
          : null,
    },
  });

  const detailForm = useForm<EditUserValues>({
    initialValues: detailInitialValues,
    validate: {
      fullName: (value) =>
        value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un correo válido.",
      dni: (value, values) =>
        roleUsesLegajo(values.role)
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá un DNI válido."
          : null,
      tutorStudentDni: (value, values) =>
        values.role === "tutor" && value.trim().length > 0
          ? /^\d{8}$/.test(value.trim())
            ? null
            : "Ingresá un DNI válido para el alumno."
          : null,
    },
  });

  const deleteForm = useForm<DeleteUserValues>({
    initialValues: deleteInitialValues,
    validate: {
      reason: (value) =>
        value.trim().length >= 3 ? null : "Ingresá una justificación para eliminar.",
    },
  });

  const bootstrapForm = useForm<BootstrapAdminValues>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      bootstrapSecret: "",
    },
    validate: {
      fullName: (value) =>
        value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "Ingresá un correo válido.",
      password: (value) =>
        value.trim().length >= 6 ? null : "Ingresá una contraseña de al menos 6 caracteres.",
      bootstrapSecret: (value) =>
        bootstrapStatus?.requiresSecret && value.trim().length === 0
          ? "Ingresá la clave de bootstrap."
          : null,
    },
  });

  const loadUsers = async (notifyOnError = true) => {
    setIsLoading(true);
    setLoadError(null);
    setRequiresBootstrap(false);

    const response = await fetch("/api/admin/users");
    const payload = (await response.json().catch(() => null)) as UsersResponsePayload | null;

    if (!response.ok) {
      const nextError = payload?.error ?? "No se pudieron obtener los usuarios.";
      const nextRequiresBootstrap = payload?.code === "ADMIN_BOOTSTRAP_REQUIRED";

      setRequiresBootstrap(nextRequiresBootstrap);
      setBootstrapStatus(payload?.bootstrap ?? null);
      setLoadError(nextError);
      setIsLoading(false);

      if (!nextRequiresBootstrap && notifyOnError) {
        notifications.show({
          title: "No se pudo cargar el panel",
          message: nextError,
          color: "red",
        });
      }

      return;
    }

    setRequiresBootstrap(false);
    setBootstrapStatus(null);
    setUsers(payload?.users ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrapUsers = async () => {
      const response = await fetch("/api/admin/users");
      const payload = (await response.json().catch(() => null)) as UsersResponsePayload | null;

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        const nextError = payload?.error ?? "No se pudieron obtener los usuarios.";
        const nextRequiresBootstrap = payload?.code === "ADMIN_BOOTSTRAP_REQUIRED";

        setRequiresBootstrap(nextRequiresBootstrap);
        setBootstrapStatus(payload?.bootstrap ?? null);
        setLoadError(nextError);
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
    const handleUsersRefresh = () => {
      void loadUsers();
    };

    const handleUsersCreate = () => {
      setCreateModalOpened(true);
    };

    window.addEventListener("admin-users-refresh", handleUsersRefresh);
    window.addEventListener("admin-users-create", handleUsersCreate);

    return () => {
      window.removeEventListener("admin-users-refresh", handleUsersRefresh);
      window.removeEventListener("admin-users-create", handleUsersCreate);
    };
  });

  const handleBootstrapAdmin = async (values: BootstrapAdminValues) => {
    setIsBootstrapping(true);

    const response = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; user?: { email: string } }
      | null;

    setIsBootstrapping(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo crear el administrador inicial",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
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

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          user?: {
            email: string;
            legajo?: string | null;
            dni?: string | null;
          };
        }
      | null;

    setIsCreating(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo crear el usuario",
        message: payload?.error ?? "Revisá los datos e intentá nuevamente.",
        color: "red",
      });
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

  const loadUserDetail = async (userId: string, mode: "view" | "edit") => {
    setViewModalOpened(mode === "view");
    setEditModalOpened(mode === "edit");
    setIsLoadingDetail(true);
    setDetailError(null);
    setSelectedUser(null);
    detailForm.reset();
    deleteForm.reset();

    const response = await fetch(`/api/admin/users/${userId}`);
    const payload = (await response.json().catch(() => null)) as UserDetailResponsePayload | null;

    setIsLoadingDetail(false);

    if (!response.ok || !payload?.user) {
      const errorMessage = payload?.error ?? "No se pudo cargar el detalle del usuario.";
      setDetailError(errorMessage);
      notifications.show({
        title: "No se pudo abrir el detalle",
        message: errorMessage,
        color: "red",
      });
      return;
    }

    setSelectedUser(payload.user);
    detailForm.setValues({
      fullName: payload.user.fullName,
      email: payload.user.email,
      dni: payload.user.dni ?? "",
      role: payload.user.role === "desconocido" ? "alumno" : payload.user.role,
      reason: "",
      tutorStudentDni: payload.user.linkedStudents[0]?.dni ?? "",
    });
  };

  const handleOpenUserView = async (userId: string) => {
    await loadUserDetail(userId, "view");
  };

  const handleOpenUserEdit = async (userId: string) => {
    await loadUserDetail(userId, "edit");
  };

  const handleCloseUserView = () => {
    setViewModalOpened(false);
    setSelectedUser(null);
    setDetailError(null);
  };

  const handleCloseUserEdit = () => {
    setEditModalOpened(false);
    setSelectedUser(null);
    setDetailError(null);
    detailForm.reset();
  };

  const handleOpenDeleteUser = async (userId: string) => {
    await loadUserDetail(userId, "view");
    setViewModalOpened(false);
    setDeleteModalOpened(true);
    deleteForm.reset();
  };

  const handleCloseDeleteUser = () => {
    setDeleteModalOpened(false);
    setSelectedUser(null);
    setDetailError(null);
    deleteForm.reset();
  };

  const handleResetPasswordToDni = async () => {
    const fallbackDni = selectedUser?.dni ?? selectedUser?.requestStudentDni;

    if (!selectedUser || !fallbackDni) {
      return;
    }

    setIsResettingPassword(true);

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "request_dni",
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; passwordHint?: string }
      | null;

    setIsResettingPassword(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo restablecer la contraseña",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Contraseña restablecida",
      message: `La contraseña volvió a ser el DNI ${payload?.passwordHint ?? fallbackDni}.`,
      color: "green",
    });
  };

  const handleDeleteUser = async (values: DeleteUserValues) => {
    if (!selectedUser) {
      return;
    }

    setIsDeletingUser(true);

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: values.reason.trim(),
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    setIsDeletingUser(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo eliminar el usuario",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Usuario eliminado",
      message: `Se eliminó ${selectedUser.fullName || selectedUser.email}.`,
      color: "green",
    });

    setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
    handleCloseDeleteUser();
  };

  const handleSaveUserDetail = async (values: EditUserValues) => {
    if (!selectedUser) {
      return;
    }

    const nextRole = values.role;
    const roleChanged = selectedUser.role !== nextRole;

    if (roleChanged && values.reason.trim().length < 3) {
      detailForm.setFieldError("reason", "Ingresá un motivo breve para auditar el cambio de rol.");
      return;
    }

    setIsSavingDetail(true);

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        dni: values.dni.trim(),
        role: nextRole,
        reason: values.reason.trim(),
        tutorStudentDni: values.tutorStudentDni.trim(),
      }),
    });

    const payload = (await response.json().catch(() => null)) as UserDetailResponsePayload | null;

    setIsSavingDetail(false);

    if (!response.ok || !payload?.user) {
      notifications.show({
        title: "No se pudo actualizar el usuario",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Usuario actualizado",
      message: `Se actualizó ${payload.user.fullName || payload.user.email}.`,
      color: "green",
    });

    setSelectedUser(payload.user);
    detailForm.setValues({
      fullName: payload.user.fullName,
      email: payload.user.email,
      dni: payload.user.dni ?? "",
      role: payload.user.role === "desconocido" ? "alumno" : payload.user.role,
      reason: "",
      tutorStudentDni: payload.user.linkedStudents[0]?.dni ?? "",
    });
    setUsers((current) =>
      current.map((user) =>
        user.id === payload.user?.id
          ? {
              ...user,
              fullName: payload.user?.fullName ?? user.fullName,
              email: payload.user?.email ?? user.email,
              legajo: payload.user?.legajo ?? user.legajo,
              role: payload.user?.role ?? user.role,
              createdAt: payload.user?.createdAt ?? user.createdAt,
              lastSignInAt: payload.user?.lastSignInAt ?? user.lastSignInAt,
            }
          : user,
      ),
    );
    handleCloseUserEdit();
  };

  const handleRoleChangeSelection = (user: AdminUser, nextRole: AppUserRole | null) => {
    if (!nextRole || nextRole === user.role) {
      return;
    }

    setRoleChangeReason("");
    setPendingRoleChange({
      userId: user.id,
      userLabel: user.fullName || user.email,
      nextRole,
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) {
      return;
    }

    if (roleChangeReason.trim().length < 3) {
      notifications.show({
        title: "Falta justificar el cambio",
        message: "Ingresá un motivo breve para auditar el cambio de rol.",
        color: "yellow",
      });
      return;
    }

    setUpdatingUserId(pendingRoleChange.userId);
    const currentUser = users.find((user) => user.id === pendingRoleChange.userId);

    const response = await fetch(`/api/admin/users/${pendingRoleChange.userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: currentUser?.fullName ?? pendingRoleChange.userLabel,
        email: currentUser?.email ?? "",
        dni: selectedUser?.id === pendingRoleChange.userId ? (selectedUser.dni ?? "") : "",
        role: pendingRoleChange.nextRole,
        reason: roleChangeReason.trim(),
      }),
    });

    const payload = (await response.json().catch(() => null)) as UserDetailResponsePayload | null;

    setUpdatingUserId(null);

    if (!response.ok || !payload?.user) {
      notifications.show({
        title: "No se pudo actualizar el rol",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Rol actualizado",
      message: `El usuario ahora tiene rol ${USER_ROLE_LABELS[pendingRoleChange.nextRole]}.`,
      color: "green",
    });

    setUsers((current) =>
      current.map((user) =>
        user.id === pendingRoleChange.userId
          ? {
              ...user,
              fullName: payload.user?.fullName ?? user.fullName,
              email: payload.user?.email ?? user.email,
              legajo: payload.user?.legajo ?? user.legajo,
              role: payload.user?.role ?? user.role,
            }
          : user,
      ),
    );

    if (selectedUser?.id === pendingRoleChange.userId) {
      setSelectedUser(payload.user);
    }

    setPendingRoleChange(null);
    setRoleChangeReason("");
  };

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      user.fullName.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      (user.legajo ?? "").toLowerCase().includes(normalizedSearch);

    const effectiveRoleFilter = lockedRoleFilter ?? roleFilter;
    const matchesRole = !effectiveRoleFilter || user.role === effectiveRoleFilter;

    return matchesSearch && matchesRole;
  });

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
