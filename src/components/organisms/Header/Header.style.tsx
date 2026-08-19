import { alpha } from "@mantine/core";
import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => {
  const interactiveColor = theme.colors.blue[7];
  const navLinkBase = {
    color: theme.colors.neutral[6],
    textTransform: "none" as const,
    letterSpacing: 0,
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: 500,
    transition: "color 160ms ease, text-decoration-color 160ms ease",
  };

  return {
    header: {
      borderBottom: `1px solid ${alpha(theme.colors.neutral[8], 0.08)}`,
      boxShadow: `0 10px 30px ${alpha(theme.colors.navy[9], 0.08)}`,
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: theme.colors.neutral[0],
      minHeight: "88px",
    },
    logoLink: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    logoFrame: {
      width: "clamp(112px, 11vw, 138px)",
      height: "clamp(72px, 6.6vw, 86px)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
    },
    logoImage: {
      display: "block",
      width: "100%",
      height: "100%",
      objectFit: "contain",
      transform: "scale(1.22)",
      transformOrigin: "center",
    },
    navList: {
      display: "flex",
      gap: "1.9rem",
      margin: 0,
      padding: 0,
    },
    navLink: {
      ...navLinkBase,
      textTransform: "uppercase" as const,
      "&:hover": {
        color: interactiveColor,
      },
    },
    navLinkActive: {
      color: interactiveColor,
    },
    navLinkEmphasis: {
      fontWeight: 700,
      color: theme.colors.neutral[7],
    },
    navLinkEmphasisActive: {
      color: interactiveColor,
    },
    navLinkMobile: {
      ...navLinkBase,
      fontSize: "0.95rem",
      display: "inline-flex",
      alignItems: "center",
      width: "100%",
      minHeight: "44px",
      paddingBlock: "0.3rem",
      minWidth: 0,
      textTransform: "uppercase" as const,
      "&:hover": {
        color: interactiveColor,
        textDecoration: "underline",
        textDecorationThickness: "1.5px",
        textUnderlineOffset: "0.24em",
      },
    },
    drawerList: {
      display: "grid",
      gap: "0.85rem",
      margin: 0,
      padding: 0,
    },
    accessLink: {
      display: "inline-flex",
      textDecoration: "none",
    },
    mobileAccessLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      width: "100%",
      minHeight: "44px",
      marginTop: "0.35rem",
      minWidth: 0,
      textDecoration: "none",
    },
    desktopAccessLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.95rem",
      textDecoration: "none",
      color: theme.colors.neutral[6],
    },
    desktopAccessButton: {
      minWidth: "154px",
      paddingInline: "1.35rem",
      height: "46px",
      fontWeight: 600,
      transition:
        "transform 160ms ease, background-color 160ms ease, color 160ms ease",
      "&:hover": {
        transform: "translateY(-1px)",
      },
    },
    accessLabel: {
      display: "inline-flex",
      alignItems: "center",
      color: theme.colors.neutral[6],
      textTransform: "none" as const,
      textDecoration: "none",
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1,
      "&:hover": {
        color: interactiveColor,
        textDecoration: "underline",
      },
    },
    mobileAccessIcon: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
      color: interactiveColor,
      backgroundColor: alpha(interactiveColor, 0.08),
      borderRadius: theme.radius.md,
      transition:
        "transform 160ms ease, background-color 160ms ease, color 160ms ease",
      "&:hover": {
        transform: "translateY(-1px) scale(1.04)",
        color: interactiveColor,
        backgroundColor: alpha(interactiveColor, 0.14),
      },
    },
    desktopAccessIcon: {
      width: "60px",
      height: "59px",

      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.colors.neutral[6],

      backgroundColor: "transparent",
      transition:
        "transform 160ms ease, background-color 160ms ease, color 160ms ease",
      "&:hover": {
        color: interactiveColor,
        backgroundColor: alpha(interactiveColor, 0.08),
        transform: "translateY(-1px)",
      },
    },
    burgerRoot: {
      "--burger-color": theme.colors.neutral[6],
      color: theme.colors.neutral[6],
      minWidth: "44px",
      minHeight: "44px",
      transition:
        "color 160ms ease, background-color 160ms ease, transform 160ms ease",
      borderRadius: theme.radius.sm,
      "&:hover": {
        "--burger-color": interactiveColor,
        color: interactiveColor,
        backgroundColor: alpha(interactiveColor, 0.08),
      },
    },
    burgerLine: {
      color: theme.colors.neutral[6],
      transition: "color 160ms ease, background-color 160ms ease",
      ".mantine-UnstyledButton-root:hover &": {
        color: interactiveColor,
      },
    },
    desktopOnly: {
      [helpers.smallerThan("md")]: {
        display: "none",
      },
    },
  };
});
