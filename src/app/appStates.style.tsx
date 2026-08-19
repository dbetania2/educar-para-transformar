import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  centerViewport: {
    height: "100vh",
    width: "100%",
  },
  codeBlock: {
    maxWidth: "100%",
  },
  notFoundCode: {
    fontSize: 120,
    fontWeight: 900,
    color: theme.colors.brand[7],
    opacity: 0.38,
  },
}));
