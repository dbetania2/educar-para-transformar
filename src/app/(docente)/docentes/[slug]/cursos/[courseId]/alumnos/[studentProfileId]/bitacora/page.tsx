import { notFound } from "next/navigation";
import { Badge, Card, Group, Stack, Table, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from "@mantine/core";

import { AttendanceStatusBadge, CTAButton, StatusToneBadge } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import {
  formatDate,
  formatTeacherCoursePath,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  getTeacherStudentCourseReport,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherStudentReportPageProps = {
  params: Promise<{
    slug: string;
    courseId: string;
    studentProfileId: string;
  }>;
};

function formatScore(score: number | null, maxScore: number | null) {
  if (typeof score !== "number") {
    return "Sin nota";
  }

  return typeof maxScore === "number" ? `${score}/${maxScore}` : String(score);
}

function approvalTone(value: boolean | null) {
  if (value === true) return "success";
  if (value === false) return "pending";
  return "review";
}

function formatApproved(value: boolean | null) {
  if (value === true) return "Aprobada";
  if (value === false) return "Pendiente";
  return "Sin definir";
}

export default async function TeacherStudentReportPage({
  params,
}: TeacherStudentReportPageProps) {
  const { slug, courseId, studentProfileId } = await params;
  const parsedCourseId = Number(courseId);

  if (!Number.isInteger(parsedCourseId)) {
    notFound();
  }

  const [context, report] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherStudentCourseReport(slug, parsedCourseId, studentProfileId),
  ]);

  if (!report) {
    notFound();
  }

  const gradedItems = report.grades.filter((grade) => typeof grade.score === "number");
  const average = gradedItems.length > 0
    ? (gradedItems.reduce((total, grade) => total + (grade.score ?? 0), 0) / gradedItems.length).toFixed(1)
    : "Sin notas";
  const presentCount = report.attendance.filter((record) => record.status === "presente" || record.status === "tarde").length;
  const absentCount = report.attendance.filter((record) => record.status === "ausente").length;

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Cursos", href: formatTeacherSectionPath(context.slug, "cursos") },
          { label: report.course.course_name, href: formatTeacherCoursePath(context.slug, report.course.id) },
          { label: report.student.full_name },
        ]}
        title={`Bitácora de ${report.student.full_name}`}
        description="Reporte del alumno dentro del curso: notas, asistencia y estado de entregas disponible."
        action={
          <CTAButton href={formatTeacherCoursePath(context.slug, report.course.id)} ctaVariant="secondary" size="md">
            ← Volver al curso
          </CTAButton>
        }
      />

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="sm">
          <Title order={3} c="brand.7">Resumen operativo</Title>
          <Group gap="sm" wrap="wrap">
            <Badge variant="light" color="brand.7" radius="xl">Promedio: {average}</Badge>
            <Badge variant="light" color="green" radius="xl">Presentes: {presentCount}</Badge>
            <Badge variant="light" color="red" radius="xl">Ausentes: {absentCount}</Badge>
            <Badge variant="light" color="gray" radius="xl">Entregas: sin módulo</Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Legajo {report.student.student_code} · DNI {report.student.dni} · {report.student.email ?? "Sin correo"}
          </Text>
        </Stack>
      </Card>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <Title order={3} c="brand.7">Notas</Title>
          <TableScrollContainer minWidth={720}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <TableThead>
                <TableTr>
                  <TableTh>Evaluación</TableTh>
                  <TableTh>Fecha</TableTh>
                  <TableTh>Nota</TableTh>
                  <TableTh>Estado</TableTh>
                  <TableTh>Comentario</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {report.grades.length > 0 ? report.grades.map((grade) => (
                  <TableTr key={grade.assessment_id}>
                    <TableTd>
                      <Text fw={700}>{grade.title}</Text>
                      <Text size="sm" c="dimmed">{grade.evaluation_type ?? "Evaluación"}</Text>
                    </TableTd>
                    <TableTd>{formatDate(grade.evaluated_at) ?? "Sin fecha"}</TableTd>
                    <TableTd>{formatScore(grade.score, grade.max_score)}</TableTd>
                    <TableTd><StatusToneBadge tone={approvalTone(grade.approved)}>{formatApproved(grade.approved)}</StatusToneBadge></TableTd>
                    <TableTd>{grade.teacher_comment?.trim() || "Sin comentario"}</TableTd>
                  </TableTr>
                )) : (
                  <TableTr><TableTd colSpan={5}>Todavía no hay evaluaciones cargadas.</TableTd></TableTr>
                )}
              </TableTbody>
            </Table>
          </TableScrollContainer>
        </Stack>
      </Card>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="md">
          <Title order={3} c="brand.7">Asistencias</Title>
          <TableScrollContainer minWidth={640}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <TableThead>
                <TableTr>
                  <TableTh>Fecha</TableTh>
                  <TableTh>Tema</TableTh>
                  <TableTh>Estado</TableTh>
                  <TableTh>Observación</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {report.attendance.length > 0 ? report.attendance.map((record) => (
                  <TableTr key={record.session_id}>
                    <TableTd>{formatDate(record.session_date) ?? record.session_date}</TableTd>
                    <TableTd>{record.topic ?? "Sin tema"}</TableTd>
                    <TableTd><AttendanceStatusBadge status={record.status} /></TableTd>
                    <TableTd>{record.notes?.trim() || "Sin observación"}</TableTd>
                  </TableTr>
                )) : (
                  <TableTr><TableTd colSpan={4}>Todavía no hay clases cargadas.</TableTd></TableTr>
                )}
              </TableTbody>
            </Table>
          </TableScrollContainer>
        </Stack>
      </Card>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Stack gap="sm">
          <Title order={3} c="brand.7">Entregas</Title>
          <Text c="dimmed">
            Todavía no hay un módulo de entregas asociado a materiales o tareas. Cuando exista esa tabla, esta sección puede mostrar entregado, pendiente y fecha de entrega.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
