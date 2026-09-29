"use client";

import { Badge, useMantineTheme } from "@mantine/core";
import { getAdminStatusBadgeVars } from "./AdminStatusBadge.style";

type RequestStatus = "pendiente" | "en_revision" | "aprobada" | "rechazada";

const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

type AdminStatusBadgeProps = {
  status: RequestStatus;
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const theme = useMantineTheme();
  const vars = getAdminStatusBadgeVars(theme, status);

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
          minHeight: 24,
          paddingInline: 12,
          fontWeight: 600,
          textTransform: "none",
        },
        label: {
          color: "inherit",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "nowrap",
          fontSize: 13,
          lineHeight: 1.1,
          display: "flex",
          alignItems: "center",
          gap: 6,
          "&::before": {
            content: '""',
            display: "block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "currentColor",
          }
        },
      }}
    >
      {REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}

export default AdminStatusBadge;
