import { redirect } from "next/navigation";

import { PaddingContainer } from "@/components/atoms";
import AdminShell from "@/components/organisms/AdminShell/AdminShell";
import { getRoleFromUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/admin");
  }

  if (getRoleFromUser(data.user) !== "administrativo") {
    redirect("/admin?reason=forbidden");
  }

  return (
    <AdminShell>
      <PaddingContainer size="xl">{children}</PaddingContainer>
    </AdminShell>
  );
}
