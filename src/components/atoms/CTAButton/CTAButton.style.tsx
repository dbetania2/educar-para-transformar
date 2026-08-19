import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => ({
  root: {
    fontWeight: 700,
    paddingInline: "1.25rem",
    transition:
      "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, color 160ms ease",
    minWidth: 0,

    "&:hover": {
      transform: "translateY(-1px)",
    },
  },

  fullWidth: {
    width: "100%",
  },

  withIcon: {
    paddingInline: "1.35rem",
  },

  content: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.8rem",
    width: "100%",
  },

  contentLeft: {
    flexDirection: "row",
  },

  contentRight: {
    flexDirection: "row-reverse",
  },

  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    flexShrink: 0,
  },

  label: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.1,
    whiteSpace: "normal",
    textAlign: "center",
  },

  primary: {
    fontSize: "1rem",
    paddingInline: "1.5rem",
    minHeight: "56px",
    boxShadow: theme.shadows.md,
    [helpers.largerThan("md")]: {
      fontSize: "1.2rem",
      paddingInline: "3rem",
      minHeight: "68px",
    },
  },

  secondary: {
    fontSize: "1rem",
    fontWeight: 600,
    minHeight: "48px",
    color: theme.colors.brand[8],
    [helpers.largerThan("md")]: {
      fontSize: "1.15rem",
      minHeight: "68px",
    },
  },

  outline: {
    fontSize: "1rem",
    fontWeight: 600,
    minHeight: "48px",
    borderColor: theme.colors.brand[3],
    color: theme.colors.brand[7],
    backgroundColor: theme.white,
    [helpers.largerThan("md")]: {
      fontSize: "1.15rem",
      minHeight: "68px",
    },
    "&:hover, &&:hover": {
      backgroundColor: theme.colors.brand[7],
      borderColor: theme.colors.brand[7],
      color: theme.white,
      boxShadow: theme.shadows.md,
    },
    "&:hover svg, &&:hover svg": {
      color: theme.white,
      stroke: theme.white,
    },
  },
}));
