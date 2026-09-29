"use client";

import type { MantineTheme } from "@mantine/core";

type RequestStatus = "pendiente" | "en_revision" | "aprobada" | "rechazada";

type AdminStatusBadgeVars = {
  "--badge-bg": string;
  "--badge-color": string;
  "--badge-bd": string;
};

export function getAdminStatusBadgeVars(
  theme: MantineTheme,
  status: RequestStatus,
): AdminStatusBadgeVars {
  let palette = theme.colors.adminPending;

  switch (status) {
    case "en_revision":
      palette = theme.colors.adminReview;
      break;
    case "aprobada":
      palette = theme.colors.adminSuccess;
      break;
    case "rechazada":
      palette = theme.colors.adminDanger;
      break;
    case "pendiente":
    default:
      palette = theme.colors.adminPending;
      break;
  }

  return {
    "--badge-bg": `rgba(${hexToRgb(palette[6])}, 0.1)`,
    "--badge-color": palette[7],
    "--badge-bd": "transparent",
  };
}

// Utilidad simple para convertir hex a rgb para transparencias
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "0, 0, 0";
}
