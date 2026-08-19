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
    "--badge-bg": palette[7],
    "--badge-color": theme.white,
    "--badge-bd": `1px solid ${palette[8]}`,
  };
}
