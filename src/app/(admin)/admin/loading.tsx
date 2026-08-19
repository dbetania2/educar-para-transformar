import { RouteSectionLoader } from "@/components/molecules";

export default function Loading() {
  return (
    <RouteSectionLoader
      title="Cargando panel"
      description="Estamos preparando la informacion administrativa."
      loadingLabel="Cargando panel administrativo..."
      breadcrumbs={[{ label: "Admin" }]}
    />
  );
}
