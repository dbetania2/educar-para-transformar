"use client";

import {
  Box,
  Card,
  Drawer,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

import { CTAButton } from "@/components/atoms";
import { DniNumberInput } from "@/components/molecules";
import { roleUsesLegajo } from "@/lib/auth/legajo";
import { USER_ROLE_OPTIONS, type AppUserRole } from "@/lib/auth/roles";
import {
  DINING_SERVICE_OPTIONS,
  SPORT_OPTIONS,
  TRANSPORT_ROUTE_OPTIONS,
} from "@/lib/extracurricular";
import type { CreateUserValues } from "../types";
import { STUDENT_LEVEL_OPTIONS } from "../userUtils";

type AdminUserCreateDrawerProps = {
  opened: boolean;
  onClose: () => void;
  title: string;
  description: string;
  lockedRoleFilter?: AppUserRole | null;
  isCreating: boolean;
  form: UseFormReturnType<CreateUserValues>;
  onSubmit: (values: CreateUserValues) => Promise<void>;
};

export function AdminUserCreateDrawer({
  opened,
  onClose,
  title,
  description,
  lockedRoleFilter = null,
  isCreating,
  form,
  onSubmit,
}: AdminUserCreateDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      position="right"
      size="min(100vw, 560px)"
      padding="xl"
    >
      <Stack gap="xs" mb="lg">
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Stack>

      <form id="admin-create-user-form" onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="blockGapLg">
          <SimpleGrid cols={1} spacing="lg" verticalSpacing="md">
            <TextInput
              label="Nombre completo"
              placeholder="Ej. Ana Pérez"
              description="Nombre visible."
              withAsterisk
              {...form.getInputProps("fullName")}
            />
            <TextInput
              label="Correo electrónico"
              placeholder="ana@email.com"
              description="Correo interno del usuario."
              withAsterisk
              {...form.getInputProps("email")}
            />
            <DniNumberInput
              label="DNI"
              placeholder="Solo números"
              description="Se usa como contraseña inicial en accesos por legajo."
              withAsterisk={roleUsesLegajo(form.values.role)}
              value={form.values.dni}
              error={form.errors.dni}
              onChange={(value) =>
                form.setFieldValue("dni", String(value ?? "").replace(/\D/g, "").slice(0, 8))
              }
            />
            {!roleUsesLegajo(form.values.role) ? (
              <PasswordInput
                label="Contraseña inicial"
                placeholder="Mínimo 6 caracteres"
                withAsterisk
                {...form.getInputProps("password")}
              />
            ) : null}
            <Select
              label="Rol"
              data={
                lockedRoleFilter
                  ? USER_ROLE_OPTIONS.filter((option) => option.value === lockedRoleFilter)
                  : [...USER_ROLE_OPTIONS]
              }
              disabled={Boolean(lockedRoleFilter)}
              withAsterisk
              {...form.getInputProps("role")}
            />

            {form.values.role === "tutor" ? (
              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap="md">
                  <Box>
                    <Text fw={700}>Vinculación con alumno</Text>
                    <Text size="sm" c="dimmed">
                      Buscamos el alumno por DNI y vinculamos este tutor a su seguimiento.
                    </Text>
                  </Box>
                  <DniNumberInput
                    label="DNI del alumno"
                    placeholder="DNI del alumno existente"
                    withAsterisk
                    value={form.values.tutorStudentDni}
                    error={form.errors.tutorStudentDni}
                    onChange={(value) =>
                      form.setFieldValue(
                        "tutorStudentDni",
                        String(value ?? "").replace(/\D/g, "").slice(0, 8),
                      )
                    }
                  />
                </Stack>
              </Card>
            ) : null}

            {form.values.role === "docente" ? (
              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap="md">
                  <Box>
                    <Text fw={700}>Ficha profesional del docente</Text>
                    <Text size="sm" c="dimmed">
                      El sistema asignará un legajo correlativo automático (D000001...) y vinculará su especialidad y contacto.
                    </Text>
                  </Box>
                  <TextInput
                    label="Especialidad / Título"
                    placeholder="Ej. Profesorado en Matemática / Letras"
                    withAsterisk
                    {...form.getInputProps("specialty")}
                  />
                  <TextInput
                    label="Teléfono de contacto"
                    placeholder="Ej. 3624..."
                    {...form.getInputProps("contactPhone")}
                  />
                  <TextInput
                    label="Domicilio"
                    placeholder="Ej. Av. 9 de Julio 1250"
                    {...form.getInputProps("address")}
                  />
                </Stack>
              </Card>
            ) : null}

            {form.values.role === "alumno" ? (
              <Card withBorder radius="md" p="md" bg="white">
                <Stack gap="md">
                  <Box>
                    <Text fw={700}>Ficha inicial del alumno</Text>
                    <Text size="sm" c="dimmed">
                      Se guarda aprobada directamente para que el campus ya tenga nivel, contacto y responsables.
                    </Text>
                  </Box>
                  <Select
                    label="Nivel"
                    placeholder="Seleccioná un nivel"
                    data={STUDENT_LEVEL_OPTIONS}
                    withAsterisk
                    {...form.getInputProps("level")}
                  />
                  <NumberInput
                    label="Teléfono de contacto"
                    placeholder="Ej. 3624..."
                    allowDecimal={false}
                    allowNegative={false}
                    clampBehavior="none"
                    hideControls
                    inputMode="numeric"
                    isAllowed={({ value }) => /^\d{0,15}$/.test(value)}
                    maxLength={15}
                    thousandSeparator={false}
                    trimLeadingZeroesOnBlur={false}
                    type="tel"
                    value={form.values.contactPhone}
                    valueIsNumericString
                    withAsterisk
                    error={form.errors.contactPhone}
                    onChange={(value) =>
                      form.setFieldValue(
                        "contactPhone",
                        String(value ?? "").replace(/\D/g, "").slice(0, 15),
                      )
                    }
                  />
                  <TextInput
                    label="Domicilio"
                    placeholder="Ej. Calle Güemes 450"
                    {...form.getInputProps("address")}
                  />
                  <Select
                    label="Responsable"
                    withAsterisk
                    data={[
                      { value: "tutor", label: "Tutor" },
                      { value: "parents", label: "Padre y madre" },
                    ]}
                    {...form.getInputProps("responsibleType")}
                  />
                  {form.values.responsibleType === "tutor" ? (
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
                      <TextInput
                        label="Nombre del tutor"
                        withAsterisk
                        {...form.getInputProps("tutorFullName")}
                      />
                      <DniNumberInput
                        label="DNI del tutor"
                        withAsterisk
                        value={form.values.tutorDni}
                        error={form.errors.tutorDni}
                        onChange={(value) =>
                          form.setFieldValue(
                            "tutorDni",
                            String(value ?? "").replace(/\D/g, "").slice(0, 8),
                          )
                        }
                      />
                    </SimpleGrid>
                  ) : null}
                  {form.values.responsibleType === "parents" ? (
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" verticalSpacing="md">
                      <TextInput
                        label="Nombre del padre"
                        withAsterisk
                        {...form.getInputProps("fatherFullName")}
                      />
                      <DniNumberInput
                        label="DNI del padre"
                        withAsterisk
                        value={form.values.fatherDni}
                        error={form.errors.fatherDni}
                        onChange={(value) =>
                          form.setFieldValue(
                            "fatherDni",
                            String(value ?? "").replace(/\D/g, "").slice(0, 8),
                          )
                        }
                      />
                      <TextInput
                        label="Nombre de la madre"
                        withAsterisk
                        {...form.getInputProps("motherFullName")}
                      />
                      <DniNumberInput
                        label="DNI de la madre"
                        withAsterisk
                        value={form.values.motherDni}
                        error={form.errors.motherDni}
                        onChange={(value) =>
                          form.setFieldValue(
                            "motherDni",
                            String(value ?? "").replace(/\D/g, "").slice(0, 8),
                          )
                        }
                      />
                    </SimpleGrid>
                  ) : null}
                  <MultiSelect
                    label="Deportes extracurriculares (máx. 2 sin choque horario)"
                    placeholder="Seleccionar hasta 2 disciplinas"
                    data={SPORT_OPTIONS}
                    maxValues={2}
                    clearable
                    searchable
                    {...form.getInputProps("sports")}
                  />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      label="Recorrido de Transporte (Micro)"
                      data={TRANSPORT_ROUTE_OPTIONS}
                      {...form.getInputProps("transportRoute")}
                    />
                    <Select
                      label="Servicio de Comedor"
                      data={DINING_SERVICE_OPTIONS}
                      {...form.getInputProps("diningService")}
                    />
                  </SimpleGrid>
                </Stack>
              </Card>
            ) : null}

            <Stack gap="sm">
              <CTAButton type="submit" disabled={isCreating} fullWidth>
                {isCreating ? "Creando..." : "Crear usuario"}
              </CTAButton>
              <CTAButton
                type="button"
                ctaVariant="secondary"
                onClick={onClose}
                disabled={isCreating}
                fullWidth
              >
                Cancelar
              </CTAButton>
            </Stack>
          </SimpleGrid>
        </Stack>
      </form>
    </Drawer>
  );
}

