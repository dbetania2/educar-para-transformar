import { redirect } from "next/navigation";

import AdminAccessTemplate from "@/components/templates/AdminAccessTemplate";
import { getProtectedHomePathForUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

type AdminAccessPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function AdminAccessPage({
  searchParams,
}: AdminAccessPageProps) {
  const supabase = await createClient();
  const [{ data }, resolvedSearchParams] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);

  if (data.user) {
    const homePath = getProtectedHomePathForUser(data.user);

    if (homePath) {
      redirect(homePath);
    }
  }

  return <AdminAccessTemplate reason={resolvedSearchParams.reason} />;
}
