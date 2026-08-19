import { RouteSectionLoader } from "@/components/molecules";

export default function Loading() {
  return (
    <RouteSectionLoader
      title="Cargando campus"
      description="Estamos preparando el contenido del alumno y sus materias."
      loadingLabel="Cargando informacion del campus..."
      breadcrumbs={[{ label: "Campus" }]}
    />
  );
}
