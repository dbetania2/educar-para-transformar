import TutorShell from "@/components/organisms/TutorShell/TutorShell";
import { getTutorStudents, requireTutorRouteContext } from "@/lib/tutorDashboard";

type TutorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function TutorProtectedLayout({
  children,
  params,
}: Readonly<TutorLayoutProps>) {
  const { slug } = await params;
  const [context, students] = await Promise.all([
    requireTutorRouteContext(slug),
    getTutorStudents(slug),
  ]);

  return (
    <TutorShell
      tutorSlug={context.slug}
      tutorName={context.displayName}
      students={students.map((student) => ({ profileId: student.profile_id, name: student.full_name }))}
    >
      {children}
    </TutorShell>
  );
}
