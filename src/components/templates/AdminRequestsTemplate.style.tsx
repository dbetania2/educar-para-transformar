import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => ({
  page: {
    minHeight: 0,
  },
  hero: {
    borderRadius: theme.radius.xl,
    padding: "16px 0 2px",
  },
  heroInner: {
    alignItems: "center",
    [helpers.smallerThan("sm")]: {
      alignItems: "stretch",
    },
  },
  heroDescription: {
    marginTop: 6,
    color: theme.colors.neutral[5],
    maxWidth: 460,
  },
  filtersGrid: {
    [helpers.smallerThan("sm")]: {
      marginBottom: theme.spacing.sm,
    },
  },
  noWrap: {
    whiteSpace: "nowrap",
  },
  responsibleWrap: {
    whiteSpace: "normal",
    lineHeight: 1.35,
  },
  responsibleLine: {
    display: "block",
  },
  recordPrimary: {
    color: theme.colors.neutral[6],
  },
  recordSecondary: {
    color: theme.colors.neutral[5],
  },
  tableHeader: {
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontSize: theme.fontSizes.xs,
  },
  tableArea: {
    minHeight: 0,
    minWidth: 0,
  },
}));
