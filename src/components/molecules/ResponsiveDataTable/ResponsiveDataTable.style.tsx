import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  cell: {
    minWidth: 0,
    verticalAlign: "top",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    paddingBlock: theme.spacing.cardPadDenseLg,
  },
  noWrap: {
    whiteSpace: "nowrap",
    overflowWrap: "normal",
  },
  emptyCell: {
    textAlign: "center",
    color: "var(--mantine-color-dimmed)",
    paddingBlock: "var(--mantine-spacing-lg)",
  },
  table: {
    backgroundColor: theme.white,
    overflow: "hidden",
  },
  headCell: {
    paddingBlock: theme.spacing.cardPadCompactSm,
  },
  row: {
    transition: "background-color 140ms ease",
  },
}));
