import { PageHeader } from "@/components/molecules";
import { Card, Stack, Text } from "@mantine/core";

export default function AdminPermisosPage() {
  return (
    <Stack gap="lg">
      <PageHeader
        title="Permisos"
        description="Matriz de permisos granulares por módulo y rol."
        breadcrumbs={[{ label: "Admin", href: "/admin/usuarios" }, { label: "Permisos" }]}
      />
      <Card withBorder radius="md" p="xl" bg="white">
        <Text c="dimmed">Módulo de matriz de permisos en configuración.</Text>
      </Card>
    </Stack>
  );
}
