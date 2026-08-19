import { NextResponse } from "next/server";

import { getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ReadMessagesPayload = {
  messageIds?: number[];
  markAll?: boolean;
};

function isReadMessagesPayload(payload: unknown): payload is ReadMessagesPayload {
  if (!payload || typeof payload !== "object") return false;

  const candidate = payload as Record<string, unknown>;
  const hasValidMessageIds =
    Array.isArray(candidate.messageIds) &&
    candidate.messageIds.length > 0 &&
    candidate.messageIds.every((messageId) => Number.isInteger(messageId) && messageId > 0);
  const marksAll = candidate.markAll === true;

  return marksAll || hasValidMessageIds;
}

function isMissingColumnError(error: { code?: string; message?: string } | null, columnName: string) {
  return error?.code === "42703" || error?.message?.includes(`${columnName} does not exist`);
}

async function getTeacherCourseIds(teacherProfileId: string) {
  const supabase = createAdminClient();
  const [directCoursesQuery, linkedCoursesQuery] = await Promise.all([
    supabase.from("courses").select("id").eq("teacher_profile_id", teacherProfileId),
    supabase.from("course_teachers").select("course_id").eq("teacher_profile_id", teacherProfileId),
  ]);

  if (directCoursesQuery.error) {
    throw new Error(directCoursesQuery.error.message ?? "No se pudieron obtener los cursos del docente.");
  }

  if (linkedCoursesQuery.error) {
    throw new Error(linkedCoursesQuery.error.message ?? "No se pudieron obtener las asignaciones del docente.");
  }

  return Array.from(new Set([
    ...((directCoursesQuery.data ?? []) as Array<{ id: number }>).map((course) => course.id),
    ...((linkedCoursesQuery.data ?? []) as Array<{ course_id: number }>).map((course) => course.course_id),
  ]));
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Tenés que iniciar sesión." }, { status: 401 });
  }

  if (getRoleFromUser(data.user) !== "docente") {
    return NextResponse.json({ error: "Solo un docente puede marcar mensajes como leídos." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (!isReadMessagesPayload(body)) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const profileQuery = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (profileQuery.error) {
    return NextResponse.json({ error: profileQuery.error.message ?? "No se pudo validar el docente." }, { status: 500 });
  }

  const teacherProfileId = profileQuery.data?.id as string | undefined;

  if (!teacherProfileId) {
    return NextResponse.json({ error: "No se encontró el perfil del docente." }, { status: 409 });
  }

  try {
    const courseIds = await getTeacherCourseIds(teacherProfileId);

    if (courseIds.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    let updateQuery = adminSupabase
      .from("tutor_teacher_messages")
      .update({ read_at: new Date().toISOString() })
      .in("course_id", courseIds)
      .is("read_at", null);

    if (!body.markAll) {
      updateQuery = updateQuery.in("id", body.messageIds ?? []);
    }

    const { data: updatedRows, error: updateError } = await updateQuery.select("id");

    if (isMissingColumnError(updateError, "read_at")) {
      return NextResponse.json({ ok: true, updated: 0, persisted: false });
    }

    if (updateError) {
      return NextResponse.json({ error: updateError.message ?? "No se pudieron marcar los mensajes." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: updatedRows?.length ?? 0 });
  } catch (readError) {
    return NextResponse.json(
      { error: readError instanceof Error ? readError.message : "No se pudieron marcar los mensajes." },
      { status: 500 },
    );
  }
}
