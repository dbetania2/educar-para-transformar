"use client";

import { Group, Stack, Text, ThemeIcon, Title, Button } from "@mantine/core";
import { IconArrowRight, IconSchool } from "@tabler/icons-react";
import Link from "next/link";

import { useStyles } from "./AdmissionBanner.style";

export function AdmissionBanner() {
  const { classes } = useStyles();

  return (
    <Group
      className={classes.root}
      justify="space-between"
      align="center"
    >
      {/* Lado Izquierdo: Ícono y Textos */}
      <Group gap="lg" className={classes.contentGroup}>
        <ThemeIcon
          size={64}
          radius="50%"
          variant="white"
          color="brand.6"
          className={classes.iconContainer}
        >
          <IconSchool size={32} stroke={1.5} />
        </ThemeIcon>

        {/* Agregamos una clase al Stack para centrar su contenido en móvil */}
        <Stack gap={4} className={classes.textStack}>
          {/* Prop c="white" fuerza el color blanco independientemente del tema */}
          <Title order={2} c="white" className={classes.title}>
            ¿Listo para ser parte de nuestra comunidad?
          </Title>
          {/* Forzamos el blanco semitransparente */}
          <Text c="rgba(255, 255, 255, 0.9)" className={classes.subtitle}>
            Inscripciones abiertas para el ciclo lectivo 2026
          </Text>
        </Stack>
      </Group>

      {/* Lado Derecho: Botón CTA */}
      <Button
        component={Link}
        href="/inscripcion"
        variant="white"
        color="brand.7"
        radius="xl"
        size="md"
        rightSection={<IconArrowRight size={18} stroke={2} />}
        className={classes.button}
      >
        Inscribirme ahora
      </Button>
    </Group>
  );
}

export default AdmissionBanner;