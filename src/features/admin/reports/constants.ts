import type {
  EducationalLevel,
  ReportTabType,
  SportReportGroupingMode,
} from "./types";
import { SPORTS_CATALOG, TRANSPORT_ROUTES } from "@/lib/extracurricular";

export const REPORT_TAB_OPTIONS: Array<{
  value: ReportTabType;
  label: string;
  description: string;
}> = [
  {
    value: "students_by_course",
    label: "Alumnos por Curso",
    description: "Listado nominal de alumnos por Nivel Educativo y Curso/División en orden alfabético.",
  },
  {
    value: "students_by_subject",
    label: "Alumnos por Materia",
    description: "Listado analítico de alumnos matriculados por Materia, Curso y Docente a cargo.",
  },
  {
    value: "teachers_by_level",
    label: "Docentes por Nivel",
    description: "Distribución de profesores, especialidad, materias y comisiones por Nivel Educativo.",
  },
  {
    value: "students_by_sport",
    label: "Alumnos por Deporte",
    description: "Listados por disciplina deportiva, nivel educativo, horario de práctica y profesor a cargo.",
  },
  {
    value: "students_by_transport",
    label: "Transporte y Comedor",
    description: "Padrón de alumnos por recorrido de micro escolar fijo y régimen de comedor asignado.",
  },
];

export const SPORT_GROUPING_OPTIONS: Array<{
  value: SportReportGroupingMode;
  label: string;
}> = [
  {
    value: "by_sport",
    label: "Por Deporte",
  },
  {
    value: "by_sport_level",
    label: "Por Deporte + Nivel",
  },
  {
    value: "by_sport_level_schedule_teacher",
    label: "Deporte + Nivel + Horario + Profesor",
  },
];

export const SPORT_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Todos los deportes" },
  ...SPORTS_CATALOG.map((sport) => ({
    value: sport.name,
    label: sport.name,
  })),
];

export const TRANSPORT_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Todos los recorridos" },
  ...TRANSPORT_ROUTES.map((route) => ({
    value: route,
    label: route,
  })),
];

export const EDUCATIONAL_LEVEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Todos los niveles" },
  { value: "Inicial", label: "Nivel Inicial" },
  { value: "Primario", label: "Nivel Primario" },
  { value: "Secundario", label: "Nivel Secundario" },
];

export const LEVEL_COLOR_HEX: Record<EducationalLevel, string> = {
  Inicial: "#0d9488",
  Primario: "#2563eb",
  Secundario: "#7c3aed",
};

export function inferEducationalLevel(
  courseName: string,
  commission?: string | null,
  subjectName?: string | null,
): EducationalLevel {
  const combined = `${courseName} ${commission ?? ""} ${subjectName ?? ""}`.toLowerCase();

  if (
    combined.includes("inicial") ||
    combined.includes("ini-") ||
    combined.includes("sala de 4") ||
    combined.includes("sala de 5") ||
    combined.includes("jardín") ||
    combined.includes("jardin")
  ) {
    return "Inicial";
  }

  if (
    combined.includes("secundaria") ||
    combined.includes("secundario") ||
    combined.includes("sec-") ||
    combined.includes("física") ||
    combined.includes("química") ||
    combined.includes("biología")
  ) {
    return "Secundario";
  }

  return "Primario";
}

export function extractCourseDivision(courseName: string, commission?: string | null): string {
  const parts = courseName.split(" - ");
  if (parts.length >= 2) {
    return parts[parts.length - 1].trim();
  }
  if (commission && commission.trim().length > 0) {
    return commission.trim();
  }
  return courseName.trim();
}

