import { NextResponse } from "next/server";

import { getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type MessagePayload = {
  studentProfileId: string;
  courseId: number;
  message: string;
};

function isMessagePayload(payload: unknown): payload is MessagePayload {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.studentProfileId === "string" &&
    candidate.studentProfileId.length > 0 &&
    typeof candidate.courseId === "number" &&
    Number.isInteger(candidate.courseId) &&
    typeof candidate.message === "string" &&
    candidate.message.trim().length >= 3 &&
    candidate.message.trim().length <= 2000
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Tenés que iniciar sesión." }, { status: 401 });
  }

  if (getRoleFromUser(data.user) !== "tutor") {
    return NextResponse.json({ error: "Solo un tutor puede enviar comentarios." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (!isMessagePayload(body)) {
    return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const profileQuery = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (profileQuery.error) {
    return NextResponse.json({ error: profileQuery.error.message ?? "No se pudo validar el tutor." }, { status: 500 });
  }

  const tutorProfileId = profileQuery.data?.id as string | undefined;

  if (!tutorProfileId) {
    return NextResponse.json({ error: "No se encontró el perfil del tutor." }, { status: 409 });
  }

  const guardianQuery = await adminSupabase
    .from("student_guardians")
    .select("student_profile_id")
    .eq("guardian_profile_id", tutorProfileId)
    .eq("student_profile_id", body.studentProfileId)
    .maybeSingle();

  if (guardianQuery.error) {
    return NextResponse.json({ error: guardianQuery.error.message ?? "No se pudo validar el vínculo familiar." }, { status: 500 });
  }

  if (!guardianQuery.data) {
    return NextResponse.json({ error: "No tenés acceso a este alumno." }, { status: 403 });
  }

  const enrollmentQuery = await adminSupabase
    .from("course_enrollments")
    .select("course_id, courses!inner ( teacher_profile_id )")
    .eq("student_profile_id", body.studentProfileId)
    .eq("course_id", body.courseId)
    .eq("enrollment_status", "activa")
    .maybeSingle();

  if (enrollmentQuery.error) {
    return NextResponse.json({ error: enrollmentQuery.error.message ?? "No se pudo validar el curso." }, { status: 500 });
  }

  if (!enrollmentQuery.data) {
    return NextResponse.json({ error: "El alumno no está inscripto en este curso." }, { status: 403 });
  }

  const course = Array.isArray(enrollmentQuery.data.courses)
    ? enrollmentQuery.data.courses[0]
    : enrollmentQuery.data.courses;

  const insertQuery = await adminSupabase
    .from("tutor_teacher_messages")
    .insert({
      tutor_profile_id: tutorProfileId,
      student_profile_id: body.studentProfileId,
      course_id: body.courseId,
      teacher_profile_id: course?.teacher_profile_id ?? null,
      message: body.message.trim(),
    })
    .select("id")
    .single();

  if (insertQuery.error) {
    return NextResponse.json({ error: insertQuery.error.message ?? "No se pudo enviar el mensaje." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: insertQuery.data.id });
}
