import { IconCalendarClock, IconClipboardList, IconFileCheck } from "@tabler/icons-react";

import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import {
  formatDate,
  formatNoDocenteHomePath,
  formatNoDocenteSectionPath,
  getNoDocenteOverview,
  requireNoDocenteRouteContext,
} from "@/lib/noDocenteDashboard";

type NoDocenteRootPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NoDocenteRootPage({ params }: NoDocenteRootPageProps) {
  const { slug } = await params;
  const [context, overview] = await Promise.all([
    requireNoDocenteRouteContext(slug),
    getNoDocenteOverview(slug),
  ]);

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatNoDocenteHomePath(context.slug) },
        { label: "Inicio" },
      ]}
      title={`Hola, ${context.displayName}`}
      description="Tablero operativo basado en los datos activos reales del sistema."
      highlights={[
        {
          label: "Pendientes",
          value: String(overview.pendingRequests + overview.reviewRequests + overview.pendingTasks),
          description: "Solicitudes y tareas reales abiertas.",
          icon: IconClipboardList,
        },
        {
          label: "Legajos incompletos",
          value: String(overview.incompleteProfiles),
          description: "Alumnos activos sin email o teléfono cargado.",
          icon: IconFileCheck,
        },
        {
          label: "Último acceso",
          value: formatDate(context.user.lastSignInAt, { dateStyle: "short" }) ?? "Primer ingreso",
          description: "Referencia rápida de actividad del usuario.",
          icon: IconCalendarClock,
        },
      ]}
      sections={[
        {
          title: "Trabajo administrativo",
          description: "Accesos principales del rol no docente.",
          items: [
            `Pendientes: ${formatNoDocenteSectionPath(context.slug, "pendientes")}`,
            `Legajos: ${formatNoDocenteSectionPath(context.slug, "legajos")}`,
            `Mensajes: ${formatNoDocenteSectionPath(context.slug, "mensajes")}`,
            `Reportes: ${formatNoDocenteSectionPath(context.slug, "reportes")}`,
          ],
        },
        {
          title: "Resumen operativo",
          description: "Conteos actuales de la base activa.",
          items: [
            `Solicitudes nuevas: ${overview.pendingRequests}`,
            `Solicitudes en revisión: ${overview.reviewRequests}`,
            `Mensajes de contacto recibidos: ${overview.contactMessages}`,
            `Alumnos activos: ${overview.activeStudents}`,
            `Tutores activos: ${overview.activeTutors}`,
            `Docentes activos: ${overview.activeTeachers}`,
            `No docentes activos: ${overview.activeNoDocentes}`,
            `Administradores activos: ${overview.activeAdmins}`, 
          ],
        },
      ]}
    />
  );
}
