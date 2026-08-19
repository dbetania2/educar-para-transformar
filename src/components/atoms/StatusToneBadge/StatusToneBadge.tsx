"use client";

import { Badge, useMantineTheme } from "@mantine/core";

import { getAdminStatusBadgeVars } from "@/components/atoms/AdminStatusBadge/AdminStatusBadge.style";

type StatusTone = "pending" | "review" | "success" | "danger";
type RequestStatusTone = "pendiente" | "en_revision" | "aprobada" | "rechazada";

type StatusToneBadgeProps = {
  children: string;
  tone: StatusTone;
};

const TONE_TO_REQUEST_STATUS: Record<StatusTone, RequestStatusTone> = {
  pending: "pendiente",
  review: "en_revision",
  success: "aprobada",
  danger: "rechazada",
};

export function StatusToneBadge({ children, tone }: StatusToneBadgeProps) {
  const theme = useMantineTheme();
  const vars = getAdminStatusBadgeVars(theme, TONE_TO_REQUEST_STATUS[tone]);

  return (
    <Badge
      variant="filled"
      radius="xl"
      size="sm"
      style={{
        ...vars,
        width: "fit-content",
        maxWidth: "100%",
        fontWeight: 700,
        letterSpacing: "0.01em",
      }}
      styles={{
        root: {
          display: "inline-flex",
          alignItems: "center",
          minHeight: 22,
          paddingInline: 10,
        },
        label: {
          color: "inherit",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "nowrap",
          fontSize: 11,
          lineHeight: 1.1,
        },
      }}
    >
      {children}
    </Badge>
  );
}

export default StatusToneBadge;
