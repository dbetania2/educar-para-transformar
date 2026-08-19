import {
  IconCalendarClock,
  IconClipboardText,
  IconSchool,
} from "@tabler/icons-react";

import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import {
  formatDate,
  formatStudentCourseSectionPath,
  formatStudentHomePath,
  formatStudentRequestStatus,
  formatStudentSectionPath,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentRootPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StudentRootPage({
  params,
}: StudentRootPageProps) {
  const { slug } = await params;
  const context = await requireStudentRouteContext(slug);

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatStudentHomePath(context.slug) },
        { label: "Inicio" },
      ]}
      title={`Hola, ${context.displayName}`}
      description="Este tablero inicial organiza el campus por materias. Cada curso concentra sus propias notas y asistencias."
      highlights={[
        {
          label: "Campus",
          value: "Activo",
          description: "Tu acceso al espacio del alumno ya está habilitado.",
          icon: IconSchool,
        },
        {
          label: "Estado",
          value: formatStudentRequestStatus(context.request?.status ?? null),
          description: "Estado administrativo actual de tu ficha de alumno.",
          icon: IconClipboardText,
        },
        {
          label: "Último acceso",
          value: formatDate(context.user.lastSignInAt, { dateStyle: "short" }) ?? "Primer ingreso",
          description: "Referencia rápida de actividad en el campus.",
          icon: IconCalendarClock,
        },
      ]}
      sections={[
        {
          title: "Tu perfil inicial",
          description: "Datos base ya vinculados a tu cuenta.",
          items: [
            `Nombre: ${context.displayName}`,
            `Correo: ${context.request?.email ?? context.user.email ?? "Sin correo"}`,
            `Nivel: ${context.request?.level ?? "Sin nivel informado"}`,
            `Solicitud: ${context.request ? `#${context.request.id}` : "Sin solicitud asociada"}`,
          ],
        },
        {
          title: "Estructura del campus",
          description: "Rutas principales del modelo actual del alumno.",
          items: [
            `Cursos: ${formatStudentSectionPath(context.slug, "cursos")}`,
            `Perfil: ${formatStudentSectionPath(context.slug, "perfil")}`,
            `Notas por materia: ${formatStudentCourseSectionPath(context.slug, "[courseId]", "notas")}`,
            `Asistencias por materia: ${formatStudentCourseSectionPath(context.slug, "[courseId]", "asistencias")}`,
          ],
        },
        {
          title: "Qué sigue",
          description: "Primeros pasos recomendados para este dashboard.",
          items: [
            "Definir qué información querés ver primero en la portada del alumno.",
            "Cargar cursos reales cuando la operación académica esté lista.",
            "Vincular notas y asistencias siempre dentro de cada materia registrada.",
          ],
        },
      ]}
    />
  );
}
