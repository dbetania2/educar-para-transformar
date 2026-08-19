"use client";

import {
  Title,
  Text,
  Container,
  Group,
  Stack,
  Center,
} from "@mantine/core";
import { useRouter } from "next/navigation";

import { CTAButton } from "@/components/atoms";
import { useStyles } from "./appStates.style";

export default function NotFound() {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <Center className={classes.centerViewport}>
      <Container size="md">
        <Stack align="center" gap="lg">
          <Title order={1} className={classes.notFoundCode}>
            404
          </Title>

          <Stack align="center" gap={0}>
            <Title order={2}>Parece que te perdiste en el sistema</Title>
            <Text c="dimmed" size="lg" ta="center" mt="md">
              La página que buscas no existe o fue movida a otra sección del
              SGA.
            </Text>
          </Stack>

          <Group justify="center">
            <CTAButton
              ctaVariant="secondary"
              onClick={() => router.back()}
            >
              Volver atrás
            </CTAButton>
            <CTAButton onClick={() => router.push("/")}>
              Ir al Inicio
            </CTAButton>
          </Group>
        </Stack>
      </Container>
    </Center>
  );
}
