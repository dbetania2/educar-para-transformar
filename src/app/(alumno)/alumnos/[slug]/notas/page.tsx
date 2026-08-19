import { redirect } from "next/navigation";

import {
  formatStudentSectionPath,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type LegacyStudentGradesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LegacyStudentGradesPage({
  params,
}: LegacyStudentGradesPageProps) {
  const { slug } = await params;
  const context = await requireStudentRouteContext(slug);

  redirect(formatStudentSectionPath(context.slug, "cursos"));
}
