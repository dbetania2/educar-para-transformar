import { NextResponse } from "next/server";

import { requireTeacherCourseAccess } from "@/lib/teacherCourseAccess";

type AssessmentPayload = {
  assessmentId?: number;
  title?: string;
  description?: string | null;
  evaluationType?: string | null;
  maxScore?: number | string;
  evaluatedAt?: string | null;
  grades?: Array<{
    studentProfileId: string;
    score?: number | string | null;
    approved?: boolean | null;
    teacherComment?: string | null;
  }>;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function numberOrNull(value: unknown) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const access = await requireTeacherCourseAccess(Number(courseId));
  if ("error" in access) return access.error;

  const body = (await request.json().catch(() => null)) as AssessmentPayload | null;
  if (!body) return NextResponse.json({ error: "Payload inválido." }, { status: 400 });

  const title = text(body.title);
  const maxScore = numberOrNull(body.maxScore) ?? 10;
  if (!title || maxScore <= 0) return NextResponse.json({ error: "Ingresá evaluación y puntaje máximo válidos." }, { status: 400 });

  const payload = {
    course_id: access.courseId,
    title,
    description: text(body.description),
    evaluation_type: text(body.evaluationType),
    max_score: maxScore,
    evaluated_at: text(body.evaluatedAt) ?? new Date().toISOString().slice(0, 10),
    created_by: access.teacherProfileId,
  };

  const query = body.assessmentId
    ? await access.supabase.from("assessments").update(payload).eq("id", body.assessmentId).eq("course_id", access.courseId).select("id").single()
    : await access.supabase.from("assessments").insert(payload).select("id").single();

  if (query.error) return NextResponse.json({ error: query.error.message }, { status: 500 });

  return NextResponse.json({ ok: true, assessmentId: query.data.id });
}

export async function PATCH(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const access = await requireTeacherCourseAccess(Number(courseId));
  if ("error" in access) return access.error;

  const body = (await request.json().catch(() => null)) as AssessmentPayload | null;
  if (!body?.assessmentId || !Array.isArray(body.grades)) {
    return NextResponse.json({ error: "Payload inválido para cargar notas." }, { status: 400 });
  }

  const assessment = await access.supabase
    .from("assessments")
    .select("id, max_score")
    .eq("id", body.assessmentId)
    .eq("course_id", access.courseId)
    .maybeSingle();

  if (assessment.error) return NextResponse.json({ error: assessment.error.message }, { status: 500 });
  if (!assessment.data) return NextResponse.json({ error: "Evaluación no encontrada." }, { status: 404 });

  const rows = body.grades.map((grade) => ({
    assessment_id: body.assessmentId,
    student_profile_id: grade.studentProfileId,
    score: numberOrNull(grade.score),
    approved: typeof grade.approved === "boolean" ? grade.approved : null,
    teacher_comment: text(grade.teacherComment),
    recorded_by: access.teacherProfileId,
    recorded_at: new Date().toISOString(),
  }));

  const upsert = await access.supabase.from("grades").upsert(rows, { onConflict: "assessment_id,student_profile_id" });
  if (upsert.error) return NextResponse.json({ error: upsert.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
