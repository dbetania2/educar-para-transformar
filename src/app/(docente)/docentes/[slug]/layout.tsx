import TeacherShell from "@/components/organisms/TeacherShell/TeacherShell";
import { getTeacherCourses, requireTeacherRouteContext } from "@/lib/teacherDashboard";
import { getTeacherMessages } from "@/lib/tutorDashboard";

type TeacherLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

export default async function TeacherProtectedLayout({
  children,
  params,
}: Readonly<TeacherLayoutProps>) {
  const { slug } = await params;
  const [context, courses, messages] = await Promise.all([
    requireTeacherRouteContext(slug),
    getTeacherCourses(slug),
    getTeacherMessages(slug),
  ]);

  return (
    <TeacherShell
      teacherSlug={context.slug}
      teacherName={context.displayName}
      courses={courses.map((course) => ({ id: course.id, name: course.course_name }))}
      messages={messages.map((message) => ({
        id: message.id,
        message: message.message,
        created_at: message.created_at,
        read_at: message.read_at,
        tutor_name: message.tutor_name,
        student_name: message.student_name,
        course_name: message.course_name,
      }))}
    >
      {children}
    </TeacherShell>
  );
}
