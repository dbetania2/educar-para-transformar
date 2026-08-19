"use client";

import { Box, Container, Stack } from "@mantine/core";
import { HeroHome } from "@/components/molecules";
import { SectionHighlight } from "@/components/organisms/SectionHighlight/SectionHighlight";
import { NewsPreview } from "@/components/organisms/NewsPreview/NewsPreview";
import { StatsBanner } from "@/components/organisms/StatsBanner/StatsBanner";
import { AdmissionBanner } from "@/components/organisms/AdmissionBanner/AdmissionBanner";

// Importamos todos los assets necesarios
import {
  useStaticData,
  nosotrosComunidadAsset,
  nosotrosOfertaAcademicaAsset,
  nosotrosInstalacionesAsset,
  deporteNatacionAsset, // Usado para la tarjeta de Empleos
} from "@/hooks/useStaticData";

import type { NewsRecord } from "@/lib/news";

type HomePageProps = {
  publishedNews: NewsRecord[];
};

export function HomePage({ publishedNews }: HomePageProps) {
  const { defaultData } = useStaticData();

  return (
    <Box bg="linear-gradient(180deg, #f7f8fa 0%, #eef5fb 100%)">
      <HeroHome {...defaultData.homePage.hero} />

      <Container
        size="xl"
        py={{
          base: "xl",
          md: "calc(var(--mantine-spacing-xl) * 2)",
        }}
      >
        <Stack gap="xl">
          {/* 1. SECCIÓN NOSOTROS (Identidad) */}
          <SectionHighlight
            badge="Institucional"
            title="Conoce nuestra comunidad educativa"
            description="Somos una institución dedicada a la excelencia académica y la formación integral, en un entorno pensado para aprender y crecer."
            linkHref="/nosotros"
            linkLabel="Sobre nosotros"
            imageSrc={nosotrosComunidadAsset.src}
            imageAlt="Comunidad educativa"
            reverse={false} // Imagen a la izquierda
          />

          {/* 2. SECCIÓN OFERTA ACADÉMICA (Niveles) */}
          <SectionHighlight
            badge="Académico"
            title="Nuestra oferta educativa"
            description="Educación desde el Nivel Inicial hasta el Secundario, con formación trilingüe, jornada extendida y un fuerte desarrollo físico y humano."
            linkHref="/nosotros#niveles-educativos"
            linkLabel="Ver oferta educativa"
            imageSrc={nosotrosOfertaAcademicaAsset.src}
            imageAlt="Oferta académica"
            reverse={true} // Imagen a la derecha
          />

          {/* 3. SECCIÓN BIENESTAR (Enfoque en Instalaciones y Servicios) */}
          <SectionHighlight
            badge="Vida Estudiantil"
            title="Campus y Bienestar"
            description="Ve nuestras instalaciones y servicios. Contamos con modernos laboratorios, servicio de comedor, micros de traslado y un entorno diseñado para el confort y desarrollo de los estudiantes."
            linkHref="/nosotros#instalaciones"
            linkLabel="Conocer instalaciones y servicios"
            imageSrc={deporteNatacionAsset.src} // Asset exportado
            imageAlt="Instalaciones y servicios del colegio"
            reverse={false} // Imagen a la izquierda
          />

          {/* 4. SECCIÓN EMPLEO (Usando la foto de natación) */}
          <SectionHighlight
            badge="Súmate al equipo"
            title="Oportunidades Laborales"
            description="Buscamos profesionales apasionados por la educación y el desarrollo humano. Descubre nuestras búsquedas abiertas y forma parte de nuestro equipo."
            linkHref="/empleos"
            linkLabel="Trabaja con nosotros"
            imageSrc={nosotrosInstalacionesAsset.src} // Imagen de instalaciones
            imageAlt="Equipo de profesionales educativos"
            reverse={true} // Imagen a la derecha
          />

          {/* COMPONENTES ADICIONALES */}
          <NewsPreview publishedNews={publishedNews} />

          <StatsBanner />

          <AdmissionBanner />
        </Stack>
      </Container>
    </Box>
  );
}