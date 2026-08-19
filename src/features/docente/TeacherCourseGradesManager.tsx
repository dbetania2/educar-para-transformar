"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ActionIcon, Badge, Card, Drawer, Grid, GridCol, Group, NumberInput, Select, Stack, Text, Textarea, TextInput, Title, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconClipboardCheck, IconPencil, IconReportAnalytics } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { ResponsiveDataTable, type ResponsiveDataTableColumn } from "@/components/molecules";
import type { TeacherAssessmentRecord, TeacherCourseStudentRecord } from "@/lib/teacherDashboard";

type Props = { courseId: number; assessments: TeacherAssessmentRecord[]; students: TeacherCourseStudentRecord[] };

type GradeDraft = { studentProfileId: string; score: string; approved: string; teacherComment: string };
type AssessmentForm = { assessmentId?: number; title: string; description: string; evaluationType: string; maxScore: string; evaluatedAt: string };

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

const emptyAssessmentForm: AssessmentForm = { title: "", description: "", evaluationType: "", maxScore: "10", evaluatedAt: getTodayInputDate() };

function stripHtml(value: string | null) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " " ).replace(/&nbsp;/g, " " ).replace(/\s+/g, " " ).trim();
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatScore(value: number | null | undefined) {
  return typeof value === "number" ? value.toFixed(1).replace(".0", "") : "Sin notas";
}

export default function TeacherCourseGradesManager({ courseId, assessments, students }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assessmentDrawer, setAssessmentDrawer] = useState(false);
  const [gradesDrawer, setGradesDrawer] = useState<TeacherAssessmentRecord | null>(null);
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(emptyAssessmentForm);
  const [gradeDrafts, setGradeDrafts] = useState<GradeDraft[]>([]);

  const studentNameById = useMemo(() => new Map(students.map((student) => [student.profile_id, student.full_name])), [students]);
  const courseBasePath = pathname.replace(/\/calificaciones$/, "");

  const openNewAssessment = () => {
    setAssessmentForm({ ...emptyAssessmentForm, evaluatedAt: getTodayInputDate() });
    setAssessmentDrawer(true);
  };

  const openEditAssessment = (assessment: TeacherAssessmentRecord) => {
    setAssessmentForm({
      assessmentId: assessment.id,
      title: assessment.title,
      description: assessment.description ?? "",
      evaluationType: assessment.evaluation_type ?? "",
      maxScore: assessment.max_score == null ? "10" : String(assessment.max_score),
      evaluatedAt: assessment.evaluated_at ? assessment.evaluated_at.slice(0, 10) : "",
    });
    setAssessmentDrawer(true);
  };

  const closeAssessmentDrawer = () => {
    setAssessmentDrawer(false);
    setAssessmentForm({ ...emptyAssessmentForm, evaluatedAt: getTodayInputDate() });
  };

  const openGrades = (assessment: TeacherAssessmentRecord) => {
    setGradesDrawer(assessment);
    setGradeDrafts(students.map((student) => {
      const existing = assessment.grades.find((grade) => grade.student_profile_id === student.profile_id);
      return {
        studentProfileId: student.profile_id,
        score: existing?.score == null ? "" : String(existing.score),
        approved: existing?.approved == null ? "" : String(existing.approved),
        teacherComment: existing?.teacher_comment ?? "",
      };
    }));
  };

  const saveAssessment = async () => {
    const response = await fetch(`/api/docente/courses/${courseId}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentForm),
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      notifications.show({ title: "No se pudo guardar", message: payload?.error ?? "Revisá los datos.", color: "red" });
      return;
    }
    closeAssessmentDrawer();
    notifications.show({ title: "Evaluación guardada", message: "La evaluación quedó actualizada.", color: "green" });
    startTransition(() => router.refresh());
  };

  const saveGrades = async () => {
    if (!gradesDrawer) return;
    const response = await fetch(`/api/docente/courses/${courseId}/assessments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentId: gradesDrawer.id,
        grades: gradeDrafts.map((draft) => ({
          studentProfileId: draft.studentProfileId,
          score: draft.score === "" ? null : Number(draft.score),
          approved: draft.approved === "" ? null : draft.approved === "true",
          teacherComment: draft.teacherComment,
        })),
      }),
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      notifications.show({ title: "No se pudieron guardar las notas", message: payload?.error ?? "Revisá los datos.", color: "red" });
      return;
    }
    setGradesDrawer(null);
    notifications.show({ title: "Notas guardadas", message: "Las calificaciones quedaron actualizadas.", color: "green" });
    startTransition(() => router.refresh());
  };

  const columns: ResponsiveDataTableColumn<TeacherAssessmentRecord>[] = [
    {
      key: "assessment",
      header: <Text fw={700}>Evaluación</Text>,
      mobileMinWidth: 260,
      render: (assessment) => (
        <Stack gap={4}>
          <Text fw={700} c="brand.7">{assessment.title}</Text>
          <Text size="sm" c="dimmed">{stripHtml(assessment.description) || assessment.evaluation_type || "Sin descripción"}</Text>
        </Stack>
      ),
    },
    {
      key: "date",
      header: <Text fw={700}>Fecha</Text>,
      mobileMinWidth: 130,
      noWrap: true,
      render: (assessment) => <Text size="sm">{formatDate(assessment.evaluated_at)}</Text>,
    },
    {
      key: "maxScore",
      header: <Text fw={700}>Máximo</Text>,
      mobileMinWidth: 100,
      noWrap: true,
      render: (assessment) => <Text size="sm">{assessment.max_score ?? 10}</Text>,
    },
    {
      key: "grades",
      header: <Text fw={700}>Notas</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (assessment) => <Badge variant="light" color="brand.7" radius="xl">{assessment.grade_count}</Badge>,
    },
    {
      key: "average",
      header: <Text fw={700}>Promedio</Text>,
      mobileMinWidth: 120,
      noWrap: true,
      render: (assessment) => <Text size="sm">{formatScore(assessment.average_score)}</Text>,
    },
    {
      key: "actions",
      header: <Text fw={700}>Acciones</Text>,
      mobileMinWidth: 150,
      noWrap: true,
      render: (assessment) => (
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Cargar notas">
            <ActionIcon
              variant="subtle"
              color="brand.7"
              radius="xl"
              size="lg"
              aria-label={`Cargar notas de ${assessment.title}`}
              disabled={students.length === 0}
              onClick={() => openGrades(assessment)}
            >
              <IconClipboardCheck size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar evaluación">
            <ActionIcon
              variant="subtle"
              color="brand.7"
              radius="xl"
              size="lg"
              aria-label={`Editar ${assessment.title}`}
              onClick={() => openEditAssessment(assessment)}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Group justify="space-between" align="center">
        <div>
          <Title order={3} c="brand.7">Evaluaciones</Title>
          <Text size="sm" c="dimmed" mt={4}>Administrá evaluaciones y cargá notas desde acciones.</Text>
        </div>
        <CTAButton onClick={openNewAssessment}>Nueva evaluación</CTAButton>
      </Group>

      <ResponsiveDataTable
        data={assessments}
        columns={columns}
        rowKey={(assessment) => assessment.id}
        emptyMessage="Todavía no hay evaluaciones cargadas para este curso."
      />

      <Drawer opened={assessmentDrawer} onClose={closeAssessmentDrawer} title={assessmentForm.assessmentId ? "Editar evaluación" : "Nueva evaluación"} position="right" size="min(100vw, 560px)" padding="xl">
        <Stack gap="md">
          <TextInput label="Título" required value={assessmentForm.title} onChange={(event) => setAssessmentForm({ ...assessmentForm, title: event.currentTarget.value })} />
          <Textarea label="Descripción" minRows={4} value={assessmentForm.description} onChange={(event) => setAssessmentForm({ ...assessmentForm, description: event.currentTarget.value })} />
          <TextInput label="Tipo" value={assessmentForm.evaluationType} onChange={(event) => setAssessmentForm({ ...assessmentForm, evaluationType: event.currentTarget.value })} />
          <NumberInput label="Puntaje máximo" min={1} value={assessmentForm.maxScore} onChange={(value) => setAssessmentForm({ ...assessmentForm, maxScore: String(value ?? "") })} />
          <CTAButton onClick={() => void saveAssessment()} disabled={pending} fullWidth>{assessmentForm.assessmentId ? "Guardar cambios" : "Guardar evaluación"}</CTAButton>
        </Stack>
      </Drawer>

      <Drawer opened={Boolean(gradesDrawer)} onClose={() => setGradesDrawer(null)} title={gradesDrawer ? `Notas: ${gradesDrawer.title}` : "Notas"} position="right" size="min(100vw, 720px)" padding="xl">
        <Stack gap="md">
          {gradeDrafts.map((draft, index) => (
            <Card key={draft.studentProfileId} withBorder radius="md" p="md">
              <Stack gap="sm">
                <Group justify="space-between" gap="sm" wrap="nowrap">
                  <Text fw={700}>{studentNameById.get(draft.studentProfileId) ?? "Alumno"}</Text>
                  <Tooltip label="Ver bitácora">
                    <ActionIcon
                      component={Link}
                      href={`${courseBasePath}/alumnos/${draft.studentProfileId}/bitacora`}
                      variant="subtle"
                      color="brand.7"
                      radius="xl"
                      size="lg"
                      aria-label={`Ver bitácora de ${studentNameById.get(draft.studentProfileId) ?? "alumno"}`}
                    >
                      <IconReportAnalytics size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Grid gutter="sm">
                  <GridCol span={{ base: 12, md: 3 }}>
                    <NumberInput label="Nota" value={draft.score} onChange={(value) => setGradeDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, score: String(value ?? "") } : item))} />
                  </GridCol>
                  <GridCol span={{ base: 12, md: 3 }}>
                    <Select label="Estado" data={[{ value: "true", label: "Aprobada" }, { value: "false", label: "Pendiente" }]} value={draft.approved} onChange={(value) => setGradeDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, approved: value ?? "" } : item))} clearable />
                  </GridCol>
                  <GridCol span={{ base: 12, md: 6 }}>
                    <Textarea
                      label="Comentario"
                      minRows={3}
                      value={draft.teacherComment}
                      onChange={(event) => {
                        const teacherComment = event.currentTarget.value;
                        setGradeDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, teacherComment } : item));
                      }}
                    />
                  </GridCol>
                </Grid>
              </Stack>
            </Card>
          ))}
          <CTAButton onClick={() => void saveGrades()} disabled={pending || students.length === 0} fullWidth>Guardar notas</CTAButton>
        </Stack>
      </Drawer>
    </>
  );
}
