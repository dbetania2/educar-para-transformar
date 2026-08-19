import { redirect } from "next/navigation";

import {
  getProtectedHomePathForUser,
  getRoleFromUser,
  getTeacherSectionPath,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyTeacherCoursesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "docente") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  redirect(getTeacherSectionPath(data.user, "cursos"));
}
