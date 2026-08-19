import {
  IconBook2,
  IconClockHour4,
  IconUserCheck,
} from "@tabler/icons-react";
import {
  Card,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import { PageHeader } from "@/components/molecules";
import StudentCourseActionsMenu from "@/features/alumno/StudentCourseActionsMenu";
import {
  formatDate,
  formatStudentCoursePath,
  formatStudentCourseSectionPath,
  formatStudentHomePath,
  formatStudentRequestStatus,
  formatStudentSectionPath,
  getStudentCourses,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentCoursesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StudentCoursesPage({
  params,
}: StudentCoursesPageProps) {
  const { slug } = await params;
  const [context, coursesResult] = await Promise.all([
    requireStudentRouteContext(slug),
    getStudentCourses(slug),
  ]);

  const activeCourses = coursesResult.data.filter((course) => course.status === "activa");
  const nextScheduledCourse =
    activeCourses.find((course) => course.schedule_summary)?.schedule_summary ?? null;
  const uniqueTeachers = new Set(
    activeCourses
      .map((course) => course.teacher_name?.trim())
      .filter((teacher): teacher is string => Boolean(teacher)),
  );

  const overviewItems = [
    `Estado de inscripción: ${formatStudentRequestStatus(context.request?.status ?? null)}`,
    `Nivel declarado: ${context.request?.level ?? "Sin nivel informado"}`,
    `Solicitud creada: ${formatDate(context.request?.created_at ?? null) ?? "Sin fecha"}`,
    `Última revisión administrativa: ${formatDate(context.request?.reviewed_at ?? null) ?? "Sin revisión todavía"}`,
  ];

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatStudentHomePath(context.slug) },
          { label: "Cursos" },
        ]}
        title="Mis cursos"
        description="Cada materia concentra su propio detalle, con notas y asistencias dentro del curso correspondiente."
      />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconBook2 size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Cursos activos</Text>
            <Title order={2} c="brand.7">{String(activeCourses.length)}</Title>
            <Text size="sm" c="dimmed">
              Materias activas registradas para tu cuenta.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconClockHour4 size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Próximo bloque</Text>
            <Title order={2} c="brand.7">{nextScheduledCourse ?? "Sin agenda"}</Title>
            <Text size="sm" c="dimmed">
              Se muestra el primer horario real cargado para tus materias.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconUserCheck size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Docentes</Text>
            <Title order={2} c="brand.7">{String(uniqueTeachers.size)}</Title>
            <Text size="sm" c="dimmed">
              Docentes distintos asociados a tus cursos activos.
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="md">
            <div>
              <Title order={3} c="brand.7">Cursos asignados</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Cada curso abre acciones operativas para seguimiento, notas, asistencias y materiales.
              </Text>
            </div>

            <Stack gap="md">
              {coursesResult.data.length > 0 ? (
                coursesResult.data.map((course) => (
                  <Card key={course.id} withBorder radius="lg" p="lg" bg="var(--mantine-color-brand-0)">
                    <Stack gap="sm">
                      <div>
                        <Title order={4} c="brand.7">{course.course_name}</Title>
                        <Text size="sm" c="dimmed" mt={4}>
                          {[
                            course.teacher_name,
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

                      <StudentCourseActionsMenu
                        courseHref={formatStudentCoursePath(context.slug, course.id)}
                        gradesHref={formatStudentCourseSectionPath(context.slug, course.id, "notas")}
                        attendanceHref={formatStudentCourseSectionPath(context.slug, course.id, "asistencias")}
                        materialsHref={formatStudentCourseSectionPath(context.slug, course.id, "materiales")}
                        coursesHref={formatStudentSectionPath(context.slug, "cursos")}
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

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="md">
            <div>
              <Title order={3} c="brand.7">Estado académico inicial</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Datos administrativos vinculados a tu alta como alumno.
              </Text>
            </div>

            <Stack gap="xs">
              {overviewItems.map((item) => (
                <Text key={item}>{item}</Text>
              ))}
            </Stack>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
