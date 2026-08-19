"use client";

import type { ComponentProps, ReactNode } from "react";
import { Modal, Stack, Text, type ModalProps } from "@mantine/core";
import { CTAButton } from "@/components/atoms";
import { useStyles } from "./AppModal.style";

type AppModalActionProps = Omit<ComponentProps<"button">, "children"> & {
  label: ReactNode;
  fullWidth?: boolean;
};

type AppModalLayout = "default" | "form" | "confirm";

type AppModalProps = Omit<ModalProps, "children" | "title"> & {
  title: string;
  description?: string;
  children: React.ReactNode;
  layout?: AppModalLayout;
  footer?: ReactNode;
  primaryAction?: AppModalActionProps;
  secondaryAction?: AppModalActionProps;
  actionsLayout?: "inline" | "stacked";
  actionsFullWidth?: boolean;
};

export function AppModal({
  title,
  description,
  children,
  layout = "default",
  footer,
  primaryAction,
  secondaryAction,
  actionsLayout,
  actionsFullWidth,
  size = 680,
  ...props
}: AppModalProps) {
  const resolvedActionsLayout =
    actionsLayout ?? (layout === "form" ? "stacked" : "inline");
  const resolvedActionsFullWidth =
    actionsFullWidth ?? layout === "form";
  const { classes, cx } = useStyles({
    actionsLayout: resolvedActionsLayout,
    actionsFullWidth: resolvedActionsFullWidth,
  });

  const primaryButton = primaryAction ? (
    <CTAButton
      key="app-modal-primary-action"
      {...primaryAction}
      ctaVariant="primary"
      fullWidth={resolvedActionsFullWidth || primaryAction.fullWidth}
    >
      {primaryAction.label}
    </CTAButton>
  ) : null;

  const secondaryButton = secondaryAction ? (
    <CTAButton
      key="app-modal-secondary-action"
      ctaVariant="secondary"
      {...secondaryAction}
      fullWidth={resolvedActionsFullWidth || secondaryAction.fullWidth}
    >
      {secondaryAction.label}
    </CTAButton>
  ) : null;

  const orderedGeneratedFooter =
    resolvedActionsLayout === "stacked"
      ? [primaryButton, secondaryButton]
      : [secondaryButton, primaryButton];

  const hasGeneratedFooter = Boolean(primaryAction || secondaryAction);
  const footerContent =
    footer ??
    (hasGeneratedFooter ? <>{orderedGeneratedFooter}</> : null);

  return (
    <Modal {...props} title={title} size={size}>
      <Stack gap="sectionGapSm" className={classes.contentStack}>
        {description ? (
          <Text size="sm" c="dimmed" className={classes.descriptionText}>
            {description}
          </Text>
        ) : null}
        {children}
        {footerContent ? (
          <div
            className={cx(
              classes.footer,
              resolvedActionsLayout === "stacked"
                ? classes.footerStacked
                : classes.footerInline,
              resolvedActionsFullWidth && classes.footerFullWidth,
            )}
          >
            {footerContent}
          </div>
        ) : null}
      </Stack>
    </Modal>
  );
}

export default AppModal;
