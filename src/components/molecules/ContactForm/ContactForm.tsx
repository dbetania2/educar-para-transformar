"use client";

import type { ReactNode } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  GridCol,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

import { AppModal, CTAButton } from "@/components/atoms";
import { useContactForm } from "@/features/contact/useContactForm";
import type { StaticData } from "@/hooks/useStaticData";
import { useStyles } from "./ContactForm.style";

type ContactFormProps = StaticData["contactoPage"]["quickMessageForm"];

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

export default function ContactForm({
  title,
  description,
  fields,
  actions,
  modal,
  notifications: notificationCopy,
}: ContactFormProps) {
  const { classes } = useStyles();
  const { opened, isSubmitting, form, setOpened, handleReview, handleConfirmSend } =
    useContactForm({ notifications: notificationCopy });

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
              <strong>{fields.fullName.label}:</strong> {form.values.fullName}
            </Text>
            <Text size="sm">
              <strong>{fields.email.label}:</strong> {form.values.email}
            </Text>
            <Text size="sm">
              <strong>{fields.phone.label}:</strong> {form.values.phone}
            </Text>
            <Text size="sm">
              <strong>{fields.subject.label}:</strong> {form.values.subject}
            </Text>
            <Text size="sm">
              <strong>{fields.message.label}:</strong> {form.values.message}
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

      <Card withBorder radius="xl" p={{ base: "cardPadSm", md: "cardPadLg" }} shadow="sm" h="100%">
        <Stack gap="sectionGapLg" h="100%">
          <Box>
            <Title order={3} c="brand.7">
              {title}
            </Title>
            <Text size="sm" c="dimmed" mt={6}>
              {description}
            </Text>
            <Text size="sm" c="dimmed" mt={10}>
              Organizamos el formulario en dos pasos para que sea más rápido de completar.
            </Text>
          </Box>

          <form
            onSubmit={form.onSubmit(handleReview)}
            className={classes.formRoot}
          >
            <Stack
              gap="sectionGapLg"
              justify="space-between"
              h="100%"
              className={classes.formContent}
            >
              <FormSection
                title="1. Tus datos"
                description="Así sabemos quién nos escribe y cómo responder."
              >
                <Grid gutter="md">
                  <GridCol span={{ base: 12, md: 6 }}>
                    <TextInput
                      label={fields.fullName.label}
                      placeholder={fields.fullName.placeholder}
                      description="Para identificar tu consulta."
                      withAsterisk
                      {...form.getInputProps("fullName")}
                    />
                  </GridCol>

                  <GridCol span={{ base: 12, md: 6 }}>
                    <TextInput
                      label={fields.email.label}
                      placeholder={fields.email.placeholder}
                      description="Responderemos a este correo."
                      withAsterisk
                      {...form.getInputProps("email")}
                    />
                  </GridCol>

                  <GridCol span={{ base: 12, md: 6 }}>
                    <NumberInput
                      label={fields.phone.label}
                      placeholder={fields.phone.placeholder}
                      description="Opcionalmente con código de área."
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
                      value={form.values.phone}
                      valueIsNumericString
                      withAsterisk
                      error={form.errors.phone}
                      onChange={(value) => form.setFieldValue("phone", String(value ?? "").replace(/\D/g, "").slice(0, 15))}
                    />
                  </GridCol>

                  <GridCol span={{ base: 12, md: 6 }}>
                    <TextInput
                      label={fields.subject.label}
                      placeholder={fields.subject.placeholder}
                      description="Un asunto claro acelera la respuesta."
                      withAsterisk
                      {...form.getInputProps("subject")}
                    />
                  </GridCol>
                </Grid>
              </FormSection>

              <Divider />

              <FormSection
                title="2. Tu mensaje"
                description="Contanos el contexto en pocas líneas."
              >
                <Textarea
                  label={fields.message.label}
                  placeholder={fields.message.placeholder}
                  minRows={6}
                  autosize
                  withAsterisk
                  {...form.getInputProps("message")}
                />
              </FormSection>

              <Stack gap="sm" mt={{ base: "xs", md: "md" }}>
                <CTAButton
                  type="submit"
                  icon={<IconSend size={16} />}
                  fullWidth
                  disabled={isSubmitting}
                >
                  {actions.continue}
                </CTAButton>
                <CTAButton
                  type="button"
                  ctaVariant="secondary"
                  fullWidth
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  {actions.reset}
                </CTAButton>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Card>
    </>
  );
}
