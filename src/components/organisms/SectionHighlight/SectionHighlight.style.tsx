import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => ({
  sectionCard: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: theme.white,
    borderColor: "rgba(16, 59, 102, 0.06)", // Borde ultra sutil tintado
    borderRadius: "32px", // Radio moderno y amplio
    
    // Sombra tintada con el color brand principal en lugar de gris genérico
    boxShadow: "0 10px 40px -10px rgba(16, 59, 102, 0.08)",
    
    // Transición elástica usando cubic-bezier
    transition: "transform 400ms cubic-bezier(0.3, 0.7, 0.4, 1), box-shadow 400ms cubic-bezier(0.3, 0.7, 0.4, 1)",
    
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 20px 40px -15px rgba(16, 59, 102, 0.15)",
    },
    
    // Micro-interacción: Zoom + sutil rotación para un efecto premium
    "&:hover img": {
      transform: "scale(1.08) rotate(-1deg)",
    },
  },

  layout: {
    minHeight: 480, // Ligeramente más alto para respirar mejor
  },

  content: {
    flex: 1,
    padding: "clamp(3rem, 6vw, 5rem)",
    display: "flex",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    
    // Destello de luz radial en el fondo del texto
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background: `radial-gradient(circle at 50% 50%, ${theme.colors.brand[0]} 0%, transparent 60%)`,
      opacity: 0.7,
      zIndex: -1,
      pointerEvents: "none",
    }
  },

  badge: {
    fontWeight: 800,
    letterSpacing: "0.05em",
    boxShadow: `0 4px 14px ${theme.colors.brand[1]}`, // Resplandor en el badge
    border: `1px solid ${theme.colors.brand[2]}`,
  },

  title: {
    fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    // Gradiente de color para el título
    background: `linear-gradient(135deg, ${theme.colors.brand[9]} 0%, ${theme.colors.brand[6]} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.25rem",
  },

  description: {
    fontSize: "1.125rem",
    lineHeight: 1.7,
    maxWidth: 500,
    color: theme.colors.neutral[6],
    fontWeight: 400,
  },

  imageContainer: {
    position: "relative",
    width: "48%",
    minHeight: 480,
    overflow: "hidden",
    // Curva más profunda (160px) para un look más orgánico
    borderRadius: "160px 0 0 160px",
    
    // Sombra interna para dar profundidad entre el texto y la imagen
    boxShadow: "inset 15px 0 30px rgba(16, 59, 102, 0.04)",

    [helpers.smallerThan("md")]: {
      width: "100%",
      minHeight: 340, 
      borderRadius: "0 0 32px 32px", // Coincide con el radio inferior de la tarjeta
      boxShadow: "inset 0 15px 30px rgba(16, 59, 102, 0.04)",
    },
  },

  reverseImage: {
    borderRadius: "0 160px 160px 0",
    boxShadow: "inset -15px 0 30px rgba(16, 59, 102, 0.04)",

    [helpers.smallerThan("md")]: {
      borderRadius: "0 0 32px 32px",
      boxShadow: "inset 0 15px 30px rgba(16, 59, 102, 0.04)",
    },
  },

  image: {
    objectFit: "cover",
    // Transición suave coincidiendo con el cubic-bezier del hover
    transition: "transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  },

}));