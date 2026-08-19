import { redirect } from "next/navigation";

import { formatTeacherSectionPath, requireTeacherRouteContext } from "@/lib/teacherDashboard";

type TeacherRootPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TeacherRootPage({
  params,
}: TeacherRootPageProps) {
  const { slug } = await params;
  const context = await requireTeacherRouteContext(slug);

  redirect(formatTeacherSectionPath(context.slug, "cursos"));
}
