"use client";

import { Badge, useMantineTheme } from "@mantine/core";

export type PastelBadgeProps = {
  label: string;
  colorHex?: string;
  mantineColor?: string;
};

// Utilidad simple para convertir hex a rgb para transparencias
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "0, 0, 0";
}

export function PastelBadge({ label, colorHex, mantineColor = "blue" }: PastelBadgeProps) {
  const theme = useMantineTheme();
  
  // If hex is provided, use it. Otherwise, fallback to a Mantine color
  const baseColor = colorHex || theme.colors[mantineColor]?.[5] || "#3b82f6";
  const bgColor = `rgba(${hexToRgb(baseColor)}, 0.1)`;

  return (
    <Badge
      variant="filled"
      radius="xl"
      size="sm"
      style={{
        backgroundColor: bgColor,
        color: baseColor,
        fontWeight: 600,
        letterSpacing: "0.01em",
        width: "fit-content",
        maxWidth: "100%",
        textTransform: "none",
      }}
      styles={{
        root: {
          display: "inline-flex",
          alignItems: "center",
          minHeight: 24,
          paddingInline: 12,
        },
        label: {
          color: "inherit",
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "nowrap",
          fontSize: 13,
          lineHeight: 1.1,
        },
      }}
    >
      {label}
    </Badge>
  );
}

export default PastelBadge;
