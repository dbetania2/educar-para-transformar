import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => ({
  page: {
    minHeight: 0,
  },
  filtersGrid: {
    [helpers.smallerThan("sm")]: {
      marginBottom: theme.spacing.sm,
    },
  },
  userPrimary: {
    color: theme.colors.neutral[6],
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
  userSecondary: {
    color: theme.colors.neutral[5],
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
  tableHeader: {
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontSize: theme.fontSizes.xs,
  },
  detailCard: {
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: theme.white,
    borderColor: "rgba(16, 59, 102, 0.10)",
  },
  infoLabel: {
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontSize: theme.fontSizes.xs,
    fontWeight: 700,
    color: theme.colors.neutral[5],
    overflowWrap: "anywhere",
  },
  infoValue: {
    color: theme.colors.neutral[6],
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
}));
