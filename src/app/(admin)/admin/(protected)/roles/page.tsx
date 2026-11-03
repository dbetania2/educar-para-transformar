import { PageHeader } from "@/components/molecules";
import { Card, Stack, Text } from "@mantine/core";

export default function AdminRolesPage() {
  return (
    <Stack gap="lg">
      <PageHeader
        title="Roles"
        description="Gestión de roles y perfiles de acceso en el sistema."
        breadcrumbs={[{ label: "Admin", href: "/admin/usuarios" }, { label: "Roles" }]}
      />
      <Card withBorder radius="md" p="xl" bg="white">
        <Text c="dimmed">Módulo de gestión de roles en configuración.</Text>
      </Card>
    </Stack>
  );
}
