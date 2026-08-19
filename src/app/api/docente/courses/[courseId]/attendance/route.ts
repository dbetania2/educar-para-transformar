import { NextResponse } from "next/server";

import { requireTeacherCourseAccess } from "@/lib/teacherCourseAccess";

type AttendancePayload = {
  sessionId?: number;
  sessionDate?: string;
  topic?: string | null;
  records?: Array<{
    studentProfileId: string;
    status: "presente" | "ausente" | "justificada" | "tarde";
    notes?: string | null;
  }>;
};

const STATUSES = new Set(["presente", "ausente", "justificada", "tarde"]);
function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const access = await requireTeacherCourseAccess(Number(courseId));
  if ("error" in access) return access.error;

  const body = (await request.json().catch(() => null)) as AttendancePayload | null;
  const sessionDate = text(body?.sessionDate) ?? new Date().toISOString().slice(0, 10);

  const session = body?.sessionId
    ? await access.supabase.from("class_sessions").update({ session_date: sessionDate, topic: text(body.topic), created_by: access.teacherProfileId }).eq("id", body.sessionId).eq("course_id", access.courseId).select("id").single()
    : await access.supabase.from("class_sessions").insert({ course_id: access.courseId, session_date: sessionDate, topic: text(body?.topic), created_by: access.teacherProfileId }).select("id").single();

  if (session.error) return NextResponse.json({ error: session.error.message }, { status: 500 });

  if (Array.isArray(body?.records) && body.records.length > 0) {
    const rows = body.records
      .filter((record) => STATUSES.has(record.status))
      .map((record) => ({
        class_session_id: session.data.id,
        student_profile_id: record.studentProfileId,
        status: record.status,
        notes: text(record.notes),
        recorded_by: access.teacherProfileId,
        recorded_at: new Date().toISOString(),
      }));

    const upsert = await access.supabase.from("attendance_records").upsert(rows, { onConflict: "class_session_id,student_profile_id" });
    if (upsert.error) return NextResponse.json({ error: upsert.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sessionId: session.data.id });
}
