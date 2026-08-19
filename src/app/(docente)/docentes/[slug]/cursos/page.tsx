import {
  Card,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { PageHeader } from "@/components/molecules";
import TeacherCourseActionsMenu from "@/features/docente/TeacherCourseActionsMenu";
import {
  formatTeacherCoursePath,
  formatTeacherCourseSectionPath,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  getTeacherCourses,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherCoursesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TeacherCoursesPage({
  params,
}: TeacherCoursesPageProps) {
  const { slug } = await params;
  const [context, courses] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherCourses(slug),
  ]);

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Cursos" },
        ]}
        title="Mis cursos"
        description="Cada curso muestra el bloque operativo ya asignado al docente dentro del modelo académico actual."
      />


      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <div>
            <Title order={3} c="brand.7">Cursos asignados</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Cada curso abre acciones operativas para seguimiento, calificaciones, asistencias y materiales.
            </Text>
          </div>

          <Stack gap="md">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.id} withBorder radius="lg" p="lg" bg="var(--mantine-color-brand-0)">
                  <Stack gap="md">
                    <div>
                      <Title order={4} c="brand.7">{course.course_name}</Title>
                      <Text size="sm" c="dimmed" mt={4}>
                        {[
                          course.subject_name,
                          course.academic_period,
                          course.schedule_summary,
                          course.classroom ? `Aula ${course.classroom}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Todavía no hay más detalle operativo cargado para esta materia."}
                      </Text>
                    </div>

                    <Text size="sm" fw={700} c="brand.7">
                      Estado: {course.status}
                    </Text>

                    <TeacherCourseActionsMenu
                      courseHref={formatTeacherCoursePath(context.slug, course.id)}
                      gradesHref={formatTeacherCourseSectionPath(context.slug, course.id, "calificaciones")}
                      attendanceHref={formatTeacherCourseSectionPath(context.slug, course.id, "asistencias")}
                      materialsHref={formatTeacherCourseSectionPath(context.slug, course.id, "materiales")}
                      coursesHref={formatTeacherSectionPath(context.slug, "cursos")}
                    />
                  </Stack>
                </Card>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                Todavía no tenés cursos asignados en la base actual.
              </Text>
            )}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
