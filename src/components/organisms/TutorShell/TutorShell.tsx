"use client";

import { useMemo } from "react";
import { Box, Group, Text } from "@mantine/core";
import {
  IconHome2,
  IconLogout,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import RoleDashboardShell, {
  type RoleDashboardNavigationItem,
} from "@/components/organisms/RoleDashboardShell/RoleDashboardShell";
import {
  getTutorHomePathBySlug,
  getTutorSectionPathBySlug,
  getTutorStudentPathBySlug,
} from "@/lib/auth/roles";

import { useStyles } from "@/components/organisms/StudentShell/StudentShell.style";

type TutorShellStudent = {
  profileId: string;
  name: string;
};

type TutorShellProps = {
  children: React.ReactNode;
  tutorSlug: string;
  tutorName: string;
  students?: TutorShellStudent[];
};

type NavigationItem = {
  href: (slug: string) => string;
  label: string;
  icon: Icon;
  key: string;
  exact?: boolean;
};

const tutorNavigation: NavigationItem[] = [
  {
    key: "inicio",
    href: getTutorHomePathBySlug,
    label: "Inicio",
    icon: IconHome2,
    exact: true,
  },
  {
    key: "hijos",
    href: (slug) => getTutorSectionPathBySlug(slug, "hijos"),
    label: "Hijos",
    icon: IconUsersGroup,
  },
];

const currentYear = new Date().getFullYear();

export default function TutorShell({
  children,
  tutorSlug,
  tutorName,
  students = [],
}: TutorShellProps) {
  const { classes } = useStyles();
  const navigation = useMemo<RoleDashboardNavigationItem[]>(
    () =>
      tutorNavigation.map((item) => ({
        href: item.href(tutorSlug),
        label: item.label,
        icon: item.icon,
        exact: item.exact,
        children: item.key === "hijos"
          ? students.map((student) => ({
              href: getTutorStudentPathBySlug(tutorSlug, student.profileId),
              label: student.name,
            }))
          : undefined,
      })),
    [students, tutorSlug],
  );

  const footer = (
    <Box className={classes.footer}>
      <PaddingContainer size="xl" className={classes.footerInner}>
        <Group className={classes.footerContent}>
          <Box>
            <Text component="p" className={classes.footerTitle}>
              Campus Tutor
            </Text>
            <Text component="p" size="sm" className={classes.footerText}>
              Seguimiento de hijos, cursos, notas, asistencias y mensajes al docente.
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
      title="Campus Tutor"
      subtitle={tutorName}
      menuAriaLabel="Abrir navegación del tutor"
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
