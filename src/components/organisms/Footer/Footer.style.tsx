import { alpha } from "@mantine/core";
import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => {
  const interactiveColor = theme.colors.brand ? theme.colors.brand[4] : "#4da3ff";

  return {
    footer: {
      background: "#071426",
      borderTop: `1px solid ${alpha("#ffffff", 0.08)}`,
      paddingTop: "clamp(2.5rem, 5vw, 4.25rem)",
      paddingBottom: "1.5rem",
      position: "relative",
      overflow: "hidden",
    },

    gridWrapper: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "clamp(2rem, 4vw, 3rem)",
      marginBottom: "clamp(2rem, 4vw, 3rem)",

      [helpers.largerThan("sm")]: {
        gridTemplateColumns: "repeat(2, 1fr)",
      },

      [helpers.largerThan("md")]: {
        gridTemplateColumns: "1.5fr 1fr 1.5fr",
      },
    },

    logoBlock: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing.md,
      alignItems: "center",
      textAlign: "center",

      [helpers.largerThan("md")]: {
        alignItems: "flex-start",
        textAlign: "left",
      },
    },

    logoFrame: {
      width: "clamp(90px, 9vw, 130px)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },

    logo: {
      width: "100%",
      height: "auto",
      objectFit: "contain",
      transform: "scale(1.1)",
    },

    brandDescription: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
      maxWidth: "20rem",
      fontWeight: 400,
    },

    socialGroup: {
      marginTop: "0.25rem",
    },

    socialIcon: {
      transition: "transform 200ms ease, color 200ms ease",
      "&:hover": {
        transform: "translateY(-3px)",
        color: `${interactiveColor} !important`,
      },
    },

    linksBlock: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",

      [helpers.largerThan("md")]: {
        alignItems: "flex-start",
      },
    },

    sectionTitle: {
      margin: 0, // Reseteamos los márgenes por defecto de Mantine
      marginBottom: "1.5rem", // Agregamos un buen espacio debajo (ahora sí funcionará)
      fontSize: "1.05rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
    },

    nav: {
      display: "flex",
      flexDirection: "column",
      gap: "0.85rem",
      alignItems: "center",

      [helpers.largerThan("md")]: {
        alignItems: "flex-start",
      },
    },

    link: {
      textDecoration: "none",
      fontSize: "0.95rem",
      fontWeight: 500,
      transition: "color 160ms ease, transform 160ms ease",

      "&:hover": {
        color: `${interactiveColor} !important`,
        transform: "translateY(-1px)",
      },
    },

    contactBlock: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",

      [helpers.largerThan("md")]: {
        alignItems: "flex-start",
      },
    },

    contactList: {
      alignItems: "center",

      [helpers.largerThan("md")]: {
        alignItems: "flex-start",
      },
    },

    contactIcon: {
      color: interactiveColor,
    },

    contactText: {
      fontSize: "0.95rem",
      minWidth: 0,
      overflowWrap: "anywhere",
    },

    mailLink: {
      fontSize: "0.95rem",
      textDecoration: "none",
      transition: "color 200ms ease",

      "&:hover": {
        color: `${interactiveColor} !important`,
      },
    },

    bottomBar: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${alpha("#ffffff", 0.08)}`,
      paddingTop: "1.5rem",
      gap: "0.75rem",
      textAlign: "center",

      [helpers.largerThan("sm")]: {
        flexDirection: "row",
        textAlign: "left",
      },
    },

    brandName: {
      margin: 0,
      fontSize: "1rem",
      fontWeight: 600,
    },

    legalText: {
      margin: 0,
      fontSize: "0.85rem",
    },
  };
});