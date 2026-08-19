import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  flexibleCopy: {
    minWidth: 0,
    flex: 1,
  },
  sectionAnchor: {
    scrollMarginTop: "calc(84px + var(--mantine-spacing-xl))",
  },
  email: {
    "&&": {
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing.xs,
      width: "fit-content",
      color: theme.colors.brand[7],
      lineHeight: 1.2,
      textDecoration: "none",
      transition: "color 160ms ease",
    },

    "&&:hover, &&:focus-visible, &&:active": {
      textDecoration: "underline",
      textUnderlineOffset: 3,
    },

    "&&:focus-visible": {
      outline: "2px solid " + theme.colors.brand[6],
      outlineOffset: 3,
    },

    "&& span": {
      overflowWrap: "anywhere",
    },
  },
}));