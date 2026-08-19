import { notFound } from "next/navigation";

import StudentCourseAttendanceFeature from "@/features/alumno/StudentCourseAttendanceFeature";
import {
  formatStudentCoursePath,
  formatStudentHomePath,
  formatStudentSectionPath,
  getStudentAttendance,
  getStudentCourses,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentCourseAttendancePageProps = {
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
};

export default async function StudentCourseAttendancePage({
  params,
}: StudentCourseAttendancePageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId)) {
    notFound();
  }

  const [context, coursesResult, attendanceResult] = await Promise.all([
    requireStudentRouteContext(slug),
    getStudentCourses(slug),
    getStudentAttendance(slug),
  ]);

  const course = coursesResult.data.find((item) => item.id === parsedCourseId);

  if (!course) {
    notFound();
  }

  const attendanceForCourse = attendanceResult.data.filter(
    (record) => record.course_name === course.course_name,
  );
  return (
    <StudentCourseAttendanceFeature
      courseName={course.course_name}
      breadcrumbs={[
        { label: "Campus", href: formatStudentHomePath(context.slug) },
        { label: "Cursos", href: formatStudentSectionPath(context.slug, "cursos") },
        { label: course.course_name, href: formatStudentCoursePath(context.slug, course.id) },
        { label: "Asistencias" },
      ]}
      backHref={formatStudentCoursePath(context.slug, course.id)}
      description="El presentismo queda calculado dentro de la materia a la que pertenece cada clase registrada."
      records={attendanceForCourse}
      emptyMessage="Todavia no hay asistencias cargadas para esta materia."
      summaryItems={[]}
    />
  );
}
