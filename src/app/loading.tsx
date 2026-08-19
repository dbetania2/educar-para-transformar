"use client";

import { useEffect } from "react";
import { nprogress } from "@mantine/nprogress";
import { Center, Loader, Stack, Text } from "@mantine/core";
import { useStyles } from "./appStates.style";
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function Loading() {
  const { classes } = useStyles();
  useEffect(() => {
    // 1. Inicia la barra ni bien aparece el loading
    nprogress.start();

    // 2. Función de limpieza (cleanup)
    // Se ejecuta automáticamente cuando Next.js quita el loading y muestra la página
    return () => {
      nprogress.complete();
    };
  }, []);

  return (
    <Center className={classes.centerViewport}>
      <Stack align="center" gap="md">
        <Image
          src={logo}
          alt="Educar para transformar"
          width={140}
          height={106}
          priority
          style={{
            width: "clamp(128px, 9vw, 168px)",
            height: "auto",
            objectFit: "contain",
          }}
        />
        <Text size="lg" fw={500} c="dimmed" ta="center">
          Cargando Educar para transformar...
        </Text>
        <Loader color="blue" size="md" type="dots" />
      </Stack>
    </Center>
  );
}
