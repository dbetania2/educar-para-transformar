/*"use client";

import {
  Badge,
  Card,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBallFootball,
  IconSchool,
  IconBrain,
  IconBook,
  IconRocket,
  IconHeartHandshake,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./BienestarTemplate.style";

type BienestarTemplateProps = StaticData["bienestarPage"];

export default function BienestarTemplate({
  hero,
  orientation,
  scholarships,
  tutoring,
  activities,
}: BienestarTemplateProps) {
  const { classes } = useStyles();

  return (
    <>
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
                  DESARROLLO INTEGRAL
                </Badge>

                <Title component="h1" c="white" maw={680}>
                  {hero.title}
                </Title>

                <Text size="lg" c="blue.0" maw={760}>
                  {hero.description}
                </Text>

                <Group gap="sm">
                  <Badge variant="white" color="brand.7" radius="xl">
                    ORIENTACIÓN
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    BECAS Y APOYOS
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    TUTORÍAS
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    DEPORTES
                  </Badge>
                </Group>
              </Stack>
            </GridCol>

            <GridCol span={{ base: 12, lg: 5 }}>
              <Card radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="rgba(255,255,255,0.14)" h="100%">
                <Stack gap="blockGapLg" h="100%" justify="space-between">
                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconHeartHandshake size={22} stroke={1.8} />
                    </ThemeIcon>
                    <div className={classes.flexibleCopy}>
                      <Text fw={700} c="white">
                        Contención y orientación
                      </Text>
                      <Text size="sm" c="blue.0" mt={4}>
                        Espacios confidenciales de escucha, acompañamiento
                        psicológico y asesoramiento vocacional.
                      </Text>
                    </div>
                  </Group>

                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconRocket size={22} stroke={1.8} />
                    </ThemeIcon>
                    <div className={classes.flexibleCopy}>
                      <Text fw={700} c="white">
                        Igualdad de oportunidades
                      </Text>
                      <Text size="sm" c="blue.0" mt={4}>
                        Programas de becas, ayudas económicas y tutorías 
                        personalizadas para asegurar tu continuidad.
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Card>
            </GridCol>
          </Grid>
        </Card>        

        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
              <Stack gap="sectionGapLg">
                <div>
                  <Title order={2} c="brand.7">
                    ¿Cómo te acompañamos?
                  </Title>
                  <Text size="sm" c="dimmed" mt={6}>
                    Estamos presentes en cada etapa de tu trayectoria para brindarte el 
                    apoyo, la contención y las herramientas que necesitás para alcanzar 
                    tu máximo potencial.
                  </Text>
                </div>

                <Grid gutter="xl" align="stretch">
                    <GridCol span={{ base: 12, lg: 6 }}>
                        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                        <Stack gap="sectionGapLg">
                            <Group align="flex-start" wrap="wrap" gap="md">
                            <ThemeIcon
                                size={48}
                                radius="xl"
                                variant="light"
                                color="brand.6"
                            >
                                <IconBrain size={24} stroke={1.8} />
                            </ThemeIcon>

                            <div className={classes.flexibleCopy}>
                                <Title order={3} c="brand.7">
                                {orientation.title}
                                </Title>
                                <Text size="sm" c="dimmed" mt={6}>
                                {orientation.description}
                                </Text>
                            </div>
                            </Group>
                        </Stack>
                        </Card>
                    </GridCol>

                    <GridCol span={{ base: 12, lg: 6 }}>
                        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                        <Stack gap="sectionGapLg">
                            <Group align="flex-start" wrap="wrap" gap="md">
                            <ThemeIcon
                                size={48}
                                radius="xl"
                                variant="light"
                                color="brand.6"
                            >
                                <IconSchool size={24} stroke={1.8} />
                            </ThemeIcon>

                            <div className={classes.flexibleCopy}>
                                <Title order={3} c="brand.7">
                                {scholarships.title}
                                </Title>
                                <Text size="sm" c="dimmed" mt={6}>
                                {scholarships.description}
                                </Text>
                            </div>
                            </Group>
                        </Stack>
                        </Card>
                    </GridCol>

                    <GridCol span={{ base: 12, lg: 6 }}>
                        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                        <Stack gap="sectionGapLg">
                            <Group align="flex-start" wrap="wrap" gap="md">
                            <ThemeIcon
                                size={48}
                                radius="xl"
                                variant="light"
                                color="brand.6"
                            >
                                <IconBook size={24} stroke={1.8} />
                            </ThemeIcon>

                            <div className={classes.flexibleCopy}>
                                <Title order={3} c="brand.7">
                                {tutoring.title}
                                </Title>
                                <Text size="sm" c="dimmed" mt={6}>
                                {tutoring.description}
                                </Text>
                            </div>
                            </Group>
                        </Stack>
                        </Card>
                    </GridCol>

                    <GridCol span={{ base: 12, lg: 6 }}>
                        <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                        <Stack gap="sectionGapLg">
                            <Group align="flex-start" wrap="wrap" gap="md">
                            <ThemeIcon
                                size={48}
                                radius="xl"
                                variant="light"
                                color="brand.6"
                            >
                                <IconBallFootball size={24} stroke={1.8} />
                            </ThemeIcon>

                            <div className={classes.flexibleCopy}>
                                <Title order={3} c="brand.7">
                                {activities.title}
                                </Title>
                                <Text size="sm" c="dimmed" mt={6}>
                                {activities.description}
                                </Text>
                            </div>
                            </Group>
                        </Stack>
                        </Card>
                    </GridCol>
                </Grid>
              </Stack>
            </Card>
      </Stack>
      </PaddingContainer>
    </>
  );
}*/

"use client";

import {
  Badge,
  Card,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBallFootball,
  IconBrain,
  IconBus,
  IconFlask,
  IconHeartHandshake,
  IconShieldCheck,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./BienestarTemplate.style";

type BienestarTemplateProps = StaticData["bienestarPage"];

export default function BienestarTemplate({
  hero,
  orientation,
  scholarships,
  tutoring,
  activities,
}: BienestarTemplateProps) {
  const { classes } = useStyles();
  void orientation;
  void scholarships;
  void tutoring;
  void activities;

  // Mapeo de la nueva estructura: Servicios de Apoyo, Servicios Diarios e Instalaciones
  const campusFeatures = [
    {
      title: "Servicios de Apoyo",
      description: "Gabinete psicopedagógico, tutorías personalizadas y un espacio de contención y apoyo emocional enfocado en su desarrollo integral.",
      icon: IconBrain,
    },
    {
      title: "Servicios Diarios",
      description: "Comedor escolar con menús de nutrición balanceada, servicio de transporte propio (micros) y enfermería permanente ante cualquier necesidad.",
      icon: IconBus,
    },
    {
      title: "Campus Deportivo",
      description: "Polideportivo cubierto totalmente equipado y pileta de natación climatizada para fomentar la salud, el trabajo en equipo y el deporte.",
      icon: IconBallFootball,
    },
    {
      title: "Instalaciones y Laboratorios",
      description: "Modernos laboratorios científicos y tecnológicos de vanguardia, rodeados de amplios espacios verdes ideales para el esparcimiento seguro.",
      icon: IconFlask,
    },
  ];

  return (
    <>
      <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
        <Stack gap="pageGapLg">
          
          {/* HERO BANNER - BIENESTAR Y ENTORNO SEGÚRO */}
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
                    VIDA ESTUDIANTIL Y CAMPUS
                  </Badge>

                  <Title component="h1" c="white" maw={680}>
                    {hero?.title || "Un segundo hogar diseñado para su tranquilidad"}
                  </Title>

                  <Text size="lg" c="blue.0" maw={760} fw={500}>
                    Cuidamos cada aspectó del desarrollo de tu hijo en un campus diseñado para la seguridad, el deporte y el bienestar.
                  </Text>

                  <Group gap="sm">
                    <Badge variant="white" color="brand.7" radius="xl">
                      APOYO EMOCIONAL
                    </Badge>
                    <Badge variant="white" color="brand.7" radius="xl">
                      COMEDOR Y MICROS
                    </Badge>
                    <Badge variant="white" color="brand.7" radius="xl">
                      CAMPUS SEGURO
                    </Badge>
                    <Badge variant="white" color="brand.7" radius="xl">
                      INFRAESTRUCTURA
                    </Badge>
                  </Group>
                </Stack>
              </GridCol>

              {/* TARJETA LATERAL - GARANTÍA PARA PADRES */}
              <GridCol span={{ base: 12, lg: 5 }}>
                <Card radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="rgba(255,255,255,0.14)" h="100%">
                  <Stack gap="blockGapLg" h="100%" justify="space-between">
                    <Group align="flex-start" wrap="wrap" gap="sm">
                      <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                        <IconShieldCheck size={22} stroke={1.8} />
                      </ThemeIcon>
                      <div className={classes.flexibleCopy}>
                        <Text fw={700} c="white">
                          Entorno Seguro y Confortable
                        </Text>
                        <Text size="sm" c="blue.0" mt={4}>
                          Instalaciones controladas y un ecosistema pensado para que disfruten su día a día con absoluta tranquilidad.
                        </Text>
                      </div>
                    </Group>

                    <Group align="flex-start" wrap="wrap" gap="sm">
                      <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                        <IconHeartHandshake size={22} stroke={1.8} />
                      </ThemeIcon>
                      <div className={classes.flexibleCopy}>
                        <Text fw={700} c="white">
                          Contención Personalizada
                        </Text>
                        <Text size="sm" c="blue.0" mt={4}>
                          Acompañamiento médico, psicopedagógico y humano constante para asegurar que nunca se sientan solos.
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              </GridCol>
            </Grid>
          </Card>        

          {/* SECCIÓN DETALLADA: ¿CÓMO TE ACOMPAÑAMOS? */}
          <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
            <Stack gap="sectionGapLg">
              <div>
                <Title order={2} c="brand.7">
                  ¿Cómo los acompañamos en su día a día?
                </Title>
                <Text size="sm" c="dimmed" mt={6}>
                  Estamos presentes en cada etapa de la vida escolar, ofreciendo servicios diarios esenciales, 
                  atención a la salud emocional e infraestructura de primer nivel para su felicidad y rendimiento óptimo.
                </Text>
              </div>

              {/* GRID DE FILAS CON LOS 4 PILARES PEDIDOS */}
              <Grid gutter="xl" align="stretch">
                {campusFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <GridCol key={index} span={{ base: 12, lg: 6 }}>
                      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                        <Group align="flex-start" wrap="wrap" gap="md">
                          <ThemeIcon
                            size={48}
                            radius="xl"
                            variant="light"
                            color="brand.6"
                          >
                            <Icon size={24} stroke={1.8} />
                          </ThemeIcon>

                          <div className={classes.flexibleCopy}>
                            <Title order={3} c="brand.7">
                              {feature.title}
                            </Title>
                            <Text size="sm" c="dimmed" mt={6}>
                              {feature.description}
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    </GridCol>
                  );
                })}
              </Grid>
            </Stack>
          </Card>

        </Stack>
      </PaddingContainer>
    </>
  );
}
