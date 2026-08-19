"use client";

import { Badge, useMantineTheme } from "@mantine/core";

import { getAdminStatusBadgeVars } from "@/components/atoms/AdminStatusBadge/AdminStatusBadge.style";

type AttendanceStatus = "presente" | "ausente" | "justificada" | "tarde" | "sin_registro";
type RequestStatusTone = "pendiente" | "en_revision" | "aprobada" | "rechazada";

const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  presente: "Presente",
  ausente: "Ausente",
  justificada: "Justificada",
  tarde: "Tarde",
  sin_registro: "Sin registro",
};

const ATTENDANCE_STATUS_TONES: Record<AttendanceStatus, RequestStatusTone> = {
  presente: "aprobada",
  tarde: "aprobada",
  ausente: "rechazada",
  justificada: "en_revision",
  sin_registro: "pendiente",
};

type AttendanceStatusBadgeProps = {
  status: AttendanceStatus;
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  const theme = useMantineTheme();
  const vars = getAdminStatusBadgeVars(theme, ATTENDANCE_STATUS_TONES[status]);

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
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>
  );
}

export default AttendanceStatusBadge;
