import { createStyles } from "@mantine/emotion";

type AppModalStylesParams = {
  actionsLayout: "inline" | "stacked";
  actionsFullWidth: boolean;
};

export const useStyles = createStyles(
  (_theme, { actionsLayout, actionsFullWidth }: AppModalStylesParams) => ({
    contentStack: {
      minWidth: 0,
    },
    descriptionText: {
      maxWidth: "68ch",
    },
    footer: {
      width: "100%",
      display: "grid",
      justifyItems: actionsLayout === "stacked" ? "stretch" : "end",
      gap: actionsLayout === "stacked" ? "0.75rem" : "0.875rem",
    },
    footerInline: {
      gridAutoFlow: "column",
      gridAutoColumns: actionsFullWidth ? "minmax(0, 1fr)" : "max-content",
      alignItems: "center",
    },
    footerStacked: {
      gridAutoFlow: "row",
    },
    footerFullWidth: {
      "& > *": {
        width: "100%",
      },
    },
  }),
);
