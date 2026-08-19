"use client";

import { Box, Group, Text } from "@mantine/core";
import {
  IconChartBar,
  IconClipboardList,
  IconFileCheck,
  IconHome2,
  IconLogout,
  IconMessageCircle,
  type Icon,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import RoleDashboardShell from "@/components/organisms/RoleDashboardShell/RoleDashboardShell";
import {
  getNoDocenteHomePathBySlug,
  getNoDocenteSectionPathBySlug,
} from "@/lib/auth/roles";

import { useStyles } from "@/components/organisms/StudentShell/StudentShell.style";

type NoDocenteShellProps = {
  children: React.ReactNode;
  noDocenteSlug: string;
  noDocenteName: string;
};

type NavigationItem = {
  href: (slug: string) => string;
  label: string;
  icon: Icon;
  exact?: boolean;
};

const noDocenteNavigation: NavigationItem[] = [
  {
    href: getNoDocenteHomePathBySlug,
    label: "Inicio",
    icon: IconHome2,
    exact: true,
  },
  {
    href: (slug) => getNoDocenteSectionPathBySlug(slug, "pendientes"),
    label: "Pendientes",
    icon: IconClipboardList,
  },
  {
    href: (slug) => getNoDocenteSectionPathBySlug(slug, "legajos"),
    label: "Legajos",
    icon: IconFileCheck,
  },
  {
    href: (slug) => getNoDocenteSectionPathBySlug(slug, "mensajes"),
    label: "Mensajes",
    icon: IconMessageCircle,
  },
  {
    href: (slug) => getNoDocenteSectionPathBySlug(slug, "reportes"),
    label: "Reportes",
    icon: IconChartBar,
  },
];

const currentYear = new Date().getFullYear();

export default function NoDocenteShell({
  children,
  noDocenteSlug,
  noDocenteName,
}: NoDocenteShellProps) {
  const { classes } = useStyles();
  const navigation = noDocenteNavigation.map((item) => ({
    href: item.href(noDocenteSlug),
    label: item.label,
    icon: item.icon,
    exact: item.exact,
  }));

  const footer = (
    <Box className={classes.footer}>
      <PaddingContainer size="xl" className={classes.footerInner}>
        <Group className={classes.footerContent}>
          <Box>
            <Text component="p" className={classes.footerTitle}>
              Campus No Docente
            </Text>
            <Text component="p" size="sm" className={classes.footerText}>
              Seguimiento operativo de solicitudes, legajos, consultas y reportes institucionales.
            </Text>
          </Box>
          <Text size="sm" className={classes.footerMeta}>
            © {currentYear} Educar para Transformar
          </Text>
        </Group>
      </PaddingContainer>
    </Box>
  );

  return (
    <RoleDashboardShell
      title="Campus No Docente"
      subtitle={noDocenteName}
      menuAriaLabel="Abrir navegación no docente"
      navigation={navigation}
      footer={footer}
      logoutAction={{
        label: "Cerrar sesión",
        confirmLabel: "Sí, cerrar sesión",
        description: "Si cerrás sesión, vas a tener que volver a ingresar.",
        redirectPath: "/",
        icon: IconLogout,
      }}
    >
      {children}
    </RoleDashboardShell>
  );
}
