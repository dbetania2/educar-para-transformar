import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  flexibleCopy: {
    minWidth: 0,
    flex: 1,
  },
  newsCard: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    color: "inherit",
    textDecoration: "none",
    "--news-title-color": theme.colors.brand[7],
    "--news-title-decoration": "none",
    "--news-image-opacity": 1,
    "--news-image-filter": "none",
    transition: "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",

    "&:hover": {
      transform: "translateY(-2px)",
      backgroundColor: theme.colors.brand[7],
      borderColor: theme.colors.brand[7],
      boxShadow: theme.shadows.md,
      "--news-title-color": theme.white,
      "--news-title-decoration": "underline",
      "--news-image-opacity": 0.62,
      "--news-image-filter": "blur(1.5px)",
    },

  },
  newsLoadingCard: {
    overflow: "hidden",
  },
  newsLoadingImage: {
    aspectRatio: "16 / 10",
    height: "auto",
  },
  newsImageWrap: {
    aspectRatio: "16 / 10",
    backgroundColor: theme.colors.neutral[1],
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: "100%",
    backgroundPosition: "center",
    backgroundSize: "cover",
    opacity: "var(--news-image-opacity)",
    filter: "var(--news-image-filter)",
    transition: "filter 180ms ease, opacity 180ms ease",
  },
  newsImagePlaceholder: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    color: theme.colors.brand[7],
    backgroundColor: theme.colors.brand[0],
  },
  newsCardBody: {
    minWidth: 0,
    flex: 1,
  },
  newsTitle: {
    color: "var(--news-title-color)",
    fontSize: theme.fontSizes.xl,
    lineHeight: 1.25,
    overflowWrap: "break-word",
    textDecoration: "var(--news-title-decoration)",
    textUnderlineOffset: 4,
    transition: "color 180ms ease, text-decoration-color 180ms ease",
  },
}));
