"use client";

import {
  IconBook2,
  IconClipboardText,
  IconFileText,
  IconSchool,
} from "@tabler/icons-react";

import { ActionsMenu } from "@/components/molecules";

type TeacherCourseActionsMenuProps = {
  courseHref?: string;
  gradesHref: string;
  attendanceHref: string;
  materialsHref: string;
  coursesHref: string;
};

export default function TeacherCourseActionsMenu({
  courseUrl,
  gradesUrl,
  attendanceUrl,
  materialsUrl,
  coursesListUrl,
}: TeacherCourseActionsProps) {
  return (
    <ActionsMenu
      label="Acciones del curso"
      items={[
        ...(courseHref
          ? [
              {
                key: "course",
                label: "Abrir curso",
                icon: IconBook2,
                href: courseHref,
              },
              { key: "divider-course", divider: true },
            ]
          : []),
        {
          key: "grades",
          label: "Cargar notas",
          icon: IconClipboardText,
          href: gradesHref,
        },
        {
          key: "attendance",
          label: "Tomar asistencia",
          icon: IconSchool,
          href: attendanceHref,
        },
        {
          key: "materials",
          label: "Materiales",
          icon: IconFileText,
          href: materialsHref,
        },
        { key: "divider", divider: true },
        {
          key: "courses",
          label: "Volver a cursos",
          icon: IconBook2,
          href: coursesHref,
        },
      ]}
    />
  );
}
