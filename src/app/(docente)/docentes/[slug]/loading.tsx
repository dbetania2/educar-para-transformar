import { RouteSectionLoader } from "@/components/molecules";

export default function Loading() {
  return (
    <RouteSectionLoader
      title="Cargando campus"
      description="Estamos preparando el contenido del docente y sus cursos."
      loadingLabel="Cargando informacion del campus docente..."
      breadcrumbs={[{ label: "Campus" }]}
    />
  );
}
