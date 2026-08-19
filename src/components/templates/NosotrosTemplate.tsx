/*"use client";

import { useState } from "react";
import { Carousel } from "@mantine/carousel";
import Image from "next/image";
import {
  Badge,
  Box,
  Card,
  Grid,
  GridCol,
  Group,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBallFootball,
  IconBuildingCommunity,
  IconChecklist,
  IconLanguage,
  IconMapPin,
  IconMedal2,
  IconSchool,
  IconToolsKitchen2,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./NosotrosTemplate.style";

type NosotrosTemplateProps = StaticData["nosotrosPage"];
type GalleryItem = StaticData["nosotrosPage"]["gallery"]["items"][number];
type GallerySelection = {
  items: GalleryItem[];
  initialSlide: number;
};

export default function NosotrosTemplate({
  hero,
  gallery,
  sportsGallery,
  facilitiesGallery,
  whoWeAre,
  academicOffer,
  languagesAndSports,
  facilities,
}: NosotrosTemplateProps) {
  const { classes } = useStyles();
  const [selectedGallery, setSelectedGallery] = useState<GallerySelection | null>(null);
  const institutionalGalleryItems = gallery.items.slice(0, 2);
  const summaryItems = [
    {
      label: "Niveles educativos",
      value: academicOffer.levels.length,
      icon: IconSchool,
      color: "brand.6",
    },
    {
      label: "Idiomas",
      value: languagesAndSports.languages.length,
      icon: IconLanguage,
      color: "green.9",
    },
    {
      label: "Disciplinas",
      value: languagesAndSports.sports.length,
      icon: IconBallFootball,
      color: "orange.8",
    },
    {
      label: "Instalaciones",
      value: facilities.items.length,
      icon: IconToolsKitchen2,
      color: "navy.2",
    },
  ];

  return (
    <>
      <Modal
        opened={selectedGallery !== null}
        onClose={() => setSelectedGallery(null)}
        size="auto"
        centered
        withCloseButton={false}
        padding={0}
        classNames={{ content: classes.galleryModalContent, body: classes.galleryModalBody }}
      >
        {selectedGallery ? (
          <Carousel
            slideSize="100%"
            slideGap={0}
            initialSlide={selectedGallery.initialSlide}
            withIndicators={false}
            withControls={selectedGallery.items.length > 1}
            emblaOptions={{ align: "center", loop: selectedGallery.items.length > 1 }}
            className={classes.galleryModalCarousel}
            classNames={{ viewport: classes.galleryModalCarouselViewport }}
          >
            {selectedGallery.items.map((item) => (
              <Carousel.Slide key={item.title}>
                <div className={classes.galleryModalSlide}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes="100vw"
                    className={classes.galleryModalImage}
                  />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : null}
      </Modal>

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
                  Comunidad educativa
                </Badge>

                <Title component="h1" c="white" maw={680}>
                  {hero.title}
                </Title>

                <Text size="lg" c="blue.0" maw={760}>
                  {hero.description}
                </Text>

                <Group gap="sm">
                  <Badge variant="white" color="brand.7" radius="xl">
                    Gestión privada
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    Jornada extendida
                  </Badge>
                  <Badge variant="white" color="brand.7" radius="xl">
                    Formación integral
                  </Badge>
                </Group>
              </Stack>
            </GridCol>

            <GridCol span={{ base: 12, lg: 5 }}>
              <Card radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="rgba(255,255,255,0.14)" h="100%">
                <Stack gap="blockGapLg" h="100%" justify="space-between">
                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconMedal2 size={22} stroke={1.8} />
                    </ThemeIcon>
                    <div className={classes.flexibleCopy}>
                      <Text fw={700} c="white">
                        Propuesta educativa de excelencia
                      </Text>
                      <Text size="sm" c="blue.0" mt={4}>
                        Inicial, Primario y Secundario en un entorno pensado
                        para crecer, aprender y proyectarse.
                      </Text>
                    </div>
                  </Group>

                  <Group align="flex-start" wrap="wrap" gap="sm">
                    <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                      <IconMapPin size={22} stroke={1.8} />
                    </ThemeIcon>
                    <Text size="sm" c="blue.0" className={classes.flexibleCopy}>
                      Ubicados en las afueras de Resistencia, con infraestructura
                      propia para experiencias académicas, deportivas y
                      recreativas.
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </GridCol>
          </Grid>
        </Card>

        <Grid gutter="md">
          {summaryItems.map((item) => {
            const Icon = item.icon;

            return (
              <GridCol key={item.label} span={{ base: 6, md: 3 }}>
                <Card withBorder radius="xl" p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }} h="100%">
                  <Stack gap="xs">
                    <ThemeIcon size={42} radius="xl" variant="light" color={item.color}>
                      <Icon size={20} stroke={1.9} />
                    </ThemeIcon>
                    <Title order={2} c="brand.7">
                      {item.value}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {item.label}
                    </Text>
                  </Stack>
                </Card>
              </GridCol>
            );
          })}
        </Grid>


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
                    <IconBuildingCommunity size={24} stroke={1.8} />
                  </ThemeIcon>

                  <div className={classes.flexibleCopy}>
                    <Title order={3} c="brand.7">
                      {whoWeAre.title}
                    </Title>
                    <Text size="sm" c="dimmed" mt={6}>
                      {whoWeAre.description}
                    </Text>
                  </div>
                </Group>

                <Group gap="sm">
                  <Badge variant="light" color="green.3" radius="xl">
                    Gestión privada
                  </Badge>
                  <Badge variant="light" color="blue.3" radius="xl">
                    Alta calidad educativa
                  </Badge>
                  <Badge variant="light" color="orange.8" radius="xl">
                    Entorno natural
                  </Badge>
                </Group>

                <Group align="flex-start" wrap="wrap" gap="sm">
                  <ThemeIcon variant="subtle" color="brand.7" radius="xl">
                    <IconMapPin size={18} stroke={1.8} />
                  </ThemeIcon>
                  <Text c="dimmed">
                    Ubicados en un entorno ideal en las afueras de la ciudad de
                    Resistencia.
                  </Text>
                </Group>
              </Stack>
            </Card>
          </GridCol>

          <GridCol span={{ base: 12, lg: 6 }}>
            <Card
              id="niveles-educativos"
              withBorder
              radius="xl"
              p={{ base: "cardPadSm", md: "cardPadLg" }}
              h="100%"
              className={classes.sectionAnchor}
            >
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
                      {academicOffer.title}
                    </Title>
                    <Text size="sm" c="dimmed" mt={6}>
                      {academicOffer.description}
                    </Text>
                  </div>
                </Group>

                <Grid gutter="md">
                  {academicOffer.levels.map((level) => (
                    <GridCol key={level} span={{ base: 12, sm: 4 }}>
                      <Card
                        radius="lg"
                        p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }}
                        bg="var(--mantine-color-brand-0)"
                        h="100%"
                      >
                        <Stack gap="xs" align="center">
                          <ThemeIcon
                            variant="white"
                            color="brand.7"
                            size={38}
                            radius="xl"
                          >
                            <IconChecklist size={18} stroke={2} />
                          </ThemeIcon>
                          <Text ta="center" fw={700}>
                            {level}
                          </Text>
                          <Text ta="center" size="xs" c="dimmed">
                            Educación acompañada con jornada extendida
                          </Text>
                        </Stack>
                      </Card>
                    </GridCol>
                  ))}
                </Grid>

                <Stack gap="xs">
                  <Text fw={700}>{gallery.title}</Text>
                  <Text size="sm" c="dimmed">{gallery.description}</Text>
                  
                <Carousel
                  slideSize={{ base: "100%", sm: "50%" }}
                  slideGap="lg"
                  withIndicators={institutionalGalleryItems.length > 1}
                  withControls={institutionalGalleryItems.length > 1}
                  emblaOptions={{ align: "start", loop: institutionalGalleryItems.length > 1 }}
                  classNames={{ viewport: classes.galleryCarouselViewport }}
                >
                  {institutionalGalleryItems.map((item, index) => (
                    <Carousel.Slide key={item.title}>
                      <UnstyledButton
                        type="button"
                        className={classes.galleryButton}
                        aria-label={"Abrir imagen: " + item.title}
                        onClick={() => setSelectedGallery({ items: institutionalGalleryItems, initialSlide: index })}
                      >
                        <div className={classes.galleryImageFrame}>
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 360px"
                            className={classes.galleryImage}
                          />
                          <span className={classes.galleryImageLabel}>{item.title}</span>
                        </div>
                      </UnstyledButton>
                    </Carousel.Slide>
                  ))}
                </Carousel>
                </Stack>
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
                    <IconLanguage size={24} stroke={1.8} />
                  </ThemeIcon>

                  <div className={classes.flexibleCopy}>
                    <Title order={3} c="brand.7">
                      {languagesAndSports.title}
                    </Title>
                    <Text size="sm" c="dimmed" mt={6}>
                      {languagesAndSports.description}
                    </Text>
                  </div>
                </Group>

                <div>
                  <Text fw={700} mb="xs">
                    Formación trilingüe
                  </Text>
                  <Group gap="sm">
                    {languagesAndSports.languages.map((language) => (
                      <Badge
                        key={language}
                        variant="light"
                        color="brand.6"
                        radius="xl"
                      >
                        {language}
                      </Badge>
                    ))}
                  </Group>
                </div>

                <Box
                  p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }}
                  bg="var(--mantine-color-orange-5)"
                  className={classes.roundedHighlight}
                >
                  <Text fw={700} c="orange.9">
                    Desarrollo físico y humano
                  </Text>
                  <Text size="sm" c="orange.9" mt={4}>
                    Actividades pensadas para estimular disciplina, trabajo en
                    equipo, creatividad y bienestar.
                  </Text>
                </Box>

                <Stack gap="xs">
                  <Text fw={700}>{sportsGallery.title}</Text>
                  <Text size="sm" c="dimmed">{sportsGallery.description}</Text>
                  
                <Carousel
                  slideSize={{ base: "100%", sm: "50%" }}
                  slideGap="lg"
                  withIndicators={sportsGallery.items.length > 1}
                  withControls={sportsGallery.items.length > 1}
                  emblaOptions={{ align: "start", loop: sportsGallery.items.length > 1 }}
                  classNames={{ viewport: classes.galleryCarouselViewport }}
                >
                  {sportsGallery.items.map((item, index) => (
                    <Carousel.Slide key={item.title}>
                      <UnstyledButton
                        type="button"
                        className={classes.galleryButton}
                        aria-label={"Abrir imagen: " + item.title}
                        onClick={() => setSelectedGallery({ items: sportsGallery.items, initialSlide: index })}
                      >
                        <div className={classes.galleryImageFrame}>
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 360px"
                            className={classes.galleryImage}
                          />
                          <span className={classes.galleryImageLabel}>{item.title}</span>
                        </div>
                      </UnstyledButton>
                    </Carousel.Slide>
                  ))}
                </Carousel>
                </Stack>

                <div>
                  <Text fw={700} mb="xs">
                    Deportes y actividades
                  </Text>
                  <Grid gutter="sm">
                    {languagesAndSports.sports.map((sport) => (
                      <GridCol key={sport} span={{ base: 12, sm: 6 }}>
                        <Card
                          p={{ base: "cardPadDenseSm", md: "cardPadDenseLg" }}
                          radius="lg"
                          bg="var(--mantine-color-neutral-1)"
                        >
                          <Group wrap="wrap" gap="sm" align="flex-start">
                            <ThemeIcon
                              size={24}
                              radius="xl"
                              color="orange.8"
                              variant="light"
                            >
                              <IconBallFootball size={14} stroke={2} />
                            </ThemeIcon>
                            <Text size="sm">{sport}</Text>
                          </Group>
                        </Card>
                      </GridCol>
                    ))}
                  </Grid>
                </div>
              </Stack>
            </Card>
          </GridCol>

          <GridCol span={{ base: 12, lg: 6 }}>
            <Card
              id="instalaciones"
              withBorder
              radius="xl"
              p={{ base: "cardPadSm", md: "cardPadLg" }}
              h="100%"
              className={classes.sectionAnchor}
            >
              <Stack gap="sectionGapLg">
                <Group align="flex-start" wrap="wrap" gap="md">
                  <ThemeIcon
                    size={48}
                    radius="xl"
                    variant="light"
                    color="brand.6"
                  >
                    <IconToolsKitchen2 size={24} stroke={1.8} />
                  </ThemeIcon>

                  <div className={classes.flexibleCopy}>
                    <Title order={3} c="brand.7">
                      {facilities.title}
                    </Title>
                    <Text size="sm" c="dimmed" mt={6}>
                      {facilities.description}
                    </Text>
                  </div>
                </Group>

                <Stack gap="xs">
                  <Text fw={700}>{facilitiesGallery.title}</Text>
                  <Text size="sm" c="dimmed">{facilitiesGallery.description}</Text>
                  
                <Carousel
                  slideSize={{ base: "100%", sm: "50%" }}
                  slideGap="lg"
                  withIndicators={facilitiesGallery.items.length > 1}
                  withControls={facilitiesGallery.items.length > 1}
                  emblaOptions={{ align: "start", loop: facilitiesGallery.items.length > 1 }}
                  classNames={{ viewport: classes.galleryCarouselViewport }}
                >
                  {facilitiesGallery.items.map((item, index) => (
                    <Carousel.Slide key={item.title}>
                      <UnstyledButton
                        type="button"
                        className={classes.galleryButton}
                        aria-label={"Abrir imagen: " + item.title}
                        onClick={() => setSelectedGallery({ items: facilitiesGallery.items, initialSlide: index })}
                      >
                        <div className={classes.galleryImageFrame}>
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 360px"
                            className={classes.galleryImage}
                          />
                          <span className={classes.galleryImageLabel}>{item.title}</span>
                        </div>
                      </UnstyledButton>
                    </Carousel.Slide>
                  ))}
                </Carousel>
                </Stack>

                <Grid gutter="sm">
                  {facilities.items.map((item) => (
                    <GridCol key={item} span={{ base: 12, sm: 6 }}>
                      <Card
                        radius="lg"
                        p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }}
                        bg="var(--mantine-color-neutral-1)"
                        h="100%"
                      >
                        <Group wrap="wrap" gap="sm" align="flex-start">
                          <ThemeIcon
                            size={32}
                            radius="xl"
                            variant="light"
                            color="brand.6"
                          >
                            <IconChecklist size={16} stroke={2} />
                          </ThemeIcon>
                          <Text size="sm">{item}</Text>
                        </Group>
                      </Card>
                    </GridCol>
                  ))}
                </Grid>
              </Stack>
            </Card>
          </GridCol>
        </Grid>
      </Stack>
      </PaddingContainer>
    </>
  );
}
*/
"use client";

import { useState } from "react";
import { Carousel } from "@mantine/carousel";
import Image from "next/image";
import {
  Badge,
  Box,
  Card,
  Grid,
  GridCol,
  Group,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBallFootball,
  IconBuildingCommunity,
  IconChecklist,
  IconLanguage,
  IconMapPin,
  IconMedal2,
  IconSchool,
  IconToolsKitchen2,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./NosotrosTemplate.style";

type NosotrosTemplateProps = StaticData["nosotrosPage"];
type GalleryItem = StaticData["nosotrosPage"]["gallery"]["items"][number];
type GallerySelection = {
  items: GalleryItem[];
  initialSlide: number;
};

export default function NosotrosTemplate({
  hero,
  gallery,
  sportsGallery,
  facilitiesGallery,
  whoWeAre,
  academicOffer,
  languagesAndSports,
  facilities,
}: NosotrosTemplateProps) {
  const { classes } = useStyles();
  const [selectedGallery, setSelectedGallery] = useState<GallerySelection | null>(null);
  const institutionalGalleryItems = gallery.items.slice(0, 2);
  
  const summaryItems = [
    {
      label: "Niveles educativos",
      value: academicOffer.levels.length,
      icon: IconSchool,
      color: "brand.6",
    },
    {
      label: "Idiomas",
      value: languagesAndSports.languages.length,
      icon: IconLanguage,
      color: "green.9",
    },
    {
      label: "Disciplinas",
      value: languagesAndSports.sports.length,
      icon: IconBallFootball,
      color: "orange.8",
    },
    {
      label: "Instalaciones",
      value: facilities.items.length,
      icon: IconToolsKitchen2,
      color: "navy.2",
    },
  ];

  return (
    <>
      {/* Modal para previsualizar imágenes de las galerías */}
      <Modal
        opened={selectedGallery !== null}
        onClose={() => setSelectedGallery(null)}
        size="auto"
        centered
        withCloseButton={false}
        padding={0}
        classNames={{ content: classes.galleryModalContent, body: classes.galleryModalBody }}
      >
        {selectedGallery ? (
          <Carousel
            slideSize="100%"
            slideGap={0}
            initialSlide={selectedGallery.initialSlide}
            withIndicators={false}
            withControls={selectedGallery.items.length > 1}
            emblaOptions={{ align: "center", loop: selectedGallery.items.length > 1 }}
            className={classes.galleryModalCarousel}
            classNames={{ viewport: classes.galleryModalCarouselViewport }}
          >
            {selectedGallery.items.map((item) => (
              <Carousel.Slide key={item.title}>
                <div className={classes.galleryModalSlide}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes="100vw"
                    className={classes.galleryModalImage}
                  />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : null}
      </Modal>

      <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
        <Stack gap="pageGapLg">
          
          {/* ═════════════════════════════════════════════════════════════ */}
          {/* BANNER AZUL PRINCIPAL (INTACTO, NO SE MODIFICÓ NADA ACÁ)     */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <Card
            radius="xl"
            p={{ base: "cardPadSm", md: "cardPadLg" }}
            bg="linear-gradient(135deg, var(--mantine-color-blue-2) 0%, var(--mantine-color-brand-7) 55%, var(--mantine-color-brand-6) 100%)"
          >
            <Grid gutter="xl" align="stretch">
              <GridCol span={{ base: 12, lg: 7 }}>
                <Stack gap="blockGapLg">
                  <Badge variant="white" color="brand.7" radius="xl" size="lg" w="fit-content">
                    Comunidad educativa
                  </Badge>

                  <Title component="h1" c="white" maw={680}>
                    {hero.title}
                  </Title>

                  <Text size="lg" c="blue.0" maw={760}>
                    {hero.description}
                  </Text>

                  <Group gap="sm">
                    <Badge variant="white" color="brand.7" radius="xl">
                      Gestión privada
                    </Badge>
                    <Badge variant="white" color="brand.7" radius="xl">
                      Jornada extendida
                    </Badge>
                    <Badge variant="white" color="brand.7" radius="xl">
                      Formación integral
                    </Badge>
                  </Group>
                </Stack>
              </GridCol>

              <GridCol span={{ base: 12, lg: 5 }}>
                <Card radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="rgba(255,255,255,0.14)" h="100%">
                  <Stack gap="blockGapLg" h="100%" justify="space-between">
                    <Group align="flex-start" wrap="wrap" gap="sm">
                      <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                        <IconMedal2 size={22} stroke={1.8} />
                      </ThemeIcon>
                      <div className={classes.flexibleCopy}>
                        <Text fw={700} c="white">
                          Propuesta educativa de excelencia
                        </Text>
                        <Text size="sm" c="blue.0" mt={4}>
                          Inicial, Primario y Secundario en un entorno pensado para crecer, aprender y proyectarse.
                        </Text>
                      </div>
                    </Group>

                    <Group align="flex-start" wrap="wrap" gap="sm">
                      <ThemeIcon size={44} radius="xl" variant="white" color="brand.7">
                        <IconMapPin size={22} stroke={1.8} />
                      </ThemeIcon>
                      <Text size="sm" c="blue.0" className={classes.flexibleCopy}>
                        Ubicados en las afueras de Resistencia, con infraestructura propia para experiencias académicas, deportivas y recreativas.
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </GridCol>
            </Grid>
          </Card>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* NUEVO DISEÑO ESTRUCTURADO Y SEPARADO ABAJO DEL BANNER        */}
          {/* ═════════════════════════════════════════════════════════════ */}

          {/* 1. Métrica e Impacto Institucional */}
          <Grid gutter="md">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <GridCol key={item.label} span={{ base: 6, md: 3 }}>
                  <Card withBorder radius="xl" p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }} h="100%">
                    <Stack gap="xs">
                      <ThemeIcon size={42} radius="xl" variant="light" color={item.color}>
                        <Icon size={20} stroke={1.9} />
                      </ThemeIcon>
                      <Title order={2} c="brand.7">
                        {item.value}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {item.label}
                      </Text>
                    </Stack>
                  </Card>
                </GridCol>
              );
            })}
          </Grid>

          {/* 2. Sección de Identidad (Quiénes Somos / Mensaje Clave) */}
          <Card id="identidad-institucional" radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} bg="var(--mantine-color-blue-0)" withBorder className={classes.sectionAnchor}>
            <Stack gap="md" align="center" ta="center" style={{ maxWidth: 800, margin: '0 auto' }}>
              <ThemeIcon size={48} radius="xl" variant="light" color="brand.6">
                <IconBuildingCommunity size={24} stroke={1.8} />
              </ThemeIcon>
              <Title order={2} c="brand.7">
                {whoWeAre.title}
              </Title>
              <Text size="md" c="dimmed" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                &ldquo;{whoWeAre.description}&rdquo;
              </Text>
            </Stack>
          </Card>

          {/* 3. Niveles Educativos (Organizados en grilla limpia) */}
          <Stack gap="md" id="niveles-educativos" className={classes.levelsAnchor} mt="md">
            <div style={{ textAlign: "center" }}>
              <Title order={2} c="brand.7">
                {academicOffer.title}
              </Title>
              <Text c="dimmed" maw={680} mx="auto" size="sm" mt={6}>
                {academicOffer.description}
              </Text>
            </div>
            
            <Grid gutter="lg" mt="md">
              {academicOffer.levels.map((level) => (
                <GridCol key={level} span={{ base: 12, md: 4 }}>
                  <Card withBorder radius="xl" p="lg" h="100%" style={{ borderTop: '4px solid var(--mantine-color-brand-6)' }}>
                    <Stack gap="sm" align="center" ta="center">
                      <ThemeIcon variant="light" color="brand.6" size={44} radius="xl">
                        <IconSchool size={22} stroke={2} />
                      </ThemeIcon>
                      <Text fw={700} size="lg" c="brand.7">
                        {level}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Educación integral de alta calidad, acompañada con esquemas de jornada extendida y desarrollo bilingüe.
                      </Text>
                    </Stack>
                  </Card>
                </GridCol>
              ))}
            </Grid>

            {/* Galería Institucional del Nivel Académico */}
            <Stack gap="xs" mt="xl" align="center">
              <Text fw={700} size="sm">{gallery.title}</Text>
              <Carousel
                slideSize={{ base: "100%", sm: "50%" }}
                slideGap="lg"
                withIndicators={institutionalGalleryItems.length > 1}
                withControls={institutionalGalleryItems.length > 1}
                emblaOptions={{ align: "start", loop: institutionalGalleryItems.length > 1 }}
                classNames={{ viewport: classes.galleryCarouselViewport }}
                style={{ width: "100%", maxWidth: 800 }}
              >
                {institutionalGalleryItems.map((item, index) => (
                  <Carousel.Slide key={item.title}>
                    <UnstyledButton
                      type="button"
                      className={classes.galleryButton}
                      aria-label={"Abrir imagen: " + item.title}
                      onClick={() => setSelectedGallery({ items: institutionalGalleryItems, initialSlide: index })}
                    >
                      <div className={classes.galleryImageFrame}>
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 360px"
                          className={classes.galleryImage}
                        />
                        <span className={classes.galleryImageLabel}>{item.title}</span>
                      </div>
                    </UnstyledButton>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Stack>
          </Stack>

          {/* 4. Enfoque Pedagógico Complementario: Idiomas, Deportes e Instalaciones */}
          <Grid gutter="xl" mt="md">
            
            {/* Columna de Idiomas y Formación Física */}
            <GridCol span={{ base: 12, lg: 6 }}>
              <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                <Stack gap="md" h="100%" justify="space-between">
                  <Stack gap="sm">
                    <Group gap="sm">
                      <ThemeIcon size={44} radius="xl" variant="light" color="brand.6">
                        <IconLanguage size={22} stroke={1.8} />
                      </ThemeIcon>
                      <Title order={3} c="brand.7">
                        {languagesAndSports.title}
                      </Title>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {languagesAndSports.description}
                    </Text>

                    <Box p="md" bg="var(--mantine-color-brand-0)" style={{ borderRadius: 'var(--mantine-radius-xl)' }} mt="xs">
                      <Text fw={700} size="sm" c="brand.7" mb="xs">Idiomas dictados:</Text>
                      <Group gap="xs">
                        {languagesAndSports.languages.map((language) => (
                          <Badge key={language} variant="filled" color="brand.6" radius="xl">
                            {language}
                          </Badge>
                        ))}
                      </Group>
                    </Box>

                    <Box p="md" bg="var(--mantine-color-orange-0)" style={{ borderRadius: 'var(--mantine-radius-xl)' }}>
                      <Text fw={700} size="sm" c="orange.9" mb="xs">Disciplinas deportivas:</Text>
                      <Grid gutter="xs">
                        {languagesAndSports.sports.map((sport) => (
                          <GridCol key={sport} span={6}>
                            <Group gap="xs">
                              <IconBallFootball size={16} color="var(--mantine-color-orange-8)" />
                              <Text size="xs">{sport}</Text>
                            </Group>
                          </GridCol>
                        ))}
                      </Grid>
                    </Box>
                  </Stack>

                  {/* Galería de Deportes */}
                  <Stack gap="xs" mt="md">
                    <Text fw={700} size="xs" c="dimmed">{sportsGallery.title}</Text>
                    <Carousel
                      slideSize="100%"
                      slideGap="md"
                      withIndicators={sportsGallery.items.length > 1}
                      withControls={sportsGallery.items.length > 1}
                      emblaOptions={{ align: "start", loop: sportsGallery.items.length > 1 }}
                      classNames={{ viewport: classes.galleryCarouselViewport }}
                    >
                      {sportsGallery.items.map((item, index) => (
                        <Carousel.Slide key={item.title}>
                          <UnstyledButton
                            type="button"
                            className={classes.galleryButton}
                            onClick={() => setSelectedGallery({ items: sportsGallery.items, initialSlide: index })}
                          >
                            <div className={classes.galleryImageFrame} style={{ height: 160 }}>
                              <Image src={item.src} alt={item.alt} fill className={classes.galleryImage} />
                              <span className={classes.galleryImageLabel}>{item.title}</span>
                            </div>
                          </UnstyledButton>
                        </Carousel.Slide>
                      ))}
                    </Carousel>
                  </Stack>
                </Stack>
              </Card>
            </GridCol>

            {/* Columna de Infraestructura e Instalaciones */}
            <GridCol span={{ base: 12, lg: 6 }}>
              <Card id="instalaciones" withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%" className={classes.sectionAnchor}>
                <Stack gap="md" h="100%" justify="space-between">
                  <Stack gap="sm">
                    <Group gap="sm">
                      <ThemeIcon size={44} radius="xl" variant="light" color="brand.6">
                        <IconToolsKitchen2 size={22} stroke={1.8} />
                      </ThemeIcon>
                      <Title order={3} c="brand.7">
                        {facilities.title}
                      </Title>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {facilities.description}
                    </Text>

                    <Grid gutter="xs" mt="xs">
                      {facilities.items.map((item) => (
                        <GridCol key={item} span={6}>
                          <Card p="xs" radius="md" bg="var(--mantine-color-neutral-1)" withBorder>
                            <Group gap="xs" wrap="nowrap">
                              <IconChecklist size={16} color="var(--mantine-color-brand-6)" />
                              <Text size="xs" truncate="end">{item}</Text>
                            </Group>
                          </Card>
                        </GridCol>
                      ))}
                    </Grid>
                  </Stack>

                  {/* Galería de Instalaciones */}
                  <Stack gap="xs" mt="md">
                    <Text fw={700} size="xs" c="dimmed">{facilitiesGallery.title}</Text>
                    <Carousel
                      slideSize="100%"
                      slideGap="md"
                      withIndicators={facilitiesGallery.items.length > 1}
                      withControls={facilitiesGallery.items.length > 1}
                      emblaOptions={{ align: "start", loop: facilitiesGallery.items.length > 1 }}
                      classNames={{ viewport: classes.galleryCarouselViewport }}
                    >
                      {facilitiesGallery.items.map((item, index) => (
                        <Carousel.Slide key={item.title}>
                          <UnstyledButton
                            type="button"
                            className={classes.galleryButton}
                            onClick={() => setSelectedGallery({ items: facilitiesGallery.items, initialSlide: index })}
                          >
                            <div className={classes.galleryImageFrame} style={{ height: 160 }}>
                              <Image src={item.src} alt={item.alt} fill className={classes.galleryImage} />
                              <span className={classes.galleryImageLabel}>{item.title}</span>
                            </div>
                          </UnstyledButton>
                        </Carousel.Slide>
                      ))}
                    </Carousel>
                  </Stack>
                </Stack>
              </Card>
            </GridCol>

          </Grid>
        </Stack>
      </PaddingContainer>
    </>
  );
}