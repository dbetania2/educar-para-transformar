import { redirect } from "next/navigation";

import {
  formatStudentSectionPath,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type LegacyStudentAttendancePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LegacyStudentAttendancePage({
  params,
}: LegacyStudentAttendancePageProps) {
  const { slug } = await params;
  const context = await requireStudentRouteContext(slug);

  redirect(formatStudentSectionPath(context.slug, "cursos"));
}
