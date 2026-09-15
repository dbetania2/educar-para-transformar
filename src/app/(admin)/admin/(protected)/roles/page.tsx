import { PageHeader } from "@/components/molecules";
import { Box, Card, Text } from "@mantine/core";

export default function AdminRolesPage() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Roles"
        description="Gestión de roles y perfiles de acceso en el sistema."
        breadcrumbs={[{ label: "Admin", href: "/admin/usuarios" }, { label: "Roles" }]}
      />
      <Card withBorder radius="md" p="xl" bg="white">
        <Text c="dimmed">Módulo de gestión de roles en configuración.</Text>
      </Card>
    </Box>
  );
}
