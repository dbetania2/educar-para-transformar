"use client";

import type { StaticData } from "@/hooks/useStaticData";
import { PaddingContainer } from "../atoms";
import {
  Anchor,
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
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBriefcase,
  IconMail,
  IconMapPin,
  IconPhone,
  IconBolt
} from "@tabler/icons-react";
import ContactForm from "@/components/molecules/ContactForm/ContactForm";
import { useStyles } from "./ContactoTemplate.style";

type ContactoTemplateProps = StaticData["contactoPage"];

export default function ContactoTemplate({
  hero,
  channels,
  contactInfo,
  employment,
  quickMessageForm,
  map,
}: ContactoTemplateProps) {
  const { classes } = useStyles();
  void hero;
  void channels;
  void map;

  return (
    <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
      <Stack gap="pageGapLg">
        {/* {hero.title && <Title component="h1">{hero.title}</Title>}
        {hero.description && <Text size="lg">{hero.description}</Text>} */}

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
                  Atención personalizada
                </Badge>

                <Title component="h1" c="white" maw={680}>
                  {hero.title}
                </Title>

                <Text size="lg" c="blue.0" maw={760}>
                  {hero.description}
                </Text>

                <Group gap="sm">
                  <Badge variant="white" color="brand.7" radius="xl">
                    VÍAS DE CONTACTO
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    FORMULARIO
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    REDES SOCIALES
                  </Badge>
                </Group>
              </Stack>
            </GridCol>

            <GridCol span={{ base: 12, lg: 5 }}>
              <Card radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="rgba(255,255,255,0.14)" h="100%">
                <Stack gap="blockGapLg" h="100%" justify="space-between">
                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconBolt size={22} stroke={1.8} />
                    </ThemeIcon>
                    <div className={classes.flexibleCopy}>
                      <Text fw={700} c="white">
                        Respuesta rápida
                      </Text>
                      <Text size="sm" c="blue.0" mt={4}>
                        Escribinos por WhatsApp o completá el formulario web para 
                        que podamos resolver tu consulta a la brevedad.
                      </Text>
                    </div>
                  </Group>

                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconMapPin size={22} stroke={1.8} />
                    </ThemeIcon>
                    <Text size="sm" c="blue.0" className={classes.flexibleCopy}>
                      Te esperamos en nuestra oficina de administración en Ruta 
                      Nacional 11, afueras de Resistencia.
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </GridCol>
          </Grid>
        </Card>

        <Grid gutter="xl" align="stretch">
          <GridCol span={{ base: 12, lg: 6 }}>
            <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
              <Stack gap="sectionGapLg">
                <div>
                  <Title order={3} c="brand.7">
                    Canales de contacto
                  </Title>
                  <Text size="sm" c="dimmed" mt={6}>
                    También podés escribirnos o visitarnos por estos medios.
                  </Text>
                </div>

                <Group align="flex-start" wrap="wrap" gap="md">
                  <ThemeIcon
                    size={42}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconMapPin size={20} stroke={1.8} />
                  </ThemeIcon>
                  <div className={classes.infoContent}>
                    <Text fw={700}>{contactInfo.address.label}</Text>
                    <Text c="dimmed">{contactInfo.address.value}</Text>
                  </div>
                </Group>

                <Group align="flex-start" wrap="wrap" gap="md">
                  <ThemeIcon
                    size={42}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconPhone size={20} stroke={1.8} />
                  </ThemeIcon>
                  <div className={classes.infoContent}>
                    <Text fw={700}>{contactInfo.phone.label}</Text>
                    <Text c="dimmed">{contactInfo.phone.value}</Text>
                  </div>
                </Group>

                <Group align="flex-start" wrap="wrap" gap="md">
                  <ThemeIcon
                    size={42}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconMail size={20} stroke={1.8} />
                  </ThemeIcon>
                  <div className={classes.infoContent}>
                    <Text fw={700}>{contactInfo.email.label}</Text>
                    <Anchor
                      href={contactInfo.email.href}
                      className={classes.wrapAnywhere}
                    >
                      {contactInfo.email.value}
                    </Anchor>
                  </div>
                </Group>

                <Group align="flex-start" wrap="wrap" gap="md">
                  <ThemeIcon
                    size={42}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconBrandWhatsapp size={20} stroke={1.8} />
                  </ThemeIcon>
                  <div className={classes.infoContent}>
                    <Text fw={700}>{channels.whatsapp.label}</Text>
                    <Anchor
                      href={channels.whatsapp.href}
                      target="_blank"
                      className={classes.wrapAnywhere}
                    >
                      {channels.whatsapp.value}
                    </Anchor>
                  </div>
                </Group>

                <Group align="flex-start" wrap="wrap" gap="md">
                  <ThemeIcon
                    size={42}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconBrandInstagram size={20} stroke={1.8} />
                  </ThemeIcon>
                  <div className={classes.infoContent}>
                    <Text fw={700}>{channels.socialMedia.label}</Text>
                    <Text c="dimmed">{channels.socialMedia.description}</Text>
                    <Group gap="xs" mt={8} wrap="wrap">
                      <ThemeIcon
                        size={28}
                        radius="xl"
                        variant="subtle"
                        color="brand.7"
                      >
                        <IconBrandInstagram size={16} stroke={1.8} />
                      </ThemeIcon>
                      <Anchor
                        href="https://www.instagram.com/EducarParaTransformar"
                        target="_blank"
                        className={classes.wrapAnywhere}
                      >
                        {channels.socialMedia.instagram}
                      </Anchor>
                    </Group>
                    <Group gap="xs" mt={6} wrap="wrap">
                      <ThemeIcon
                        size={28}
                        radius="xl"
                        variant="subtle"
                        color="brand.7"
                      >
                        <IconBrandFacebook size={16} stroke={1.8} />
                      </ThemeIcon>
                      <Anchor
                        href="https://www.facebook.com/EducarParaTransformar"
                        target="_blank"
                        className={classes.wrapAnywhere}
                      >
                        {channels.socialMedia.facebook}
                      </Anchor>
                    </Group>
                  </div>
                </Group>

                <Card radius="lg" p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }} bg="var(--mantine-color-brand-0)">
                  <Group align="flex-start" wrap="wrap" gap="md">
                    <ThemeIcon size={42} radius="xl" variant="white" color="brand.7">
                      <IconBriefcase size={20} stroke={1.8} />
                    </ThemeIcon>
                    <div className={classes.infoContent}>
                      <Text fw={700} c="brand.7">{employment.title}</Text>
                      <Text size="sm" c="dimmed" mt={4}>{employment.description}</Text>
                      <Text size="sm" mt={8}>{employment.instruction}</Text>
                    </div>
                  </Group>
                </Card>
              </Stack>
            </Card>
          </GridCol>

          <GridCol span={{ base: 12, lg: 6 }}>
            <div id="mensaje">
              {quickMessageForm.enabled && <ContactForm {...quickMessageForm} />}
            </div>
          </GridCol>
        </Grid>
      </Stack>
    </PaddingContainer>
  );
}
