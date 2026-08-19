import { NextResponse } from "next/server";

import { getLegajoFromUser } from "@/lib/auth/legajo";
import { getProtectedHomePathForUser, getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AccessError = { error: NextResponse };
type AccessSuccess = {
  supabase: ReturnType<typeof createAdminClient>;
  userId: string;
  teacherProfileId: string;
  courseId: number;
};

function isNoRowsError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

async function getTeacherProfileId(
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
    throw new Error(profileQuery.error.message ?? "No se pudo obtener el perfil docente.");
  }

  if (profileQuery.data?.id) {
    return profileQuery.data.id as string;
  }

  if (!legajo) {
    return null;
  }

  const teacherQuery = await supabase
    .from("teachers")
    .select("profile_id")
    .eq("teacher_code", legajo)
    .maybeSingle();

  if (teacherQuery.error && !isNoRowsError(teacherQuery.error)) {
    throw new Error(teacherQuery.error.message ?? "No se pudo obtener el docente por legajo.");
  }

  return (teacherQuery.data?.profile_id as string | undefined) ?? null;
}

export async function requireTeacherCourseAccess(courseId: number): Promise<AccessError | AccessSuccess> {
  if (!Number.isInteger(courseId)) {
    return { error: NextResponse.json({ error: "Curso inválido." }, { status: 400 }) };
  }

  const sessionSupabase = await createClient();
  const { data, error } = await sessionSupabase.auth.getUser();

  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Debés iniciar sesión." }, { status: 401 }) };
  }

  if (getRoleFromUser(data.user) !== "docente") {
    return {
      error: NextResponse.json(
        { error: "Solo un docente puede gestionar este curso.", redirectTo: getProtectedHomePathForUser(data.user) ?? "/" },
        { status: 403 },
      ),
    };
  }

  const supabase = createAdminClient();
  const teacherProfileId = await getTeacherProfileId(supabase, data.user.id, getLegajoFromUser(data.user));

  if (!teacherProfileId) {
    return { error: NextResponse.json({ error: "No se encontró el perfil docente." }, { status: 409 }) };
  }

  const directCourse = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("teacher_profile_id", teacherProfileId)
    .maybeSingle();

  if (directCourse.error && !isNoRowsError(directCourse.error)) {
    throw new Error(directCourse.error.message ?? "No se pudo validar el curso.");
  }

  if (!directCourse.data) {
    const linkedCourse = await supabase
      .from("course_teachers")
      .select("course_id")
      .eq("course_id", courseId)
      .eq("teacher_profile_id", teacherProfileId)
      .maybeSingle();

    if (linkedCourse.error && !isNoRowsError(linkedCourse.error)) {
      throw new Error(linkedCourse.error.message ?? "No se pudo validar la asignación del curso.");
    }

    if (!linkedCourse.data) {
      return { error: NextResponse.json({ error: "No tenés asignado este curso." }, { status: 403 }) };
    }
  }

  return { supabase, userId: data.user.id, teacherProfileId, courseId };
}
