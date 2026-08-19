import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  flexibleCopy: {
    minWidth: 0,
    flex: 1,
  },
  roundedHighlight: {
    borderRadius: 20,
  },
  sectionAnchor: {
    scrollMarginTop: "calc(84px + var(--mantine-spacing-xl))",
  },
  levelsAnchor: {
    scrollMarginTop: "calc(84px + var(--mantine-spacing-xl) * 2.5)",
  },
  galleryCarouselViewport: {
    paddingBottom: "1.75rem",
  },
  galleryButton: {
    display: "block",
    width: "100%",
    height: "100%",
    color: "inherit",
    borderRadius: theme.radius.lg,
    overflow: "hidden",

    "&:focus-visible": {
      outline: "2px solid " + theme.colors.brand[6],
      outlineOffset: 3,
    },
  },
  galleryImageFrame: {
    position: "relative",
    aspectRatio: "16 / 10",
    width: "100%",
    overflow: "hidden",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.neutral[1],

    "&::after": {
      content: "\"\"",
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(0,0,0,0.66) 100%)",
      opacity: 0.88,
      transition: "opacity 180ms ease",
    },

    "&:hover img": {
      transform: "scale(1.035)",
    },

    "&:hover::after": {
      opacity: 1,
    },
  },
  galleryImage: {
    objectFit: "cover",
    transition: "transform 220ms ease",
  },
  galleryImageLabel: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    zIndex: 1,
    color: theme.white,
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    lineHeight: 1.2,
    textShadow: "0 1px 8px rgba(0,0,0,0.38)",
    overflowWrap: "break-word",
  },
  galleryModalContent: {
    width: "auto",
    maxWidth: "96vw",
    maxHeight: "96dvh",
    overflow: "hidden",
    background: "transparent",
    boxShadow: "none",
  },
  galleryModalBody: {
    padding: 0,
    overflow: "hidden",
  },
  galleryModalCarousel: {
    width: "min(96vw, 1280px)",
    maxHeight: "96dvh",
    overflow: "hidden",
  },
  galleryModalCarouselViewport: {
    maxHeight: "96dvh",
    overflow: "hidden",
  },
  galleryModalSlide: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    maxHeight: "96dvh",
    overflow: "hidden",
  },
  galleryModalImage: {
    display: "block",
    width: "auto",
    maxWidth: "96vw",
    maxHeight: "96dvh",
    height: "auto",
    objectFit: "contain",
  },
}));
