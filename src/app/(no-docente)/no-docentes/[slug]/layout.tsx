import NoDocenteShell from "@/components/organisms/NoDocenteShell/NoDocenteShell";
import { requireNoDocenteRouteContext } from "@/lib/noDocenteDashboard";

type NoDocenteLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function NoDocenteProtectedLayout({
  children,
  params,
}: Readonly<NoDocenteLayoutProps>) {
  const { slug } = await params;
  const context = await requireNoDocenteRouteContext(slug);

  return (
    <NoDocenteShell
      noDocenteSlug={context.slug}
      noDocenteName={context.displayName}
    >
      {children}
    </NoDocenteShell>
  );
}
