"use client";

import { useMemo } from "react";
import { Box, Group, Text } from "@mantine/core";
import {
  IconBook2,
  IconHome2,
  IconLogout,
  IconUserCog,
  type Icon,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import {
  getStudentCoursePathBySlug,
  getStudentHomePathBySlug,
  getStudentSectionPathBySlug,
} from "@/lib/auth/roles";
import RoleDashboardShell, {
  type RoleDashboardNavigationItem,
} from "@/components/organisms/RoleDashboardShell/RoleDashboardShell";

import { useStyles } from "./StudentShell.style";

type StudentShellCourse = {
  id: number;
  name: string;
};

type StudentShellProps = {
  children: React.ReactNode;
  studentSlug: string;
  studentName: string;
  courses?: StudentShellCourse[];
};

type NavigationItem = {
  href: (slug: string) => string;
  label: string;
  icon: Icon;
  key: string;
  exact?: boolean;
};

const studentNavigation: NavigationItem[] = [
  {
    key: "inicio",
    href: getStudentHomePathBySlug,
    label: "Inicio",
    icon: IconHome2,
    exact: true,
  },
  {
    key: "cursos",
    href: (slug) => getStudentSectionPathBySlug(slug, "cursos"),
    label: "Cursos",
    icon: IconBook2,
  },
  {
    key: "perfil",
    href: (slug) => getStudentSectionPathBySlug(slug, "perfil"),
    label: "Perfil",
    icon: IconUserCog,
  },
];

const currentYear = new Date().getFullYear();

export default function StudentShell({
  children,
  studentSlug,
  studentName,
  courses = [],
}: StudentShellProps) {
  const { classes } = useStyles();
  const navigation = useMemo<RoleDashboardNavigationItem[]>(
    () =>
      studentNavigation.map((item) => ({
        href: item.href(studentSlug),
        label: item.label,
        icon: item.icon,
        exact: item.exact,
        children: item.key === "cursos"
          ? courses.map((course) => ({
              href: getStudentCoursePathBySlug(studentSlug, course.id),
              label: course.name,
            }))
          : undefined,
      })),
    [courses, studentSlug],
  );

  const footer = (
    <Box className={classes.footer}>
      <PaddingContainer size="xl" className={classes.footerInner}>
        <Group className={classes.footerContent}>
          <Box>
            <Text component="p" className={classes.footerTitle}>
              Campus Alumno
            </Text>
            <Text component="p" size="sm" className={classes.footerText}>
              Un espacio claro para seguir cursos, perfil y novedades institucionales.
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
      title="Campus Alumno"
      subtitle={studentName}
      menuAriaLabel="Abrir navegación del alumno"
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
