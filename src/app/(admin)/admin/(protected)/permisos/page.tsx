import { PageHeader } from "@/components/molecules";
import { Box, Card, Text } from "@mantine/core";

export default function AdminPermisosPage() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Permisos"
        description="Matriz de permisos granulares por módulo y rol."
        breadcrumbs={[{ label: "Admin", href: "/admin/usuarios" }, { label: "Permisos" }]}
      />
      <Card withBorder radius="md" p="xl" bg="white">
        <Text c="dimmed">Módulo de matriz de permisos en configuración.</Text>
      </Card>
    </Box>
  );
}
