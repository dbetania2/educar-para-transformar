import { alpha } from "@mantine/core";
import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  footer: {
    background: "#071426",
    color: theme.white,
    borderTop: `1px solid ${alpha("#ffffff", 0.08)}`,
  },
  footerInner: {
    paddingBlock: "clamp(1rem, 2.4vw, 1.4rem)",
  },
  footerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    flexWrap: "wrap",
  },
  footerTitle: {
    margin: 0,
    color: theme.white,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  footerText: {
    margin: 0,
    color: alpha(theme.white, 0.82),
    lineHeight: 1.45,
  },
  footerMeta: {
    color: alpha(theme.white, 0.92),
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
}));
