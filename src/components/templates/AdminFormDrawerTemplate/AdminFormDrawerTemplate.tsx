"use client";

import { ActionIcon, Box, Button, Divider, Drawer, Group, Text, UnstyledButton } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useStyles } from "./AdminFormDrawerTemplate.style";

export type AdminFormSectionProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function AdminFormSection({ title, icon, children }: AdminFormSectionProps) {
  const { classes } = useStyles();
  return (
    <Box mb="xl">
      <Box className={classes.sectionTitleBox}>
        {icon ? <Box className={classes.sectionIcon}>{icon}</Box> : null}
        <Text className={classes.sectionTitleText}>{title}</Text>
      </Box>
      <Divider color="#e2e8f0" mb="md" />
      <Box>{children}</Box>
    </Box>
  );
}

export type AdminFormDrawerTemplateProps = {
  opened: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel?: string;
  submitIcon?: ReactNode;
  cancelLabel?: string;
  isSubmitting?: boolean;
  formId?: string;
  hideFooter?: boolean;
};

export function AdminFormDrawerTemplate({
  opened,
  onClose,
  title,
  description,
  children,
  submitLabel = "Guardar",
  submitIcon,
  cancelLabel = "Cancelar",
  isSubmitting = false,
  formId,
  hideFooter = false,
}: AdminFormDrawerTemplateProps) {
  const { classes } = useStyles();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      position="right"
      size="min(100vw, 640px)"
      classNames={{ body: classes.drawerBody }}
    >
      <Box className={classes.header}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box>
            <Text fz={24} fw={800} c="#0f172a" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }} mb={6}>
              {title}
            </Text>
            {description ? <Text fz={14} c="#64748b" style={{ lineHeight: 1.4 }}>{description}</Text> : null}
          </Box>
          <ActionIcon className={classes.closeBtn} onClick={onClose} variant="transparent" size="md">
            <IconX size={20} stroke={2} />
          </ActionIcon>
        </Group>
      </Box>

      <Box className={`${classes.contentScroll} ${classes.formStyles}`}>
        {children}
      </Box>

      {!hideFooter && (
        <Box className={classes.footer}>
          <UnstyledButton className={classes.secondaryBtn} onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </UnstyledButton>
          <Button
            type={formId ? "submit" : "button"}
            form={formId}
            className={classes.primaryBtn}
            loading={isSubmitting}
            leftSection={submitIcon}
          >
            {submitLabel}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
