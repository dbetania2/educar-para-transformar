import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => ({
  root: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    background: theme.colors.brand[0],
    minHeight: "92vh",
    display: "flex",
    alignItems: "center",
    paddingBlock: "clamp(3.5rem, 8vw, 8rem)",
  },

  grid: {
    // 1. Usamos flexbox en móvil para poder invertir el orden
    display: "flex",
    flexDirection: "column-reverse", 
    alignItems: "center",
    gap: "2rem",

    [helpers.largerThan("md")]: {
      // 2. En pantallas grandes, volvemos a usar Grid normal
      display: "grid",
      gap: "5rem",
      gridTemplateColumns: "minmax(0, 1.2fr) minmax(400px, 1fr)",
    },
  },

  leftColumn: {
    maxWidth: 760,
    zIndex: 2,
    gap: theme.spacing.blockGapLg,
    
    // 3. Centrado en móviles
    alignItems: "center",
    textAlign: "center",

    [helpers.largerThan("md")]: {
      gap: "3rem",
      // 4. Alineación a la izquierda en pantallas grandes
      alignItems: "flex-start",
      textAlign: "left",
    },
  },

  badge: {
    width: "fit-content",
    textTransform: "none",
    fontWeight: 700,
    paddingRight: 14,
    letterSpacing: "0.5px",
  },

  title: {
    maxWidth: "100%",
    lineHeight: 1.1,
    marginBottom: "0.5rem",
    fontSize: "clamp(1.9rem, 2.6vw, 2.6rem)",
    fontWeight: 750,
    letterSpacing: "-0.02em",
  },

  description: {
    fontSize: "clamp(1.15rem, 1.8vw, 1.7rem)",
    lineHeight: 1.5,
    color: theme.colors.brand[8],
    fontWeight: 500,
    maxWidth: "100%",
  },

  secondaryText: {
    fontSize: "clamp(1.05rem, 1.3vw, 1.3rem)",
    lineHeight: 1.65,
    color: theme.colors.gray[7],
    maxWidth: "100%",
    marginTop: "0.5rem",
  },

  actions: {
    marginTop: theme.spacing.xxs,
    gap: theme.spacing.xxs,
    width: "100%", // Asegura que los botones ocupen el espacio necesario

    [helpers.smallerThan("md")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    [helpers.largerThan("md")]: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.xs,
      width: "auto",
    },
  },

  primaryButton: {
    minWidth: 0,
    [helpers.smallerThan("md")]: {
      width: "100%",
    },
  },

  secondaryButton: {
    minWidth: 0,
    [helpers.smallerThan("md")]: {
      width: "100%",
    },
  },

  visualWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",

    [helpers.smallerThan("md")]: {
      marginTop: theme.spacing.xxs,
      marginBottom: "1rem", // Da aire entre la imagen (ahora arriba) y el badge
    },
  },

  heroImage: {
    width: "130%",
    maxWidth: "850px",
    height: "auto",
    objectFit: "contain",
    display: "block",
    
    [helpers.smallerThan("md")]: {
      width: "100%",
      maxWidth: "420px",
    },
  },
}));