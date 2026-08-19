"use client";

import Image from "next/image";
import {
  Card,
  Flex,
  Stack,
  Text,
  Title,
  Badge,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms/CTAButton/CTAButton";
import { useStyles } from "./SectionHighlight.style";

interface SectionHighlightProps {
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  badge?: string;
}

export function SectionHighlight({
  title,
  description,
  linkHref,
  linkLabel,
  imageSrc,
  imageAlt,
  reverse = false,
  badge,
}: SectionHighlightProps) {
  const { classes } = useStyles();
  const sectionId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <Card
      component="section"
      aria-labelledby={sectionId}
      p={0}
      withBorder
      className={classes.sectionCard}
    >
      <Flex
        direction={{
          base: "column",
          md: reverse ? "row-reverse" : "row",
        }}
        className={classes.layout}
      >
        <div className={classes.content}>
          <Stack gap="lg" align="flex-start">
            {/* Etiqueta con nuevo estilo resplandeciente */}
            {badge && (
              <Badge 
                variant="light" 
                color="brand.6" 
                radius="xl" 
                size="lg"
                className={classes.badge}
              >
                {badge}
              </Badge>
            )}

            {/* El color se maneja ahora desde el CSS con un gradiente */}
            <Title id={sectionId} order={2} className={classes.title}>
              {title}
            </Title>

            <Text className={classes.description}>
              {description}
            </Text>

            <CTAButton
              href={linkHref}
              ctaVariant="outline"
              icon={<IconArrowRight size={18} />}
              iconPosition="right"
              mt="sm" 
            >
              {linkLabel}
            </CTAButton>
          </Stack>
        </div>

        <div
          className={
            reverse
              ? `${classes.imageContainer} ${classes.reverseImage}`
              : classes.imageContainer
          }
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={classes.image}
          />
        </div>
      </Flex>
    </Card>
  );
}