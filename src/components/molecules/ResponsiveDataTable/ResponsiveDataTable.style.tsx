import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  cell: {
    minWidth: 0,
    verticalAlign: "middle",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
  },
  noWrap: {
    whiteSpace: "nowrap",
    overflowWrap: "normal",
  },
  emptyCell: {
    textAlign: "center",
    color: "#94a3b8",
    paddingBlock: "var(--mantine-spacing-xl)",
  },
  table: {
    backgroundColor: theme.white,
    borderCollapse: "collapse",
  },
  headCell: {
    padding: "16px 20px !important",
    backgroundColor: "#f8fafc !important",
    color: "#64748b !important",
    textTransform: "uppercase",
    fontSize: "11px !important",
    letterSpacing: "0.08em",
    fontWeight: "700 !important",
    borderBottom: "1px solid #e2e8f0 !important",
  },
  row: {
    transition: "background-color 140ms ease",
    "&:hover": {
      backgroundColor: "#f8fafc !important",
    },
  },
}));
