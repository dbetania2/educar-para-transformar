import { PageHeader } from "@/components/molecules";
import { Box, Card, Text } from "@mantine/core";

export default function AdminReportesPage() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Reportes"
        description="Estadísticas generales y reportes del sistema."
        breadcrumbs={[{ label: "Admin", href: "/admin/usuarios" }, { label: "Reportes" }]}
      />
      <Card withBorder radius="md" p="xl" bg="white">
        <Text c="dimmed">Módulo de estadísticas y reportes en configuración.</Text>
      </Card>
    </Box>
  );
}
