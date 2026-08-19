export const USER_ROLE_OPTIONS = [
  { value: "alumno", label: "Alumno" },
  { value: "tutor", label: "Tutor" },
  { value: "docente", label: "Docente" },
  { value: "administrativo", label: "Administrativo" },
  { value: "no_docente", label: "No docente" },
] as const;

export type AppUserRole = (typeof USER_ROLE_OPTIONS)[number]["value"];
export type StudentSection = "cursos" | "perfil";
export type StudentCourseSection = "notas" | "asistencias" | "materiales";
export const STUDENT_ACCESS_PATH = "/alumnos";
export type TeacherSection = "cursos" | "perfil" | "mensajes";
export type TeacherCourseSection = "calificaciones" | "asistencias" | "materiales";
export const TEACHER_ACCESS_PATH = "/docentes";
export type TutorSection = "hijos";
export const TUTOR_ACCESS_PATH = "/tutores";
export type NoDocenteSection = "pendientes" | "legajos" | "mensajes" | "reportes";
export const NO_DOCENTE_ACCESS_PATH = "/no-docentes";

type UserRoleCarrier = {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type UserRouteCarrier = UserRoleCarrier & {
  email?: string | null;
  id?: string;
};

export const USER_ROLE_LABELS: Record<AppUserRole | "desconocido", string> = {
  alumno: "Alumno",
  tutor: "Tutor",
  docente: "Docente",
  administrativo: "Administrativo",
  no_docente: "No docente",
  desconocido: "Desconocido",
};

export function normalizeRole(rawRole: unknown): AppUserRole | "desconocido" {
  if (typeof rawRole !== "string") {
    return "desconocido";
  }

  const role = rawRole.trim().toLowerCase();

  if (role === "student" || role === "alumno") {
    return "alumno";
  }

  if (role === "tutor") {
    return "tutor";
  }

  if (role === "teacher" || role === "docente") {
    return "docente";
  }

  if (role === "administrative" || role === "administrativo") {
    return "administrativo";
  }

  if (
    role === "non_teaching" ||
    role === "non-teaching" ||
    role === "no_docente" ||
    role === "no-docente"
  ) {
    return "no_docente";
  }

  return "desconocido";
}

export function getRoleFromUser(user: UserRoleCarrier) {
  return normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);
}

export function getUserDisplayName(user: UserRouteCarrier) {
  const fullName = user.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim().length > 0) {
    return fullName.trim();
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    return user.email.split("@")[0].replace(/[._]+/g, " ").trim();
  }

  return "alumno";
}

export function slugifyRouteSegment(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "alumno";
}

export function getStudentSlug(user: UserRouteCarrier) {
  const slug = slugifyRouteSegment(getUserDisplayName(user));

  if (slug !== "alumno") {
    return slug;
  }

  if (typeof user.id === "string" && user.id.length > 0) {
    return `alumno-${user.id.slice(0, 8)}`;
  }

  return slug;
}

export function getStudentHomePathBySlug(slug: string) {
  return `${STUDENT_ACCESS_PATH}/${slug}`;
}

export function getStudentSectionPathBySlug(slug: string, section: StudentSection) {
  return `${getStudentHomePathBySlug(slug)}/${section}`;
}

export function getStudentCoursePathBySlug(slug: string, courseId: string | number) {
  return `${getStudentSectionPathBySlug(slug, "cursos")}/${courseId}`;
}

export function getStudentCourseSectionPathBySlug(
  slug: string,
  courseId: string | number,
  section: StudentCourseSection,
) {
  return `${getStudentCoursePathBySlug(slug, courseId)}/${section}`;
}

export function getStudentHomePath(user: UserRouteCarrier) {
  return getStudentHomePathBySlug(getStudentSlug(user));
}

export function getStudentSectionPath(user: UserRouteCarrier, section: StudentSection) {
  return getStudentSectionPathBySlug(getStudentSlug(user), section);
}

export function getTeacherSlug(user: UserRouteCarrier) {
  const slug = slugifyRouteSegment(getUserDisplayName(user));

  if (slug !== "alumno") {
    return slug;
  }

  if (typeof user.id === "string" && user.id.length > 0) {
    return `docente-${user.id.slice(0, 8)}`;
  }

  return "docente";
}

export function getTeacherHomePathBySlug(slug: string) {
  return `${TEACHER_ACCESS_PATH}/${slug}`;
}

export function getTeacherSectionPathBySlug(slug: string, section: TeacherSection) {
  return `${getTeacherHomePathBySlug(slug)}/${section}`;
}

export function getTeacherCoursePathBySlug(slug: string, courseId: string | number) {
  return `${getTeacherSectionPathBySlug(slug, "cursos")}/${courseId}`;
}

export function getTeacherCourseSectionPathBySlug(
  slug: string,
  courseId: string | number,
  section: TeacherCourseSection,
) {
  return `${getTeacherCoursePathBySlug(slug, courseId)}/${section}`;
}

export function getTeacherHomePath(user: UserRouteCarrier) {
  return getTeacherHomePathBySlug(getTeacherSlug(user));
}

export function getTeacherSectionPath(user: UserRouteCarrier, section: TeacherSection) {
  return getTeacherSectionPathBySlug(getTeacherSlug(user), section);
}

export function getTutorSlug(user: UserRouteCarrier) {
  const slug = slugifyRouteSegment(getUserDisplayName(user));

  if (slug !== "alumno") {
    return slug;
  }

  if (typeof user.id === "string" && user.id.length > 0) {
    return `tutor-${user.id.slice(0, 8)}`;
  }

  return "tutor";
}

export function getTutorHomePathBySlug(slug: string) {
  return `${TUTOR_ACCESS_PATH}/${slug}`;
}

export function getTutorSectionPathBySlug(slug: string, section: TutorSection) {
  return `${getTutorHomePathBySlug(slug)}/${section}`;
}

export function getTutorStudentPathBySlug(slug: string, studentProfileId: string) {
  return `${getTutorSectionPathBySlug(slug, "hijos")}/${studentProfileId}`;
}

export function getTutorStudentCoursePathBySlug(
  slug: string,
  studentProfileId: string,
  courseId: string | number,
) {
  return `${getTutorStudentPathBySlug(slug, studentProfileId)}/cursos/${courseId}`;
}

export function getTutorHomePath(user: UserRouteCarrier) {
  return getTutorHomePathBySlug(getTutorSlug(user));
}

export function getTutorSectionPath(user: UserRouteCarrier, section: TutorSection) {
  return getTutorSectionPathBySlug(getTutorSlug(user), section);
}

export function getNoDocenteSlug(user: UserRouteCarrier) {
  const slug = slugifyRouteSegment(getUserDisplayName(user));

  if (slug !== "alumno") {
    return slug;
  }

  if (typeof user.id === "string" && user.id.length > 0) {
    return `no-docente-${user.id.slice(0, 8)}`;
  }

  return "no-docente";
}

export function getNoDocenteHomePathBySlug(slug: string) {
  return `${NO_DOCENTE_ACCESS_PATH}/${slug}`;
}

export function getNoDocenteSectionPathBySlug(slug: string, section: NoDocenteSection) {
  return `${getNoDocenteHomePathBySlug(slug)}/${section}`;
}

export function getNoDocenteHomePath(user: UserRouteCarrier) {
  return getNoDocenteHomePathBySlug(getNoDocenteSlug(user));
}

export function getNoDocenteSectionPath(user: UserRouteCarrier, section: NoDocenteSection) {
  return getNoDocenteSectionPathBySlug(getNoDocenteSlug(user), section);
}

export function getProtectedHomePathForUser(user: UserRouteCarrier) {
  const role = getRoleFromUser(user);

  if (role === "administrativo") {
    return "/admin/usuarios";
  }

  if (role === "alumno") {
    return getStudentHomePath(user);
  }

  if (role === "docente") {
    return getTeacherHomePath(user);
  }

  if (role === "tutor") {
    return getTutorHomePath(user);
  }

  if (role === "no_docente") {
    return getNoDocenteHomePath(user);
  }

  return null;
}
