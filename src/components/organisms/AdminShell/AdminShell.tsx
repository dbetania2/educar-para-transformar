"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ActionsMenuItem } from "@/components/molecules";
import {
  IconBook2,
  IconChartBar,
  IconHome,
  IconLogout,
  IconNews,
  IconReceipt2,
  IconRefresh,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import RoleDashboardShell from "@/components/organisms/RoleDashboardShell/RoleDashboardShell";
import NotificationsBell, { type NotificationItem } from "@/components/organisms/NotificationsBell";


type AdminShellProps = {
  children: React.ReactNode;
};

const adminNavigation = [
  {
    href: "/admin/solicitudes",
    label: "Inicio",
    icon: IconHome,
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
  {
    href: "/admin/pagos",
    label: "Pagos y Cobranzas",
    icon: IconReceipt2,
  },
  {
    href: "/admin/reportes",
    label: "Reportes",
    icon: IconChartBar,
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    icon: IconSettings,
  },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch {
        // Fallback silencioso
      }
    };

    void loadNotifications();

    const handleRefresh = () => {
      void loadNotifications();
    };

    window.addEventListener("admin-requests-refresh", handleRefresh);
    window.addEventListener("admin-courses-refresh", handleRefresh);
    window.addEventListener("admin-users-refresh", handleRefresh);
    window.addEventListener("admin-payments-refresh", handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("admin-requests-refresh", handleRefresh);
      window.removeEventListener("admin-courses-refresh", handleRefresh);
      window.removeEventListener("admin-users-refresh", handleRefresh);
      window.removeEventListener("admin-payments-refresh", handleRefresh);
    };
  }, []);

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

  if (pathname.startsWith("/admin/reportes")) {
    topBarActions.push({
      key: "refresh-reports",
      label: "Actualizar",
      icon: IconRefresh,
      onClick: () => window.dispatchEvent(new Event("admin-reports-refresh")),
    });
  }

  if (pathname.startsWith("/admin/pagos")) {
    topBarActions.push({
      key: "refresh-payments",
      label: "Actualizar",
      icon: IconRefresh,
      onClick: () => window.dispatchEvent(new Event("admin-payments-refresh")),
    });
  }

  return (
    <RoleDashboardShell
      title="Admin"
      subtitle="Educar Para Transformar"
      menuAriaLabel="Abrir menú administrativo"
      navigation={adminNavigation}
      topBarActions={topBarActions}
      topBarSlot={
        <NotificationsBell
          notifications={notifications}
          roleTitle="Administración"
          storageKey="admin"
        />
      }
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

