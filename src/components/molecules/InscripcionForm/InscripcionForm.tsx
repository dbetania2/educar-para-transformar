"use client";

import type { ReactNode } from "react";
import {
  Box,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  GridCol,
  Group,
  Progress,
  Radio,
  Stack,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

import { AppModal, CTAButton } from "@/components/atoms";
import { DniNumberInput } from "@/components/molecules/DniNumberInput/DniNumberInput";
import { useInscripcionForm } from "@/features/inscripcion/useInscripcionForm";
import type { InscripcionFormValues } from "@/features/inscripcion/useInscripcionForm";
import type { StaticData } from "@/hooks/useStaticData";
type InscripcionFormProps = StaticData["inscripcionPage"]["form"];

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Stack gap="blockGapLg">
      <Box>
        <Title order={4} size="h5" c="brand.7">
          {title}
        </Title>
        <Text size="sm" c="dimmed" mt={4}>
          {description}
        </Text>
      </Box>
      {children}
    </Stack>
  );
}

export default function InscripcionForm({
  title,
  description,
  fields,
  actions,
  modal,
  notifications: notificationCopy,
}: InscripcionFormProps) {
  const {
    opened,
    isSubmitting,
    currentStep,
    totalSteps,
    progressValue,
    finalStepAttempted,
    formCardRef,
    form,
    studentFullName,
    setOpened,
    setCurrentStep,
    handleResponsibleTypeChange,
    handleNextStep,
    handlePreviousStep,
    handleReviewRequest,
    handleConfirmSend,
  } = useInscripcionForm({ notifications: notificationCopy });

  return (
    <>
      <AppModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={modal.title}
        description={modal.description}
        size={760}
      >
        <Card withBorder radius="md" p={{ base: "cardPadCompactSm", md: "cardPadCompactLg" }}>
          <Stack gap="xs">
            <Text size="sm">
              <strong>Alumno:</strong> {studentFullName}
            </Text>
            <Text size="sm">
              <strong>{fields.studentDni.label}:</strong> {form.values.studentDni}
            </Text>
            <Text size="sm">
              <strong>{fields.level.label}:</strong> {form.values.level}
            </Text>
            <Text size="sm">
              <strong>{fields.responsibleType.label}:</strong>{" "}
              {form.values.responsibleType === "tutor"
                ? fields.responsibleType.options.tutor
                : fields.responsibleType.options.parents}
            </Text>
            {form.values.responsibleType === "tutor" ? (
              <>
                <Text size="sm">
                  <strong>{fields.tutorFullName.label}:</strong>{" "}
                  {form.values.tutorFullName}
                </Text>
                <Text size="sm">
                  <strong>{fields.tutorDni.label}:</strong>{" "}
                  {form.values.tutorDni}
                </Text>
              </>
            ) : (
              <>
                <Text size="sm">
                  <strong>{fields.fatherFullName.label}:</strong>{" "}
                  {form.values.fatherFullName}
                </Text>
                <Text size="sm">
                  <strong>{fields.fatherDni.label}:</strong> {form.values.fatherDni}
                </Text>
                <Text size="sm">
                  <strong>{fields.motherFullName.label}:</strong>{" "}
                  {form.values.motherFullName}
                </Text>
                <Text size="sm">
                  <strong>{fields.motherDni.label}:</strong> {form.values.motherDni}
                </Text>
              </>
            )}
            <Text size="sm">
              <strong>{fields.contactPhone.label}:</strong>{" "}
              {form.values.contactPhone}
            </Text>
            <Text size="sm">
              <strong>{fields.email.label}:</strong> {form.values.email}
            </Text>
          </Stack>
        </Card>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)}>
            {actions.review}
          </Button>
          <CTAButton
            icon={<IconSend size={16} />}
            onClick={handleConfirmSend}
            disabled={isSubmitting}
          >
            {actions.confirm}
          </CTAButton>
        </Group>
      </AppModal>

      <Card
        ref={formCardRef}
        withBorder
        radius="xl"
        p={{ base: "cardPadSm", md: "cardPadLg" }}
        shadow="sm"
      >
        <Stack gap="sectionGapLg">
          <Box>
            <Title order={3} c="brand.7">
              {title}
            </Title>
            <Text size="sm" c="dimmed" mt={6}>
              {description}
            </Text>
            <Text size="sm" c="dimmed" mt={10}>
              Completá los datos por bloques. Primero el alumno, después el responsable
              y por último el contacto principal.
            </Text>
          </Box>

          <form
            onSubmit={form.onSubmit(handleReviewRequest)}
            noValidate
          >
            <Stack gap="sectionGapLg">
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Badge variant="light" color="brand.6" radius="xl">
                    Paso {currentStep + 1} de {totalSteps}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {Math.round(progressValue)}% completado
                  </Text>
                </Group>
                <Progress value={progressValue} radius="xl" color="brand.6" />
              </Stack>

              <Divider />

              {currentStep === 0 && (
                <FormSection
                  title="1. Datos del alumno"
                  description="Empezá por la información principal del estudiante y el contacto."
                >
                  <Grid gutter="md">
                    <GridCol span={{ base: 12, md: 6 }}>
                      <TextInput
                        label={fields.studentFirstName.label}
                        placeholder={fields.studentFirstName.placeholder}
                        description="Como figura en su documentación."
                        withAsterisk
                        {...form.getInputProps("studentFirstName")}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <TextInput
                        label={fields.studentLastName.label}
                        placeholder={fields.studentLastName.placeholder}
                        description="Como figura en su documentación."
                        withAsterisk
                        {...form.getInputProps("studentLastName")}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <DniNumberInput
                        label={fields.studentDni.label}
                        placeholder={fields.studentDni.placeholder}
                        description="Solo números, sin puntos."
                        withAsterisk
                        value={form.values.studentDni}
                        error={form.errors.studentDni}
                        onChange={(value) => form.setFieldValue("studentDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <TextInput
                        label={fields.email.label}
                        placeholder={fields.email.placeholder}
                        description="Te escribiremos a este correo."
                        withAsterisk
                        {...form.getInputProps("email")}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label={fields.contactPhone.label}
                        placeholder={fields.contactPhone.placeholder}
                        description="Incluí característica o código de área."
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
                        onChange={(value) => form.setFieldValue("contactPhone", String(value ?? "").replace(/\D/g, "").slice(0, 15))}
                      />
                    </GridCol>
                  </Grid>
                </FormSection>
              )}

              {currentStep === 1 && (
                <FormSection
                  title="2. Nivel y responsable"
                  description="Elegí el nivel y quién completa esta solicitud."
                >
                  <Grid gutter="md">
                    <GridCol span={12}>
                      <Radio.Group
                        label={fields.level.label}
                        description="Seleccioná una única opción."
                        withAsterisk
                        {...form.getInputProps("level")}
                      >
                        <Stack mt="xs" gap="sm">
                          {fields.level.options.map((option) => (
                            <Radio key={option} value={option} label={option} />
                          ))}
                        </Stack>
                      </Radio.Group>
                    </GridCol>

                    <GridCol span={12}>
                      <Radio.Group
                        label={fields.responsibleType.label}
                        description="Mostraremos solo los campos necesarios según esta elección."
                        withAsterisk
                        value={form.values.responsibleType}
                        error={form.errors.responsibleType}
                        onChange={(value) =>
                          handleResponsibleTypeChange(
                            value as InscripcionFormValues["responsibleType"],
                          )
                        }
                      >
                        <Stack mt="xs" gap="sm">
                          <Radio
                            value="tutor"
                            label={fields.responsibleType.options.tutor}
                          />
                          <Radio
                            value="parents"
                            label={fields.responsibleType.options.parents}
                          />
                        </Stack>
                      </Radio.Group>
                    </GridCol>
                  </Grid>
                </FormSection>
              )}

              {currentStep === 2 && form.values.responsibleType === "tutor" && (
                <FormSection
                  title="3. Datos del tutor"
                  description="Completá únicamente la información del tutor responsable."
                >
                  <Grid gutter="md">
                    <GridCol span={{ base: 12, md: 6 }}>
                      <TextInput
                        label={fields.tutorFullName.label}
                        placeholder={fields.tutorFullName.placeholder}
                        description="Como figura en su documentación."
                        withAsterisk
                        {...form.getInputProps("tutorFullName")}
                        error={finalStepAttempted ? form.errors.tutorFullName : null}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <DniNumberInput
                        label={fields.tutorDni.label}
                        placeholder={fields.tutorDni.placeholder}
                        description="Solo números, sin puntos."
                        withAsterisk
                        value={form.values.tutorDni}
                        onChange={(value) => form.setFieldValue("tutorDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))}
                        error={finalStepAttempted ? form.errors.tutorDni : null}
                      />
                    </GridCol>
                  </Grid>
                </FormSection>
              )}

              {currentStep === 2 && form.values.responsibleType === "parents" && (
                <FormSection
                  title="3. Datos de la familia"
                  description="Completá los datos del padre y de la madre."
                >
                  <Grid gutter="md">
                    <GridCol span={{ base: 12, md: 6 }}>
                      <TextInput
                        label={fields.fatherFullName.label}
                        placeholder={fields.fatherFullName.placeholder}
                        description="Como figura en su documentación."
                        withAsterisk
                        {...form.getInputProps("fatherFullName")}
                        error={finalStepAttempted ? form.errors.fatherFullName : null}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <DniNumberInput
                        label={fields.fatherDni.label}
                        placeholder={fields.fatherDni.placeholder}
                        description="Solo números, sin puntos."
                        withAsterisk
                        value={form.values.fatherDni}
                        onChange={(value) => form.setFieldValue("fatherDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))}
                        error={finalStepAttempted ? form.errors.fatherDni : null}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <TextInput
                        label={fields.motherFullName.label}
                        placeholder={fields.motherFullName.placeholder}
                        description="Como figura en su documentación."
                        withAsterisk
                        {...form.getInputProps("motherFullName")}
                        error={finalStepAttempted ? form.errors.motherFullName : null}
                      />
                    </GridCol>

                    <GridCol span={{ base: 12, md: 6 }}>
                      <DniNumberInput
                        label={fields.motherDni.label}
                        placeholder={fields.motherDni.placeholder}
                        description="Solo números, sin puntos."
                        withAsterisk
                        value={form.values.motherDni}
                        onChange={(value) => form.setFieldValue("motherDni", String(value ?? "").replace(/\D/g, "").slice(0, 8))}
                        error={finalStepAttempted ? form.errors.motherDni : null}
                      />
                    </GridCol>
                  </Grid>
                </FormSection>
              )}

              <Grid gutter="md">
                <GridCol span={{ base: 12, sm: 6 }}>
                  {currentStep < totalSteps - 1 ? (
                    <CTAButton
                      type="button"
                      onClick={handleNextStep}
                      disabled={isSubmitting}
                      fullWidth
                    >
                      Continuar
                    </CTAButton>
                  ) : (
                    <CTAButton
                      type="submit"
                      icon={<IconSend size={16} />}
                      disabled={isSubmitting}
                      fullWidth
                    >
                      {actions.continue}
                    </CTAButton>
                  )}
                </GridCol>

                <GridCol span={{ base: 12, sm: 6 }}>
                  {currentStep > 0 ? (
                    <CTAButton
                      type="button"
                      ctaVariant="secondary"
                      onClick={handlePreviousStep}
                      disabled={isSubmitting}
                      fullWidth
                    >
                      Volver
                    </CTAButton>
                  ) : (
                    <CTAButton
                      type="button"
                      ctaVariant="secondary"
                      onClick={() => {
                        form.reset();
                        setCurrentStep(0);
                      }}
                      disabled={isSubmitting}
                      fullWidth
                    >
                      {actions.reset}
                    </CTAButton>
                  )}
                </GridCol>
              </Grid>
            </Stack>
          </form>
        </Stack>
      </Card>
    </>
  );
}
