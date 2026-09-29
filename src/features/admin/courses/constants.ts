import type { AdminCourse } from "./types";

export const COURSE_STATUS_OPTIONS = [
  { value: "activa", label: "Activa" },
  { value: "completada", label: "Completada" },
  { value: "pausada", label: "Pausada" },
  { value: "cancelada", label: "Cancelada" },
];

export function courseStatusTone(status: AdminCourse["status"]) {
  if (status === "activa") return "success" as const;
  if (status === "pausada") return "review" as const;
  if (status === "cancelada") return "danger" as const;
  return "pending" as const;
}

export function courseStatusLabel(status: AdminCourse["status"]) {
  return COURSE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export const LEVEL_OPTIONS = [
  { value: "Inicial", label: "Nivel Inicial (Jardín)" },
  { value: "Primario", label: "Nivel Primario" },
  { value: "Secundario", label: "Nivel Secundario" },
];

export const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  Inicial: [
    "Actividades Integradas",
    "Educación Física Inicial",
    "Expresión Musical",
    "Taller de Arte",
    "Iniciación al Juego",
  ],
  Primario: [
    "Matemática",
    "Lengua y Literatura",
    "Ciencias Naturales",
    "Ciencias Sociales",
    "Inglés",
    "Educación Física",
    "Educación Artística",
    "Tecnología",
  ],
  Secundario: [
    "Matemática",
    "Lengua y Literatura",
    "Física",
    "Química",
    "Biología",
    "Historia",
    "Geografía",
    "Formación Ética y Ciudadana",
    "Inglés",
    "Educación Física",
    "Informática y Programación",
  ],
};

export const COMMISSION_OPTIONS = [
  "1° A", "1° B", "2° A", "2° B", "3° A", "3° B", "4° A", "4° B", "5° A", "5° B", "6° A", "6° B"
];

export const ACADEMIC_TERM_OPTIONS = [
  "Ciclo lectivo 2026",
  "Ciclo lectivo 2027",
  "Ciclo lectivo 2025",
];

export const YEAR_OPTIONS = ["2026", "2027", "2025"];

export const CLASSROOM_OPTIONS = [
  "Aula 1", "Aula 2", "Aula 3", "Aula 4", "Aula 5", "Laboratorio de Ciencias", "Laboratorio de Informática", "SUM / Gimnasio"
];

export const SCHEDULE_OPTIONS = [
  "Lunes y miércoles 08:00 a 09:30",
  "Martes y jueves 08:00 a 09:30",
  "Lunes y miércoles 10:00 a 11:30",
  "Martes y jueves 10:00 a 11:30",
  "Viernes 09:00 a 10:30",
  "Lunes a viernes 14:00 a 16:00",
];
