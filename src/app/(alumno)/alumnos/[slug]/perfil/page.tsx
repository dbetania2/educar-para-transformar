import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTr,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconIdBadge2,
  IconLockCog,
  IconMail,
  IconPhone,
  IconShield,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import {
  formatDate,
  formatStudentHomePath,
  formatStudentRequestStatus,
  formatStudentSectionPath,
  requireStudentRouteContext,
} from "@/lib/studentDashboard";

type StudentProfilePageProps = {
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

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { slug } = await params;
  const context = await requireStudentRouteContext(slug);
  const responsibleNames = context.request?.responsible_type === "tutor"
    ? [context.request.tutor_full_name].filter((value): value is string => Boolean(value))
    : [context.request?.father_full_name, context.request?.mother_full_name].filter(
      (value): value is string => Boolean(value),
    );

  const profileState = context.request ? "Sincronizado" : "Basico";
  const securityState = context.user.lastSignInAt ? "Activa" : "Pendiente";
  const adminState = formatStudentRequestStatus(context.request?.status ?? null);

  return (
    <Stack gap="pageGapLg">
      <PageHeader
        breadcrumbs={[
          { label: "Campus", href: formatStudentHomePath(context.slug) },
          { label: "Perfil" },
        ]}
        title="Configuracion de perfil"
        description="La ficha del alumno se organiza en bloques claros para identidad, contacto y estado institucional."
        action={
          <CTAButton href={formatStudentSectionPath(context.slug, "cursos")} ctaVariant="secondary" size="md">
            ← Volver a cursos
          </CTAButton>
        }
      />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconUserCircle size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Perfil</Text>
            <Title order={2} c="brand.7">{profileState}</Title>
            <Text size="sm" c="dimmed">
              Indica si la cuenta ya esta vinculada a una solicitud institucional aprobada.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconIdBadge2 size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Legajo</Text>
            <Title order={2} c="brand.7">{context.request ? String(context.request.id) : "Sin solicitud"}</Title>
            <Text size="sm" c="dimmed">
              Referencia institucional usada hoy para vincular la cuenta con la ficha del alumno.
            </Text>
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="sm">
            <ThemeIcon size={46} radius="xl" variant="light" color="brand.7">
              <IconLockCog size={22} stroke={1.8} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="dimmed">Seguridad</Text>
            <Title order={2} c="brand.7">{securityState}</Title>
            <Text size="sm" c="dimmed">
              Estado inferido a partir de la actividad reciente de la cuenta autenticada.
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Stack gap={4}>
                <Title order={3} c="brand.7">Identidad del alumno</Title>
                <Text size="sm" c="dimmed">
                  Informacion principal vinculada a la cuenta autenticada.
                </Text>
              </Stack>
              <Badge variant="light" color="brand.7" radius="xl" size="lg">
                {adminState}
              </Badge>
            </Group>

            <ProfileInfoTable
              items={[{
                label: "Nombre completo",
                value: context.displayName,
                hint: "Nombre visible actual del alumno en el campus.",
              }, {
                label: "Correo",
                value: context.request?.email ?? context.user.email ?? "Sin correo",
                hint: "Correo principal asociado al acceso.",
              }, {
                label: "DNI",
                value: context.request?.student_dni ?? "Sin DNI vinculado",
                hint: "Documento informado en la ficha institucional.",
              }, {
                label: "Nivel",
                value: context.request?.level ?? "Sin nivel declarado",
                hint: "Nivel o tramo educativo informado hasta el momento.",
              }]}
            />
          </Stack>
        </Card>

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={3} c="brand.7">Contacto y responsables</Title>
              <Text size="sm" c="dimmed">
                Datos traidos desde la inscripcion aprobada y el historial institucional.
              </Text>
            </Stack>

            <ProfileInfoTable
              items={[{
                label: "Telefono",
                value: context.request?.contact_phone ?? "Sin telefono",
                hint: "Canal de contacto prioritario registrado.",
              }, {
                label: "Responsables",
                value: responsibleNames.length > 0 ? responsibleNames.join(", ") : "Sin responsables vinculados",
                hint: "Adultos asociados actualmente a la ficha del alumno.",
              }, {
                label: "Solicitud creada",
                value: formatDate(context.request?.created_at ?? null) ?? "Sin fecha",
                hint: "Fecha de alta de la solicitud institucional.",
              }, {
                label: "Ultima revision",
                value: formatDate(context.request?.reviewed_at ?? null) ?? "Sin revision",
                hint: "Ultimo control administrativo registrado.",
              }]}
            />

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Card withBorder radius="lg" p="md" bg="var(--mantine-color-gray-0)">
                <Stack gap="xs" align="center" ta="center">
                  <ThemeIcon size={40} radius="xl" variant="light" color="brand.7">
                    <IconMail size={18} />
                  </ThemeIcon>
                  <Stack gap={2} align="center" style={{ width: "100%", minWidth: 0 }}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Canal</Text>
                    <Text size="xs" fw={700} c="brand.7" style={{ width: "100%", whiteSpace: "normal", wordBreak: "keep-all" }}>Correo</Text>
                  </Stack>
                </Stack>
              </Card>
              <Card withBorder radius="lg" p="md" bg="var(--mantine-color-gray-0)">
                <Stack gap="xs" align="center" ta="center">
                  <ThemeIcon size={40} radius="xl" variant="light" color="brand.7">
                    <IconPhone size={18} />
                  </ThemeIcon>
                  <Stack gap={2} align="center" style={{ width: "100%", minWidth: 0 }}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Seguimiento</Text>
                    <Text size="xs" fw={700} c="brand.7" style={{ width: "100%", whiteSpace: "normal", wordBreak: "keep-all" }}>Contacto</Text>
                  </Stack>
                </Stack>
              </Card>
              <Card withBorder radius="lg" p="md" bg="var(--mantine-color-gray-0)">
                <Stack gap="xs" align="center" ta="center">
                  <ThemeIcon size={40} radius="xl" variant="light" color="brand.7">
                    <IconUsers size={18} />
                  </ThemeIcon>
                  <Stack gap={2} align="center" style={{ width: "100%", minWidth: 0 }}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Resguardo</Text>
                    <Text size="xs" fw={700} c="brand.7" style={{ width: "100%", whiteSpace: "normal", wordBreak: "keep-all" }}>Responsables</Text>
                  </Stack>
                </Stack>
              </Card>
            </SimpleGrid>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="white">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
          <Stack gap={4}>
            <Title order={4} c="brand.7">Estado institucional</Title>
            <Text size="sm" c="dimmed">
              Resumen rapido del estado administrativo y de seguridad de la cuenta.
            </Text>
          </Stack>

          <Group gap="sm" wrap="wrap">
            <Badge variant="light" color="brand.7" radius="xl" leftSection={<IconShield size={14} />}>
              Seguridad {securityState}
            </Badge>
            <Badge variant="light" color="brand.7" radius="xl" leftSection={<IconIdBadge2 size={14} />}>
              Legajo {context.request ? `#${context.request.id}` : "pendiente"}
            </Badge>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}
