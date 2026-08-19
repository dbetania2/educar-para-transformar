"use client";

import {
  IconBook2,
  IconClipboardText,
  IconFileText,
  IconSchool,
} from "@tabler/icons-react";

import { ActionsMenu } from "@/components/molecules";

type StudentCourseActionsMenuProps = {
  courseHref?: string;
  gradesHref: string;
  attendanceHref: string;
  materialsHref: string;
  coursesHref: string;
};

export default function StudentCourseActionsMenu({
  courseHref,
  gradesHref,
  attendanceHref,
  materialsHref,
  coursesHref,
}: StudentCourseActionsMenuProps) {
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
          label: "Ver notas",
          icon: IconClipboardText,
          href: gradesHref,
        },
        {
          key: "attendance",
          label: "Ver asistencias",
          icon: IconSchool,
          href: attendanceHref,
        },
        {
          key: "materials",
          label: "Ver materiales",
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
