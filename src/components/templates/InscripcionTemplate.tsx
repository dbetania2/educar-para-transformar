import { Stack } from "@mantine/core";
import { IconClipboardList, IconMailForward } from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import { PublicPageHero } from "@/components/molecules/PublicPageHero/PublicPageHero";
import InscripcionForm from "@/components/molecules/InscripcionForm/InscripcionForm";
import type { StaticData } from "@/hooks/useStaticData";

type InscripcionTemplateProps = StaticData["inscripcionPage"];

export default function InscripcionTemplate({
  hero,
  form,
}: InscripcionTemplateProps) {
  return (
    <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
      <Stack gap="pageGapLg">
        <PublicPageHero
          eyebrow="Proceso de admisión"
          title={hero.title}
          description={hero.description}
          badges={["Pre-inscripción", "Ciclo lectivo 2027", "Acompañamiento familiar"]}
          asideItems={[
            {
              icon: <IconClipboardList size={22} stroke={1.8} />,
              title: "Solicitud guiada",
              description: "Completá los datos por bloques para que admisiones pueda evaluar la solicitud.",
            },
            {
              icon: <IconMailForward size={22} stroke={1.8} />,
              title: "Contacto posterior",
              description: "Nuestro equipo se comunica con la familia para continuar el proceso y reservar la vacante.",
            },
          ]}
        />

        <InscripcionForm {...form} />
      </Stack>
    </PaddingContainer>
  );
}
