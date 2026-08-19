import { notFound } from "next/navigation";

import StudentCourseGradesFeature from "@/features/alumno/StudentCourseGradesFeature";
import {
  formatStudentCoursePath,
  formatStudentHomePath,
  formatStudentSectionPath,
  getStudentCourses,
  getStudentGrades,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentCourseGradesPageProps = {
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
};

export default async function StudentCourseGradesPage({
  params,
}: StudentCourseGradesPageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId)) {
    notFound();
  }

  const [context, coursesResult, gradesResult] = await Promise.all([
    requireStudentRouteContext(slug),
    getStudentCourses(slug),
    getStudentGrades(slug),
  ]);

  const course = coursesResult.data.find((item) => item.id === parsedCourseId);

  if (!course) {
    notFound();
  }

  const gradesForCourse = gradesResult.data.filter(
    (record) => record.course_name === course.course_name,
  );
  return (
    <StudentCourseGradesFeature
      courseName={course.course_name}
      breadcrumbs={[
        { label: "Campus", href: formatStudentHomePath(context.slug) },
        { label: "Cursos", href: formatStudentSectionPath(context.slug, "cursos") },
        { label: course.course_name, href: formatStudentCoursePath(context.slug, course.id) },
        { label: "Notas" },
      ]}
      backHref={formatStudentCoursePath(context.slug, course.id)}
      description="Las calificaciones quedan contextualizadas dentro de la materia a la que pertenecen."
      grades={gradesForCourse}
      emptyMessage="Todavia no hay calificaciones cargadas para esta materia."
      commentItems={[]}
    />
  );
}
