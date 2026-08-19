"use client";

import { usePathname } from "next/navigation";
import type { ActionsMenuItem } from "@/components/molecules";
import {
  IconBook2,
  IconFileDescription,
  IconLogout,
  IconNews,
  IconRefresh,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import RoleDashboardShell from "@/components/organisms/RoleDashboardShell/RoleDashboardShell";

type AdminShellProps = {
  children: React.ReactNode;
};

const adminNavigation = [
  {
    href: "/admin/solicitudes",
    label: "Solicitudes",
    icon: IconFileDescription,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: IconUsers,
  },
  {
    href: "/admin/cursos",
    label: "Cursos",
    icon: IconBook2,
  },
  {
    href: "/admin/noticias",
    label: "Noticias",
    icon: IconNews,
  },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  const handleRequestsRefresh = () => {
    window.dispatchEvent(new Event("admin-requests-refresh"));
  };

  const handleUsersRefresh = () => {
    window.dispatchEvent(new Event("admin-users-refresh"));
  };

  const handleUsersCreate = () => {
    window.dispatchEvent(new Event("admin-users-create"));
  };

  const handleCoursesRefresh = () => {
    window.dispatchEvent(new Event("admin-courses-refresh"));
  };

  const handleCoursesCreate = () => {
    window.dispatchEvent(new Event("admin-courses-create"));
  };

  const handleNewsRefresh = () => {
    window.dispatchEvent(new Event("admin-news-refresh"));
  };

  const handleNewsCreate = () => {
    window.dispatchEvent(new Event("admin-news-create"));
  };

  const topBarActions: ActionsMenuItem[] = [];

  if (pathname.startsWith("/admin/solicitudes")) {
    topBarActions.push({
      key: "refresh-requests",
      label: "Actualizar",
      icon: IconRefresh,
      onClick: handleRequestsRefresh,
    });
  }

  if (pathname.startsWith("/admin/usuarios")) {
    topBarActions.push(
      {
        key: "refresh-users",
        label: "Actualizar",
        icon: IconRefresh,
        onClick: handleUsersRefresh,
      },
      {
        key: "create-user",
        label: "Nuevo usuario",
        icon: IconUserPlus,
        onClick: handleUsersCreate,
      },
    );
  }

  if (pathname.startsWith("/admin/cursos")) {
    topBarActions.push(
      {
        key: "refresh-courses",
        label: "Actualizar",
        icon: IconRefresh,
        onClick: handleCoursesRefresh,
      },
      {
        key: "create-course",
        label: "Nuevo curso",
        icon: IconBook2,
        onClick: handleCoursesCreate,
      },
    );
  }

  if (pathname.startsWith("/admin/noticias")) {
    topBarActions.push(
      {
        key: "refresh-news",
        label: "Actualizar",
        icon: IconRefresh,
        onClick: handleNewsRefresh,
      },
      {
        key: "create-news",
        label: "Nueva noticia",
        icon: IconNews,
        onClick: handleNewsCreate,
      },
    );
  }

  return (
    <RoleDashboardShell
      title="Admin"
      subtitle="Educar Para Transformar"
      menuAriaLabel="Abrir menú administrativo"
      navigation={adminNavigation}
      topBarActions={topBarActions}
      logoutAction={{
        label: "Cerrar sesión",
        confirmLabel: "Sí, cerrar sesión",
        description: "Vas a salir del panel administrativo. Tendrás que volver a iniciar sesión para continuar.",
        redirectPath: "/admin",
        icon: IconLogout,
      }}
    >
      {children}
    </RoleDashboardShell>
  );
}
