"use client";

import { useEffect } from "react";
import {
  Title,
  Text,
  Button,
  Container,
  Stack,
  Center,
  Code,
} from "@mantine/core";
import { useStyles } from "./appStates.style";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { classes } = useStyles();
  useEffect(() => {
    // Podés loguear el error a un servicio externo aquí
    console.error(error);
  }, [error]);

  return (
    <Center className={classes.centerViewport}>
      <Container size="md">
        <Stack align="center" gap="xl">
          <Title order={1} c="red.6">
            Algo salió mal en el servidor
          </Title>

          <Text ta="center" size="lg">
            Ocurrió un error inesperado al procesar la solicitud. Probá
            reintentando la acción.
          </Text>

          {/* Mostrar el error de forma técnica pero discreta */}
          <Code block color="red.1" c="red.9" className={classes.codeBlock}>
            {error.message || "Error desconocido"}
          </Code>

          <Stack gap="xs" align="center">
            <Button color="red" size="md" onClick={() => reset()}>
              Reintentar Operación
            </Button>
            <Button
              variant="subtle"
              onClick={() => (window.location.href = "/")}
            >
              Volver al Inicio
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Center>
  );
}
