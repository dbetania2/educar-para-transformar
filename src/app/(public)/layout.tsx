import { MainLayout } from "@/components/templates/MainLayout/MainLayout";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
}
