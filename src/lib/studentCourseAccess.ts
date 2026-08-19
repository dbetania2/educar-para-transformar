import { NextResponse } from "next/server";

import { getLegajoFromUser } from "@/lib/auth/legajo";
import { getProtectedHomePathForUser, getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AccessError = { error: NextResponse };
type AccessSuccess = {
  supabase: ReturnType<typeof createAdminClient>;
  userId: string;
  studentProfileId: string;
  courseId: number;
};

function isNoRowsError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

async function getStudentProfileId(
  supabase: ReturnType<typeof createAdminClient>,
  authUserId: string,
  legajo: string | null,
) {
  const profileQuery = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (profileQuery.error && !isNoRowsError(profileQuery.error)) {
    throw new Error(profileQuery.error.message ?? "No se pudo obtener el perfil del alumno.");
  }

  if (profileQuery.data?.id) {
    return profileQuery.data.id as string;
  }

  if (!legajo) return null;

  const studentQuery = await supabase
    .from("students")
    .select("profile_id")
    .eq("student_code", legajo)
    .maybeSingle();

  if (studentQuery.error && !isNoRowsError(studentQuery.error)) {
    throw new Error(studentQuery.error.message ?? "No se pudo obtener el alumno por legajo.");
  }

  return (studentQuery.data?.profile_id as string | undefined) ?? null;
}

export async function requireStudentCourseAccess(courseId: number): Promise<AccessError | AccessSuccess> {
  if (!Number.isInteger(courseId)) {
    return { error: NextResponse.json({ error: "Curso inválido." }, { status: 400 }) };
  }

  const sessionSupabase = await createClient();
  const { data, error } = await sessionSupabase.auth.getUser();

  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 }) };
  }

  if (getRoleFromUser(data.user) !== "alumno") {
    return {
      error: NextResponse.json(
        { error: "Solo un alumno puede publicar desde este acceso.", redirectTo: getProtectedHomePathForUser(data.user) ?? "/" },
        { status: 403 },
      ),
    };
  }

  const supabase = createAdminClient();
  const studentProfileId = await getStudentProfileId(supabase, data.user.id, getLegajoFromUser(data.user));

  if (!studentProfileId) {
    return { error: NextResponse.json({ error: "No se encontró el perfil del alumno." }, { status: 409 }) };
  }

  const enrollment = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("course_id", courseId)
    .eq("student_profile_id", studentProfileId)
    .eq("enrollment_status", "activa")
    .maybeSingle();

  if (enrollment.error && !isNoRowsError(enrollment.error)) {
    throw new Error(enrollment.error.message ?? "No se pudo validar la inscripción del curso.");
  }

  if (!enrollment.data) {
    return { error: NextResponse.json({ error: "No estás inscripto en este curso." }, { status: 403 }) };
  }

  return { supabase, userId: data.user.id, studentProfileId, courseId };
}
