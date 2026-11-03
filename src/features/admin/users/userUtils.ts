export const STUDENT_LEVEL_OPTIONS = [
  { value: "Inicial", label: "Inicial" },
  { value: "Primario", label: "Primario" },
  { value: "Secundario", label: "Secundario" },
];

export function getRoleDescription(role: string): string {
  if (role === "tutor") return "Puede gestionar y acompañar a los estudiantes a su cargo.";
  if (role === "docente") return "Puede gestionar calificaciones, asistencias y contenidos de sus cursos.";
  if (role === "alumno") return "Acceso a cursos, calificaciones y ficha del estudiante.";
  if (role === "administrativo") return "Acceso completo a la gestión del campus y usuarios.";
  if (role === "no_docente") return "Acceso a gestiones operativas y administrativas asignadas.";
  return "Usuario del sistema.";
}

export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

export function getUserAvatarBg(role: string, name?: string | null): string {
  if (role === "administrativo") return "#2563eb";
  if (role === "tutor") {
    if (name?.toLowerCase().includes("ricardo")) return "#16a34a";
    if (name?.toLowerCase().includes("carolina")) return "#db2777";
    return "#7c3aed";
  }
  if (role === "docente") {
    if (name?.toLowerCase().includes("agustin")) return "#d97706";
    if (name?.toLowerCase().includes("nicolas")) return "#4f46e5";
    return "#0d9488";
  }
  return "#2563eb";
}

export function getRequestStatusLabel(status: string | null): string {
  if (status === "pendiente") return "Pendiente";
  if (status === "en_revision") return "En revisión";
  if (status === "aprobada") return "Aprobada";
  if (status === "rechazada") return "Rechazada";
  return "Sin solicitud asociada";
}

export function getRequestStatusColor(status: string | null): string {
  if (status === "aprobada") return "green";
  if (status === "rechazada") return "red";
  if (status === "en_revision") return "yellow";
  if (status === "pendiente") return "blue";
  return "gray";
}

