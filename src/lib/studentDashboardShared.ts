export type StudentCourseRecord = {
  id: number;
  course_name: string;
  teacher_name: string | null;
  academic_period: string | null;
  schedule_summary: string | null;
  classroom: string | null;
  status: "activa" | "completada" | "pausada" | "cancelada";
  created_at: string;
};

export type StudentGradeRecord = {
  id: number;
  course_name: string;
  evaluation_name: string;
  grade_value: number | null;
  max_grade_value: number | null;
  approved: boolean | null;
  teacher_comment: string | null;
  evaluated_at: string | null;
  created_at: string;
};

export type StudentAttendanceRecord = {
  id: number;
  course_name: string;
  class_date: string;
  status: "presente" | "ausente" | "justificada" | "tarde";
  notes: string | null;
  created_at: string;
};

export function formatStudentAttendanceStatus(status: StudentAttendanceRecord["status"]) {
  switch (status) {
    case "presente":
      return "Presente";
    case "ausente":
      return "Ausente";
    case "justificada":
      return "Justificada";
    case "tarde":
      return "Llegada tarde";
    default:
      return status;
  }
}

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    ...options,
  }).format(parsedDate);
}
