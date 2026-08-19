"use client";

import { useMemo } from "react";
import { Box, Group, Text } from "@mantine/core";
import {
  IconBook2,
  IconHome2,
  IconLogout,
  IconMessageCircle,
  IconUserCog,
  type Icon,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import TeacherMessagesBell from "@/features/docente/TeacherMessagesBell";
import RoleDashboardShell, {
  type RoleDashboardNavigationItem,
} from "@/components/organisms/RoleDashboardShell/RoleDashboardShell";
import {
  getTeacherCoursePathBySlug,
  getTeacherHomePathBySlug,
  getTeacherSectionPathBySlug,
} from "@/lib/auth/roles";

import { useStyles } from "@/components/organisms/StudentShell/StudentShell.style";

type TeacherShellCourse = {
  id: number;
  name: string;
};

type TeacherShellMessage = {
  id: number;
  message: string;
  created_at: string;
  read_at: string | null;
  tutor_name: string;
  student_name: string;
  course_name: string;
};

type TeacherShellProps = {
  children: React.ReactNode;
  teacherSlug: string;
  teacherName: string;
  courses?: TeacherShellCourse[];
  messages?: TeacherShellMessage[];
};

type NavigationItem = {
  href: (slug: string) => string;
  label: string;
  icon: Icon;
  key: string;
  exact?: boolean;
};

const teacherNavigation: NavigationItem[] = [
  {
    key: "inicio",
    href: getTeacherHomePathBySlug,
    label: "Inicio",
    icon: IconHome2,
    exact: true,
  },
  {
    key: "cursos",
    href: (slug) => getTeacherSectionPathBySlug(slug, "cursos"),
    label: "Cursos",
    icon: IconBook2,
  },
  {
    key: "mensajes",
    href: (slug) => getTeacherSectionPathBySlug(slug, "mensajes"),
    label: "Mensajes",
    icon: IconMessageCircle,
  },
  {
    key: "perfil",
    href: (slug) => getTeacherSectionPathBySlug(slug, "perfil"),
    label: "Perfil",
    icon: IconUserCog,
  },
];

const currentYear = new Date().getFullYear();

export default function TeacherShell({
  children,
  teacherSlug,
  teacherName,
  courses = [],
  messages = [],
}: TeacherShellProps) {
  const { classes } = useStyles();
  const navigation = useMemo<RoleDashboardNavigationItem[]>(
    () =>
      teacherNavigation.map((item) => ({
        href: item.href(teacherSlug),
        label: item.label,
        icon: item.icon,
        exact: item.exact,
        children: item.key === "cursos"
          ? courses.map((course) => ({
              href: getTeacherCoursePathBySlug(teacherSlug, course.id),
              label: course.name,
            }))
          : undefined,
      })),
    [courses, teacherSlug],
  );

  const footer = (
    <Box className={classes.footer}>
      <PaddingContainer size="xl" className={classes.footerInner}>
        <Group className={classes.footerContent}>
          <Box>
            <Text component="p" className={classes.footerTitle}>
              Campus Docente
            </Text>
            <Text component="p" size="sm" className={classes.footerText}>
              Un espacio claro para organizar cursos, perfil y seguimiento academico.
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
      title="Campus Docente"
      subtitle={teacherName}
      menuAriaLabel="Abrir navegación del docente"
      navigation={navigation}
      footer={footer}
      logoutAction={{
        label: "Cerrar sesión",
        confirmLabel: "Sí, cerrar sesión",
        description: "Si cerrás sesión, vas a tener que volver a ingresar.",
        redirectPath: "/",
        icon: IconLogout,
      }}
      topBarSlot={(
        <TeacherMessagesBell
          messages={messages}
          messagesHref={getTeacherSectionPathBySlug(teacherSlug, "mensajes")}
        />
      )}
    >
      {children}
    </RoleDashboardShell>
  );
}
