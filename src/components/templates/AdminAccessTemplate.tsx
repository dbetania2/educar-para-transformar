"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Card,
  Grid,
  GridCol,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconLock, IconShieldPlus } from "@tabler/icons-react";

import { CTAButton, PaddingContainer } from "@/components/atoms";

type AdminAccessTemplateProps = {
  reason?: string;
};

type LoginValues = {
  email: string;
  password: string;
};

type BootstrapAdminValues = {
  fullName: string;
  email: string;
  password: string;
  bootstrapSecret: string;
};

function isLoginEmailIdentifier(value: string) {
  const trimmed = value.trim();
  const parts = trimmed.split("@");
  const domain = parts[1] ?? "";

  return parts.length === 2 && parts.every(Boolean) && domain.includes(".") && !/\s/.test(trimmed);
}

function isFullEmailAddress(value: string) {
  return isLoginEmailIdentifier(value);
}

type AdminBootstrapStatus = {
  enabled: boolean;
  requiresSecret: boolean;
  lockedReason: string | null;
};

type BootstrapStatusPayload = {
  requiresBootstrap?: boolean;
  error?: string;
  bootstrap?: AdminBootstrapStatus;
};

function getAccessReasonMessage(reason?: string) {
  if (reason === "forbidden") {
    return "Tu usuario no tiene rol administrativo para entrar al backoffice.";
  }

  return null;
}

export default function AdminAccessTemplate({
  reason,
}: AdminAccessTemplateProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [requiresBootstrap, setRequiresBootstrap] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<AdminBootstrapStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loginForm = useForm<LoginValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        isLoginEmailIdentifier(value) ? null : "Ingresá un correo válido.",
      password: (value) =>
        value.trim().length >= 6 ? null : "Ingresá una contraseña válida.",
    },
  });

  const bootstrapForm = useForm<BootstrapAdminValues>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      bootstrapSecret: "",
    },
    validate: {
      fullName: (value) =>
        value.trim().length >= 3 ? null : "Ingresá el nombre completo.",
      email: (value) =>
        isFullEmailAddress(value) ? null : "Ingresá un correo válido.",
      password: (value) =>
        value.trim().length >= 6 ? null : "Ingresá una contraseña de al menos 6 caracteres.",
      bootstrapSecret: (value) =>
        bootstrapStatus?.requiresSecret && value.trim().length === 0
          ? "Ingresá la clave de bootstrap."
          : null,
    },
  });

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      const response = await fetch("/api/admin/bootstrap/status");
      const payload = (await response.json().catch(() => null)) as BootstrapStatusPayload | null;

      if (cancelled) {
        return;
      }

      if (response.ok && payload?.requiresBootstrap) {
        setRequiresBootstrap(true);
        setBootstrapStatus(payload?.bootstrap ?? null);
        setStatusError(null);
        return;
      }

      if (!response.ok) {
        setStatusError(payload?.error ?? "No se pudo validar el estado administrativo.");
        setBootstrapStatus(payload?.bootstrap ?? null);
        return;
      }

      setRequiresBootstrap(false);
      setBootstrapStatus(null);
      setStatusError(null);
    };

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (values: LoginValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
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

      const homePath = payload?.redirectTo ?? null;

      if (payload?.role !== "administrativo") {
        if (homePath) {
          notifications.show({
            title: "Redirigiendo a tu panel",
            message: "Tu usuario pertenece a otra área protegida.",
            color: "blue",
          });
          router.push(homePath);
          router.refresh();
          return;
        }

        await fetch("/api/logout", { method: "POST" }).catch(() => null);
        notifications.show({
          title: "Acceso restringido",
          message: "Este acceso está reservado para usuarios administrativos.",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Sesión iniciada",
        message: "Ingresaste correctamente al backoffice.",
        color: "green",
      });

      router.push(homePath ?? "/admin/usuarios");
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

  const handleBootstrapAdmin = async (values: BootstrapAdminValues) => {
    setIsBootstrapping(true);

    const response = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; user?: { email: string } }
      | null;

    setIsBootstrapping(false);

    if (!response.ok) {
      notifications.show({
        title: "No se pudo crear el administrador inicial",
        message: payload?.error ?? "Intentá nuevamente.",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Administrador inicial creado",
      message: `Ya podés iniciar sesión con ${payload?.user?.email ?? values.email}.`,
      color: "green",
    });

    bootstrapForm.reset();
    loginForm.setFieldValue("email", payload?.user?.email ?? values.email);
    setRequiresBootstrap(false);
  };

  const accessReasonMessage = getAccessReasonMessage(reason);
  const bootstrapLocked = requiresBootstrap && bootstrapStatus?.enabled === false;

  return (
    <PaddingContainer py={{ base: "pagePadSm", md: "pagePadLg" }}>
      <Stack gap="pageGapLg">
        {accessReasonMessage ? (
          <Alert
            variant="filled"
            color="red"
            radius="xl"
            icon={<IconAlertCircle size={18} />}
            title="Acceso restringido"
          >
            {accessReasonMessage}
          </Alert>
        ) : null}

        {statusError ? (
          <Alert
            variant="filled"
            color="red"
            radius="xl"
            icon={<IconAlertCircle size={18} />}
            title="No se pudo validar el acceso"
          >
            {statusError}
          </Alert>
        ) : null}

        {bootstrapLocked && bootstrapStatus?.lockedReason ? (
          <Alert
            variant="filled"
            color="yellow"
            radius="xl"
            icon={<IconAlertCircle size={18} />}
            title="Bootstrap bloqueado"
          >
            {bootstrapStatus.lockedReason}
          </Alert>
        ) : null}

        <Grid gutter="xl" align="stretch" justify="center">
          <GridCol span={{ base: 12, md: 10, lg: requiresBootstrap ? 6 : 5 }}>
            <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }}>
              <Stack gap="sectionGapLg">
                <Box>
                  <Group gap="sm" align="center">
                    <IconLock size={24} />
                    <Title order={2} c="brand.7">
                      Login administrativo
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed" mt={6}>
                    Este acceso está reservado para administración.
                  </Text>
                </Box>

                <form onSubmit={loginForm.onSubmit(handleLogin)}>
                  <Stack gap="blockGapLg">
                    <TextInput
                      label="Correo electrónico"
                      placeholder="admin@email.com"
                      description="Usá el correo del usuario administrativo."
                      withAsterisk
                      {...loginForm.getInputProps("email")}
                    />

                    <PasswordInput
                      label="Contraseña"
                      placeholder="Tu contraseña"
                      description="Debe tener al menos 6 caracteres."
                      withAsterisk
                      {...loginForm.getInputProps("password")}
                    />

                    <CTAButton type="submit" fullWidth disabled={isSubmitting}>
                      {isSubmitting ? "Ingresando..." : "Ingresar al panel"}
                    </CTAButton>
                  </Stack>
                </form>
              </Stack>
            </Card>
          </GridCol>

          {requiresBootstrap ? (
            <GridCol span={{ base: 12, md: 10, lg: 5 }}>
              <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} h="100%">
                <Stack gap="sectionGapLg">
                  <Box>
                    <Group gap="sm" align="center">
                      <IconShieldPlus size={24} />
                      <Title order={2} c="brand.7">
                        Bootstrap administrativo
                      </Title>
                    </Group>
                    <Text size="sm" c="dimmed" mt={6}>
                      No existe ningún usuario administrativo. Creá el primero desde acá.
                    </Text>
                  </Box>

                  <form onSubmit={bootstrapForm.onSubmit(handleBootstrapAdmin)}>
                    <Stack gap="blockGapLg">
                      <TextInput
                        label="Nombre completo"
                        placeholder="Ej. Admin Principal"
                        description="Será el nombre visible del administrador."
                        withAsterisk
                        {...bootstrapForm.getInputProps("fullName")}
                      />

                      <TextInput
                        label="Correo electrónico"
                        placeholder="admin@email.com"
                        description="Será el usuario principal de acceso."
                        withAsterisk
                        {...bootstrapForm.getInputProps("email")}
                      />

                      <PasswordInput
                        label="Contraseña inicial"
                        placeholder="Mínimo 6 caracteres"
                        description="Podrás cambiarla más adelante si hace falta."
                        withAsterisk
                        {...bootstrapForm.getInputProps("password")}
                      />

                      {bootstrapStatus?.requiresSecret ? (
                        <PasswordInput
                          label="Clave de bootstrap"
                          placeholder="Ingresá ADMIN_BOOTSTRAP_SECRET"
                          description="Se requiere para evitar que cualquier visitante tome el primer acceso."
                          withAsterisk
                          {...bootstrapForm.getInputProps("bootstrapSecret")}
                        />
                      ) : null}

                      <CTAButton
                        type="submit"
                        fullWidth
                        disabled={isBootstrapping || bootstrapLocked}
                      >
                        {isBootstrapping
                          ? "Creando administrador..."
                          : "Crear primer administrador"}
                      </CTAButton>
                    </Stack>
                  </form>
                </Stack>
              </Card>
            </GridCol>
          ) : null}
        </Grid>
      </Stack>
    </PaddingContainer>
  );
}
