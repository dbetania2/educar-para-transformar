import {
  Card,
  SimpleGrid,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTr,
  Text,
  Title,
} from "@mantine/core";

import { CTAButton } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import {
  formatDate,
  formatTeacherHomePath,
  formatTeacherSectionPath,
  requireTeacherRouteContext,
} from "@/lib/teacherDashboard";

type TeacherProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProfileInfoItem = {
  label: string;
  value: string;
  hint?: string;
};

function ProfileInfoTable({ items }: { items: ProfileInfoItem[] }) {
  return (
    <Card withBorder radius="lg" p={0} bg="var(--mantine-color-gray-0)" style={{ overflow: "hidden" }}>
      <Table horizontalSpacing="md" verticalSpacing="sm" withRowBorders>
        <TableTbody>
          {items.map((item) => {
            const isEmail = /^\S+@\S+\.\S+$/.test(item.value);

            return (
              <TableTr key={item.label}>
                <TableTd w="34%" miw={108} style={{ verticalAlign: "top" }}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ overflowWrap: "break-word" }}>
                    {item.label}
                  </Text>
                </TableTd>
                <TableTd style={{ minWidth: 0, verticalAlign: "top" }}>
                  <Text
                    fw={700}
                    c="brand.7"
                    title={item.value}
                    style={isEmail
                      ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                      : { overflowWrap: "break-word", wordBreak: "normal" }}
                  >
                    {item.value}
                  </Text>
                  {item.hint ? (
                    <Text size="sm" c="dimmed" mt={2} style={{ overflowWrap: "break-word" }}>
                      {item.hint}
                    </Text>
                  ) : null}
                </TableTd>
              </TableTr>
            );
          })}
        </TableTbody>
      </Table>
    </Card>
  );
}

export default async function TeacherProfilePage({
  params,
}: TeacherProfilePageProps) {
  const { slug } = await params;
  const context = await requireTeacherRouteContext(slug);

  const adminState = context.teacher ? "Operativo" : "Pendiente";

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatTeacherHomePath(context.slug) },
          { label: "Perfil" },
        ]}
        title="Configuracion de perfil"
        description="La ficha docente se organiza en bloques claros para identidad, contacto y estado institucional."
        action={
          <CTAButton href={formatTeacherSectionPath(context.slug, "cursos")} ctaVariant="secondary" size="md">
            ← Volver a cursos
          </CTAButton>
        }
      />


      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={3} c="brand.7">Identidad institucional</Title>
              <Text size="sm" c="dimmed">
                Datos base sincronizados entre autenticación, perfil académico y registro docente.
              </Text>
            </Stack>

            <ProfileInfoTable
              items={[{
                label: "Nombre",
                value: context.displayName,
                hint: "Nombre mostrado actualmente dentro del campus docente.",
              }, {
                label: "Correo",
                value: context.profile?.email ?? context.user.email ?? "Sin correo",
                hint: "Correo principal asociado a la cuenta.",
              }, {
                label: "DNI",
                value: context.profile?.dni ?? "Sin DNI",
                hint: "Documento cargado en la base institucional.",
              }, {
                label: "Telefono",
                value: context.profile?.phone ?? "Sin telefono",
                hint: "Canal de contacto actualmente sincronizado.",
              }]}
            />
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={3} c="brand.7">Estado del registro</Title>
              <Text size="sm" c="dimmed">
                Señales rápidas para validar si el docente quedó completo dentro del circuito institucional.
              </Text>
            </Stack>

            <ProfileInfoTable
              items={[{
                label: "Registro docente",
                value: adminState,
                hint: "Confirma si existe una fila vinculada en la tabla de docentes.",
              }, {
                label: "Alta",
                value: formatDate(context.teacher?.hire_date ?? null) ?? "Sin fecha",
                hint: "Fecha institucional asociada al alta del docente.",
              }]}
            />
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
