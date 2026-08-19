import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, { minHeight }: { minHeight: number }) => ({
  root: {
    backgroundColor: theme.white,
    borderColor: "var(--mantine-color-gray-3)",
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },

  toolbar: {
    borderBottomColor: "var(--mantine-color-gray-3)",
    backgroundColor: "var(--mantine-color-gray-0)",
  },

  content: {
    minHeight,
    padding: theme.spacing.md,
    outline: "none",

    p: {
      marginTop: 0,
      marginBottom: theme.spacing.xs,
    },

    "ul, ol": {
      marginLeft: 0,
      paddingLeft: 0,
      listStylePosition: "inside",
    },
  },
}));
