import { redirect } from "next/navigation";

import {
  getProtectedHomePathForUser,
  getRoleFromUser,
  getStudentSectionPath,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyStudentGradesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "alumno") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  redirect(getStudentSectionPath(data.user, "cursos"));
}
