"use client";

import {
  Anchor,
  Badge,
  Card,
  Grid,
  GridCol,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

import {
  IconBriefcase,
  IconCheck,
  IconMail,
  IconUsers,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import type { StaticData } from "@/hooks/useStaticData";

import { useStyles } from "./EmpleosTemplate.style";

type EmpleosTemplateProps = StaticData["empleosPage"];

export default function EmpleosTemplate({
  hero,
  benefits,
  profiles,
  application,
}: EmpleosTemplateProps) {
  const { classes } = useStyles();

  return (
    <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
      <Stack gap="pageGapLg">
        <Card
          radius="xl"
          p={{ base: "cardPadSm", md: "cardPadLg" }}
          bg="linear-gradient(135deg, var(--mantine-color-blue-2) 0%, var(--mantine-color-brand-7) 55%, var(--mantine-color-brand-6) 100%)"
        >
          <Grid gutter="xl" align="stretch">
            <GridCol span={{ base: 12, lg: 7 }}>
              <Stack gap="blockGapLg">
                <Badge
                  variant="white"
                  color="brand.7"
                  radius="xl"
                  size="lg"
                  w="fit-content"
                >
                  Bolsa de empleo
                </Badge>

                <Title component="h1" c="white" maw={680}>
                  {hero.title}
                </Title>

                <Text size="lg" c="blue.0" maw={760}>
                  {hero.description}
                </Text>

                <Group gap="sm">
                  <Badge variant="white" color="brand.7" radius="xl">
                    Docentes
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    Administración
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    Equipo institucional
                  </Badge>
                </Group>
              </Stack>
            </GridCol>

            <GridCol span={{ base: 12, lg: 5 }}>
              <Card
                radius="xl"
                p={{ base: "cardPadSm", md: "cardPadLg" }}
                bg="rgba(255,255,255,0.14)"
                h="100%"
              >
                <Stack gap="blockGapLg" h="100%" justify="space-between">
                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconBriefcase size={22} stroke={1.8} />
                    </ThemeIcon>

                    <div className={classes.flexibleCopy}>
                      <Text fw={700} c="white">
                        Sumate a nuestra comunidad
                      </Text>
                      <Text size="sm" c="blue.0" mt={4}>
                        Buscamos perfiles con vocación educativa, compromiso y ganas de aportar al crecimiento institucional.
                      </Text>
                    </div>
                  </Group>

                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconMail size={22} stroke={1.8} />
                    </ThemeIcon>

                    <Text size="sm" c="blue.0" className={classes.flexibleCopy}>
                      Enviá tu CV y contanos el área en la que te gustaría desempeñarte.
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </GridCol>
          </Grid>
        </Card>

        <Grid gutter="xl">
          <GridCol span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              radius="xl"
              p={{ base: "cardPadSm", md: "cardPadLg" }}
              h="100%"
            >
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon
                    size={44}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconUsers size={22} />
                  </ThemeIcon>

                  <Title order={3} c="brand.7">
                    ¿Por qué trabajar con nosotros?
                  </Title>
                </Group>

                <List
                  spacing="md"
                  icon={
                    <ThemeIcon
                      size={22}
                      radius="xl"
                      color="green"
                    >
                      <IconCheck size={14} />
                    </ThemeIcon>
                  }
                >
                  {benefits.map((item) => (
                    <List.Item key={item}>
                      {item}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Card>
          </GridCol>

          <GridCol span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              radius="xl"
              p={{ base: "cardPadSm", md: "cardPadLg" }}
              h="100%"
            >
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon
                    size={44}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconBriefcase size={22} />
                  </ThemeIcon>

                  <Title order={3} c="brand.7">
                    Perfiles que buscamos
                  </Title>
                </Group>

                <List spacing="md">
                  {profiles.map((item) => (
                    <List.Item key={item}>
                      {item}
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </Card>
          </GridCol>
        </Grid>

        <Card
          id="postulacion"
          withBorder
          radius="xl"
          p={{ base: "cardPadSm", md: "cardPadLg" }}
          className={classes.sectionAnchor}
        >
          <Stack gap="md">
            <Group gap="sm">
              <ThemeIcon
                size={44}
                radius="xl"
                variant="light"
                color="brand.6"
              >
                <IconMail size={22} />
              </ThemeIcon>

              <Title order={3} c="brand.7">
                Cómo postularse
              </Title>
            </Group>

            <Text>
              {application.message}
            </Text>

            <Anchor
              href={"mailto:" + application.email}
              fw={700}
              size="lg"
              className={classes.email}
            >
              <span>{application.email}</span>
            </Anchor>
          </Stack>
        </Card>
      </Stack>
    </PaddingContainer>
  );
}