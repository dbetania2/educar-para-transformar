import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  root: {
    width: "100%",
    padding: "clamp(1.5rem, 3vw, 2rem)",
    borderRadius: theme.radius.md,
    backgroundColor: "#1D3980", 
    boxShadow: theme.shadows.sm,

    // Responsividad: Cambiamos todo a columna centrada en móviles
    "@media (max-width: 48em)": {
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing.xl,
    },
  },
  contentGroup: {
    flex: 1,
    flexWrap: "nowrap", // Evita que en tabletas el ícono se separe del texto

    // Responsividad: Apila el ícono sobre los textos
    "@media (max-width: 48em)": {
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
  },
  textStack: {
    // Responsividad: Centra el texto dentro de su contenedor
    "@media (max-width: 48em)": {
      alignItems: "center",
    },
  },
  iconContainer: {
    flexShrink: 0,
    backgroundColor: theme.white,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "clamp(1.2rem, 2vw, 1.4rem)",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
    fontWeight: 400,
  },
  button: {
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 200ms ease, box-shadow 200ms ease",
    
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    },

    "@media (max-width: 48em)": {
      width: "100%", // El botón ocupa todo el ancho disponible en móvil
    },
  },
}));