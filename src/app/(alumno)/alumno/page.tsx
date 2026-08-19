import { redirect } from "next/navigation";

import { getProtectedHomePathForUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyStudentAccessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const homePath = getProtectedHomePathForUser(data.user);

    if (homePath) {
      redirect(homePath);
    }
  }

  redirect("/");
}
