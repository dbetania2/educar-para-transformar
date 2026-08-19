"use client";

import Image from "next/image";
import Link from "next/link";
import { Anchor, Box, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";

import { PaddingContainer } from "@/components/atoms";
import { useStaticData } from "@/hooks/useStaticData";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./Footer.style";

const currentYear = new Date().getFullYear();

// Enlaces estáticos solicitados para la navegación
const navigationLinks = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Bienestar", href: "/bienestar" },
  { label: "Noticias", href: "/noticias" },
  { label: "Inscripción", href: "/inscripcion" },
  { label: "Empleo", href: "/empleos" },
  { label: "Contacto", href: "/contacto" },
];

type FooterProps = StaticData["layout"]["footer"];

export function Footer({
  brandName,
  logo,
  navAriaLabel,
  rightsReservedLabel,
}: FooterProps) {
  const { classes } = useStyles();
  
  // Extraemos la información estática para evitar errores de hidratación (SSR mismatch)
  const { defaultData } = useStaticData();
  const siteDescription = defaultData.site.description;
  const contactInfo = defaultData.contactoPage.contactInfo;
  const channels = defaultData.contactoPage.channels;

  return (
    <Box component="footer" className={classes.footer}>
      <PaddingContainer>
        <Box className={classes.gridWrapper}>
          
          {/* COLUMNA 1: Logo, Descripción y Redes Sociales */}
          <Box className={classes.logoBlock}>
            <Box className={classes.logoFrame}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className={classes.logo}
              />
            </Box>

            <Text c="rgba(255, 255, 255, 0.85)" className={classes.brandDescription}>
              {siteDescription}
            </Text>

            <Group gap="sm" className={classes.socialGroup}>
              <Anchor 
                href={`https://facebook.com/${channels.socialMedia.facebook.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
              >
                <ThemeIcon size="lg" radius="xl" variant="transparent" c="rgba(255, 255, 255, 0.8)" className={classes.socialIcon}>
                  <IconBrandFacebook size={24} stroke={1.5} />
                </ThemeIcon>
              </Anchor>

              <Anchor 
                href={`https://instagram.com/${channels.socialMedia.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
              >
                <ThemeIcon size="lg" radius="xl" variant="transparent" c="rgba(255, 255, 255, 0.8)" className={classes.socialIcon}>
                  <IconBrandInstagram size={24} stroke={1.5} />
                </ThemeIcon>
              </Anchor>
            </Group>
          </Box>

          {/* COLUMNA 2: Enlaces de Navegación */}
          <Box className={classes.linksBlock}>
            <Title order={5} c="white" className={classes.sectionTitle}>
              Navegación
            </Title>

            <Box component="nav" aria-label={navAriaLabel} className={classes.nav}>
              {navigationLinks.map((item) => (
                <Anchor 
                  component={Link} 
                  key={item.label} 
                  href={item.href} 
                  c="rgba(255, 255, 255, 0.75)" 
                  className={classes.link}
                >
                  {item.label}
                </Anchor>
              ))}
            </Box>
          </Box>

          {/* COLUMNA 3: Datos de Contacto */}
          <Box className={classes.contactBlock}>
            <Title order={5} c="white" className={classes.sectionTitle}>
              Contacto
            </Title>

            <Stack gap="sm" className={classes.contactList}>
              <Group wrap="nowrap" gap="sm">
                <ThemeIcon size={24} variant="transparent" className={classes.contactIcon}>
                  <IconMapPin size={20} stroke={1.5} />
                </ThemeIcon>
                <Text c="rgba(255, 255, 255, 0.85)" className={classes.contactText}>
                  {contactInfo.address.value}
                </Text>
              </Group>

              <Group wrap="nowrap" gap="sm">
                <ThemeIcon size={24} variant="transparent" className={classes.contactIcon}>
                  <IconBrandWhatsapp size={20} stroke={1.5} />
                </ThemeIcon>
                <Anchor 
                  href={channels.whatsapp.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  c="rgba(255, 255, 255, 0.85)" 
                  className={classes.mailLink}
                >
                  {channels.whatsapp.value}
                </Anchor>
              </Group>

              <Group wrap="nowrap" gap="sm">
                <ThemeIcon size={24} variant="transparent" className={classes.contactIcon}>
                  <IconMail size={20} stroke={1.5} />
                </ThemeIcon>
                <Anchor 
                  href={contactInfo.email.href} 
                  c="rgba(255, 255, 255, 0.85)" 
                  className={[classes.contactText, classes.mailLink].join(" ")}
                >
                  {contactInfo.email.value}
                </Anchor>
              </Group>
            </Stack>
          </Box>

        </Box>

        {/* BARRA INFERIOR: Copyright */}
        <Box className={classes.bottomBar}>
          <Text c="white" className={classes.brandName}>
            {brandName}
          </Text>

          <Text c="rgba(255, 255, 255, 0.6)" className={classes.legalText}>
            © {currentYear} {brandName}. {rightsReservedLabel}
          </Text>
        </Box>
      </PaddingContainer>
    </Box>
  );
}

export default Footer;