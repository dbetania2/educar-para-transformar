"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Burger,
  Drawer,
  Group,
  List,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconUserCircle } from "@tabler/icons-react";

import { AppModal, CTAButton, PaddingContainer } from "@/components/atoms";
import { DniNumberInput } from "@/components/molecules";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./Header.style";

type HeaderProps = StaticData["layout"]["header"];
type LoginFormValues = {
  legajo: string;
  dni: string;
};

function isActivePath(currentPathname: string, href: string) {
  if (href === "/") {
    return currentPathname === "/";
  }

  return currentPathname === href || currentPathname.startsWith(`${href}/`);
}

function LogoMark({ brand }: Pick<HeaderProps, "brand">) {
  const { classes } = useStyles();

  return (
    <Link href={brand.href} aria-label={brand.ariaLabel} className={classes.logoLink}>
      <Box component="span" className={classes.logoFrame}>
        <Image
          src={brand.logo.src}
          alt={brand.logo.alt}
          width={brand.logo.width}
          height={brand.logo.height}
          priority
          className={classes.logoImage}
        />
      </Box>
    </Link>
  );
}

function MenuDesktop({ navigation }: Pick<HeaderProps, "navigation">) {
  const pathname = usePathname();
  const { classes, cx } = useStyles();

  return (
    <Box component="nav" aria-label={navigation.ariaLabel} visibleFrom="md">
      <List listStyleType="none" className={classes.navList}>
        {navigation.items.map((item) => (
          <List.Item key={item.label}>
            {(() => {
              const isActive = isActivePath(pathname, item.href);
              const isEmphasis = item.href === "/inscripcion";

              return (
            <Link
              href={item.href}
              scroll
              onClick={() => {
                if (item.href === pathname) {
                  window.scrollTo({ top: 0, left: 0 });
                }
              }}
              className={cx(
                classes.navLink,
                isActive && classes.navLinkActive,
                isEmphasis && classes.navLinkEmphasis,
                isActive && isEmphasis && classes.navLinkEmphasisActive,
              )}
            >
              {item.label}
            </Link>
              );
            })()}
          </List.Item>
        ))}
      </List>
    </Box>
  );
}

type MenuMobileProps = {
  opened: boolean;
  close: () => void;
  openLogin: () => void;
} & Pick<HeaderProps, "access" | "navigation">;

function MenuMobile({
  opened,
  close,
  openLogin,
  access,
  navigation,
}: MenuMobileProps) {
  const pathname = usePathname();
  const { classes, cx } = useStyles();

  return (
    <Drawer
      opened={opened}
      onClose={close}
      hiddenFrom="md"
      title={navigation.menuTitle}
      padding="md"
      position="left"
    >
      <Stack gap="sm">
        <Box component="nav" aria-label={navigation.mobileAriaLabel}>
          <List listStyleType="none" className={classes.drawerList}>
        {navigation.items.map((item) => (
              <List.Item key={item.label}>
                {(() => {
                  const isActive = isActivePath(pathname, item.href);
                  const isEmphasis = item.href === "/inscripcion";

                  return (
                <Link
                  href={item.href}
                  scroll
                  onClick={() => {
                    if (item.href === pathname) {
                      window.scrollTo({ top: 0, left: 0 });
                    }
                    close();
                  }}
                  className={cx(
                    classes.navLinkMobile,
                    isActive && classes.navLinkActive,
                    isEmphasis && classes.navLinkEmphasis,
                    isActive && isEmphasis && classes.navLinkEmphasisActive,
                  )}
                >
                  {item.label}
                </Link>
                  );
                })()}
              </List.Item>
            ))}
          </List>
        </Box>

        <CTAButton
          type="button"
          aria-label={access.ariaLabel}
          icon={<IconUserCircle size={20} stroke={2} />}
          onClick={() => {
            close();
            openLogin();
          }}
          fullWidth
        >
          {access.label}
        </CTAButton>
      </Stack>
    </Drawer>
  );
}

export function Header({ access, brand, navigation }: HeaderProps) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [loginOpened, setLoginOpened] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { classes } = useStyles();
  const form = useForm<LoginFormValues>({
    initialValues: {
      legajo: "",
      dni: "",
    },
    validate: {
      legajo: (value) =>
        /^[A-Za-z]\d{6}$/.test(value.trim()) ? null : "Ingresá un legajo válido.",
      dni: (value) =>
        /^\d{8}$/.test(value.trim()) ? null : "Ingresá un DNI válido.",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          legajo: values.legajo.trim().toUpperCase(),
          dni: values.dni.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            role?: string;
            redirectTo?: string | null;
          }
        | null;

      if (!response.ok) {
        notifications.show({
          title: "No se pudo iniciar sesión",
          message: payload?.error ?? "Revisá tus credenciales e intentá otra vez.",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Sesión iniciada",
        message:
          payload?.role && payload.role !== "desconocido"
            ? `Ingresaste correctamente como ${payload.role}.`
            : "Ingresaste correctamente.",
        color: "green",
      });

      setLoginOpened(false);
      form.reset();

      if (payload?.redirectTo) {
        router.push(payload.redirectTo);
        router.refresh();
        return;
      }

      router.refresh();
    } catch {
      notifications.show({
        title: "No se pudo iniciar sesión",
        message: "Ocurrió un error de red. Intentá nuevamente.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box component="header" bg="#ffffff" className={classes.header}>
        <PaddingContainer py={{ base: 6, md: 8 }}>
          <Group justify="space-between" wrap="nowrap" gap="md">
            <LogoMark brand={brand} />

            <MenuDesktop navigation={navigation} />

            <Group gap="xs" wrap="nowrap">
              <Box visibleFrom="md" className={classes.desktopOnly}>
                <CTAButton
                  type="button"
                  aria-label={access.ariaLabel}
                  icon={<IconUserCircle size={22} stroke={2} />}
                  onClick={() => setLoginOpened(true)}
                  className={classes.desktopAccessButton}
                >
                  {access.label}
                </CTAButton>
              </Box>
              <Burger
                hiddenFrom="md"
                opened={opened}
                onClick={() => setOpened((value) => !value)}
                aria-label={navigation.burgerAriaLabel}
                classNames={{
                  root: classes.burgerRoot,
                  burger: classes.burgerLine,
                }}
              />
            </Group>
          </Group>
        </PaddingContainer>
      </Box>

      <MenuMobile
        opened={opened}
        close={() => setOpened(false)}
        openLogin={() => setLoginOpened(true)}
        access={access}
        navigation={navigation}
      />

      <AppModal
        opened={loginOpened}
        onClose={() => setLoginOpened(false)}
        title="Acceder"
        description="Ingresá con tu correo y contraseña."
        size={640}
        layout="form"
        primaryAction={{
          type: "submit",
          form: "header-login-form",
          disabled: isSubmitting,
          label: isSubmitting ? "Ingresando..." : "Ingresar",
        }}
      >
        <form id="header-login-form" onSubmit={form.onSubmit(handleLogin)}>
          <Stack gap="md">
            <TextInput
              label="Legajo"
              placeholder="A123456"
              description="Usá tu legajo institucional."
              withAsterisk
              {...form.getInputProps("legajo")}
            />

            <DniNumberInput
              label="DNI"
              placeholder="Ingresá tu DNI"
              description="Se usa como credencial de acceso."
              withAsterisk
              value={form.values.dni}
              error={form.errors.dni}
              onChange={(value) => form.setFieldValue("dni", String(value ?? "").replace(/\D/g, "").slice(0, 8))}
            />
          </Stack>
        </form>
      </AppModal>
    </>
  );
}

export default Header;
