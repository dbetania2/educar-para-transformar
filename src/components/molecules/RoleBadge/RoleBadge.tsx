"use client";

import { IconShieldCheck, IconUser } from "@tabler/icons-react";
import { USER_ROLE_LABELS, type AppUserRole } from "@/lib/auth/roles";
import { useStyles } from "./RoleBadge.style";

type RoleBadgeProps = {
  role: AppUserRole | string;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const { classes } = useStyles();

  if (role === "administrativo") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeAdmin}`} title="Usuario Administrativo">
        <IconShieldCheck size={14} aria-hidden="true" /> ADMINISTRATIVO
      </span>
    );
  }
  if (role === "tutor") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeTutor}`} title="Tutor">
        <IconUser size={14} aria-hidden="true" /> TUTOR
      </span>
    );
  }
  if (role === "docente") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeDocente}`} title="Docente">
        <IconShieldCheck size={14} aria-hidden="true" /> DOCENTE
      </span>
    );
  }
  if (role === "alumno") {
    return (
      <span className={`${classes.roleBadge} ${classes.badgeAlumno}`} title="Alumno">
        <IconUser size={14} aria-hidden="true" /> ALUMNO
      </span>
    );
  }

  // Fallback (ej. no_docente)
  return (
    <span className={`${classes.roleBadge} ${classes.badgeNoDocente}`} title={USER_ROLE_LABELS[role as AppUserRole] ?? role}>
      <IconUser size={14} aria-hidden="true" /> {USER_ROLE_LABELS[role as AppUserRole] ?? role}
    </span>
  );
}
