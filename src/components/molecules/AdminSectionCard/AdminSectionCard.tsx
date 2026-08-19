"use client";

import { Box, Card, Group, LoadingOverlay, Stack, Text, Title } from "@mantine/core";
import { CTAButton } from "@/components/atoms";

type AdminSectionCardProps = {
  style?: React.CSSProperties;
  title?: string;
  description?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  actionSlot?: React.ReactNode;
  compact?: boolean;
  overlayVisible?: boolean;
};

export function AdminSectionCard({
  style,
  title,
  description,
  children,
  actionLabel,
  onAction,
  actionLoading = false,
  actionSlot,
  compact = false,
  overlayVisible = false,
}: AdminSectionCardProps) {
  const hasHeader = Boolean(title || description || actionSlot || (actionLabel && onAction));

  return (
    <Card
      withBorder
      radius="md"
      style={{
        ...style,
        borderColor: "rgba(16, 59, 102, 0.10)",
        boxShadow: "none",
      }}
      p={{
        base: compact ? "cardPadCompactSm" : "cardPadCompactLg",
        md: compact ? "cardPadCompactLg" : "cardPadSm",
      }}
      bg="white"
    >
      <Stack gap={compact ? "sm" : "sectionGapSm"}>
        {hasHeader ? (
          <Group justify="space-between" align="flex-end" gap="sm">
            <Box>
              {title ? (
                <Title order={4} c="brand.7">
                  {title}
                </Title>
              ) : null}
              {description ? (
                <Text size="sm" c="dimmed" mt={title ? 2 : 0}>
                  {description}
                </Text>
              ) : null}
            </Box>

            {actionSlot ??
              (actionLabel && onAction ? (
                <CTAButton
                  type="button"
                  ctaVariant="secondary"
                  onClick={onAction}
                  disabled={actionLoading}
                >
                  {actionLabel}
                </CTAButton>
              ) : null)}
          </Group>
        ) : null}

        <Box pos="relative">
          <LoadingOverlay visible={overlayVisible} zIndex={2} overlayProps={{ blur: 1 }} />
          {children}
        </Box>
      </Stack>
    </Card>
  );
}

export default AdminSectionCard;
