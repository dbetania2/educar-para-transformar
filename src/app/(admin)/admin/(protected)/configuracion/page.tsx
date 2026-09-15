import { PageHeader } from "@/components/molecules";
import { Box, Card, Text } from "@mantine/core";

export default function AdminConfiguracionPage() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Configuración"
        description="Ajustes generales del panel administrativo."
        breadcrumbs={[{ label: "Admin", href: "/admin/usuarios" }, { label: "Configuración" }]}
      />
      <Card withBorder radius="md" p="xl" bg="white">
        <Text c="dimmed">Módulo de configuración global en desarrollo.</Text>
      </Card>
    </Box>
  );
}
