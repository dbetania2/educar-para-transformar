"use client";

import Image from "next/image";
import { Box, Group, Stack, Text, Title, Badge } from "@mantine/core";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";

import { CTAButton, PaddingContainer } from "@/components/atoms";
import type { StaticData } from "@/hooks/useStaticData";

import { useStyles } from "./HeroHome.style";

type HeroHomeProps = StaticData["homePage"]["hero"];

export function HeroHome({ title, description, image }: HeroHomeProps) {
  const { classes } = useStyles();

  return (
    <Box component="section" className={classes.root}>
      <PaddingContainer>
        <Box className={classes.grid}>
          {/* LEFT */}
          <Stack className={classes.leftColumn}>
            <Badge
              variant="light"
              color="brand.7"
              size="lg"
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
              className={classes.badge}
            >
              Inscripciones abiertas 2026
            </Badge>

            <Stack gap="sectionGapLg">
              <Title order={1} variant="hero" className={classes.title}>
                {title}
              </Title>

              <Text className={classes.description}>{description}</Text>

              <Text className={classes.secondaryText}>
                Educación integral que combina excelencia académica, innovación,
                idiomas y desarrollo humano para formar estudiantes preparados
                para los desafíos del futuro.
              </Text>
            </Stack>

            <Group className={classes.actions}>
              <CTAButton href="/inscripcion" className={classes.primaryButton}>
                Inscribirme ahora
              </CTAButton>

              <CTAButton
                href="/nosotros"
                ctaVariant="secondary"
                icon={<IconPlayerPlay size={22} />}
                className={classes.secondaryButton}
              >
                Conocer más
              </CTAButton>
            </Group>
          </Stack>

          {/* RIGHT */}
          <Box className={classes.visualWrap}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority
              className={classes.heroImage}
            />
          </Box>
        </Box>
      </PaddingContainer>
    </Box>
  );
}

export default HeroHome;