import { redirect } from "next/navigation";

import { getProtectedHomePathForUser, getRoleFromUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLegacyProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "alumno") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  return children;
}
