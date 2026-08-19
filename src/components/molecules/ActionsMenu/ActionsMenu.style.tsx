import { alpha } from "@mantine/core";
import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  trigger: {
    flexShrink: 0,
    fontWeight: 700,
  },
  dropdown: {
    minWidth: 220,
    padding: 6,
    borderRadius: theme.radius.lg,
    backgroundColor: alpha(theme.white, 0.98),
    borderColor: alpha(theme.colors.neutral[8], 0.08),
    boxShadow: `0 18px 36px ${alpha(theme.colors.navy[9], 0.08)}`,
  },
  item: {
    minHeight: 46,
    paddingInline: 12,
    borderRadius: theme.radius.md,
    fontWeight: 600,
    color: theme.colors.neutral[7],
    transition: "background-color 140ms ease, color 140ms ease",
    "&:hover": {
      background: "linear-gradient(180deg, #103b66 0%, #0a2a4d 100%)",
      color: theme.white,
    },
    "& [data-position='left']": {
      color: "inherit",
    },
  },
  itemDanger: {
    color: theme.colors.red[8],
    "&:hover": {
      background: `linear-gradient(180deg, ${theme.colors.red[7]} 0%, ${theme.colors.red[9]} 100%)`,
      color: theme.white,
    },
  },
}));
