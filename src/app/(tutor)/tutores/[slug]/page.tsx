import { IconCalendarClock, IconSchool, IconUsersGroup } from "@tabler/icons-react";

import StudentSectionTemplate from "@/components/templates/StudentSectionTemplate";
import {
  formatDate,
  formatTutorHomePath,
  formatTutorSectionPath,
  getTutorStudents,
  requireTutorRouteContext,
} from "@/lib/tutorDashboard";

type TutorRootPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TutorRootPage({ params }: TutorRootPageProps) {
  const { slug } = await params;
  const [context, students] = await Promise.all([
    requireTutorRouteContext(slug),
    getTutorStudents(slug),
  ]);

  return (
    <StudentSectionTemplate
      breadcrumbs={[
        { label: "Campus", href: formatTutorHomePath(context.slug) },
        { label: "Inicio" },
      ]}
      title={`Hola, ${context.displayName}`}
      description="Este tablero reúne el seguimiento académico de los hijos vinculados al tutor."
      highlights={[
        {
          label: "Campus",
          value: "Tutor",
          description: "Acceso de lectura al seguimiento académico familiar.",
          icon: IconSchool,
        },
        {
          label: "Hijos vinculados",
          value: String(students.length),
          description: "Un tutor puede ver más de un alumno asociado.",
          icon: IconUsersGroup,
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
          title: "Seguimiento",
          description: "Cada hijo tiene sus cursos y una bitácora por materia.",
          items: students.length > 0
            ? students.map((student) => `${student.full_name}: ${student.student_code ?? "sin legajo"}`)
            : ["Todavía no hay hijos vinculados a este perfil de tutor."],
        },
        {
          title: "Comunicación",
          description: "Los comentarios se envían al docente encargado del curso.",
          items: [
            `Listado de hijos: ${formatTutorSectionPath(context.slug, "hijos")}`,
            "Notas, asistencias y materiales se consultan dentro de cada curso.",
            "La sección de entregas queda preparada hasta tener un módulo de tareas.",
          ],
        },
      ]}
    />
  );
}
