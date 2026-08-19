import StudentShell from "@/components/organisms/StudentShell/StudentShell";
import { getStudentCourses, requireStudentRouteContext } from "@/lib/studentDashboard";

type StudentLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export default async function StudentProtectedLayout({
  children,
  params,
}: Readonly<StudentLayoutProps>) {
  const { slug } = await params;
  const [context, coursesResult] = await Promise.all([
    requireStudentRouteContext(slug),
    getStudentCourses(slug),
  ]);

  return (
    <StudentShell
      studentSlug={context.slug}
      studentName={context.displayName}
      courses={coursesResult.data.map((course) => ({ id: course.id, name: course.course_name }))}
    >
      {children}
    </StudentShell>
  );
}
