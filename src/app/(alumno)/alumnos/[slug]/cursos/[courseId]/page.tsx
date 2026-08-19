import { notFound } from "next/navigation";
import {
  IconBook2,
  IconChecklist,
  IconSchool,
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
  formatStudentCourseSectionPath,
  formatStudentHomePath,
  formatStudentSectionPath,
  getStudentAttendance,
  getStudentCourses,
  getStudentGrades,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentCourseDetailPageProps = {
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
};

export default async function StudentCourseDetailPage({
  params,
}: StudentCourseDetailPageProps) {
  const { slug, courseId } = await params;
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId)) {
    notFound();
  }

  const [context, coursesResult, gradesResult, attendanceResult] = await Promise.all([
    requireStudentRouteContext(slug),
    getStudentCourses(slug),
    getStudentGrades(slug),
    getStudentAttendance(slug),
  ]);

  const course = coursesResult.data.find((item) => item.id === parsedCourseId);

  if (!course) {
    notFound();
  }

  const gradesForCourse = gradesResult.data.filter(
    (record) => record.course_name === course.course_name,
  );
  const attendanceForCourse = attendanceResult.data.filter(
    (record) => record.course_name === course.course_name,
  );

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatStudentHomePath(context.slug) },
          { label: "Cursos", href: formatStudentSectionPath(context.slug, "cursos") },
          { label: course.course_name },
        ]}
        title={course.course_name}
        description="Esta materia concentra su información operativa, notas, asistencias y materiales."
        action={
          <StudentCourseActionsMenu
            gradesHref={formatStudentCourseSectionPath(context.slug, course.id, "notas")}
            attendanceHref={formatStudentCourseSectionPath(context.slug, course.id, "asistencias")}
            materialsHref={formatStudentCourseSectionPath(context.slug, course.id, "materiales")}
            coursesHref={formatStudentSectionPath(context.slug, "cursos")}
          />
        }
      />


      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconBook2 size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Estado del curso</Text>
            <Title order={2} c="brand.7">{course.status}</Title>
            <Text size="sm" c="dimmed">
              {course.academic_period ?? "Sin período académico informado."}
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconChecklist size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Evaluaciones</Text>
            <Title order={2} c="brand.7">{String(gradesForCourse.length)}</Title>
            <Text size="sm" c="dimmed">
              Evaluaciones registradas para esta materia dentro del esquema academico actual.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconSchool size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Clases registradas</Text>
            <Title order={2} c="brand.7">{String(attendanceForCourse.length)}</Title>
            <Text size="sm" c="dimmed">
              Seguimiento de asistencia asociado a esta materia.
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <div>
            <Title order={3} c="brand.7">Información del curso</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Datos operativos actuales de la materia.
            </Text>
          </div>

          <Stack gap="xs">
            <Text>Docente: {course.teacher_name ?? "Sin docente asignado"}</Text>
            <Text>Período: {course.academic_period ?? "Sin período informado"}</Text>
            <Text>Horario: {course.schedule_summary ?? "Sin horario cargado"}</Text>
            <Text>Aula: {course.classroom ? `Aula ${course.classroom}` : "Sin aula informada"}</Text>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
