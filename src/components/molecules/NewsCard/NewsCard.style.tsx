import { createStyles } from "@mantine/emotion";


export const useStyles = createStyles((theme) => ({

  newsCard: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    color: "inherit",
    textDecoration: "none",

    transition:
      "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",

    "&:hover": {
      transform: "translateY(-2px)",
      backgroundColor: theme.colors.brand[7],
      boxShadow: theme.shadows.md,

      "--title-color": theme.white,
      "--title-decoration": "underline",
      "--image-opacity": 0.62,
    },
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

    opacity: "var(--image-opacity, 1)",

    transition: "opacity 180ms ease",
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
    minHeight: "124px",
    justifyContent: "center",
  },


  newsTitle: {
    color: "var(--title-color, var(--mantine-color-brand-7))",

    fontSize: theme.fontSizes.xl,

    lineHeight: 1.25,

    textDecoration: "var(--title-decoration, none)",
    textDecorationThickness: "1.5px",
    textUnderlineOffset: "0.18em",

    transition: "color 180ms ease, text-decoration-color 180ms ease",
  },

}));