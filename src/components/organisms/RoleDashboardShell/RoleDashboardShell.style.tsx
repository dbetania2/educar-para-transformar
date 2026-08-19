import { alpha } from "@mantine/core";
import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  shell: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #f6f9fc 0%, #edf3f9 100%)",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 80,
    backgroundColor: alpha(theme.white, 0.96),
    borderBottom: `1px solid ${alpha(theme.colors.neutral[8], 0.08)}`,
    boxShadow: `0 10px 30px ${alpha(theme.colors.navy[9], 0.05)}`,
    backdropFilter: "blur(8px)",
  },
  topBarInner: {
    minHeight: 88,
    display: "flex",
    alignItems: "center",
  },
  brand: {
    color: theme.colors.brand[7],
    lineHeight: 1.1,
  },
  brandSubtle: {
    color: theme.colors.neutral[5],
  },
  content: {
    flex: 1,
    paddingBlock: theme.spacing.pagePadSm,
  },
  contentInner: {
    width: "100%",
  },
  drawerBody: {
    width: "100%",
    paddingInline: 0,
    gap: theme.spacing.md,
  },
  navPanel: {
    width: "100%",
    overflow: "hidden",
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.neutral[2]}`,
    backgroundColor: alpha(theme.white, 0.92),
    boxShadow: `0 20px 40px ${alpha(theme.colors.navy[9], 0.06)}`,
  },

  navGroup: {
    borderBottom: 0,
    "&:last-child": {
      borderBottom: 0,
    },
    "& $navButton": {
      borderBottom: 0,
    },
  },
  navChildren: {
    width: "100%",
    margin: 0,
    padding: 0,
    backgroundColor: alpha(theme.colors.brand[0], 0.78),
    borderTop: `1px solid ${alpha(theme.colors.brand[7], 0.12)}`,
    "& .mantine-List-itemWrapper, & .mantine-List-itemLabel": {
      display: "block",
      width: "100%",
    },
  },
  navChildItem: {
    width: "100%",
    margin: 0,
    padding: 0,
    "&::marker": {
      content: "none",
    },
  },
  navChildLink: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 15px 13px 62px",
    color: theme.colors.neutral[7],
    textDecoration: "none",
    fontWeight: 700,
    fontSize: theme.fontSizes.sm,
    borderTop: `1px solid ${alpha(theme.colors.neutral[8], 0.06)}`,
    backgroundColor: "transparent",
    transition: "background-color 140ms ease, color 140ms ease",
    "&:hover": {
      background: "linear-gradient(180deg, #103b66 0%, #0a2a4d 100%)",
      color: theme.white,
    },
    "&:focus, &:focus-visible": {
      outline: "none",
      boxShadow: "none",
    },
  },
  navChildLinkActive: {
    background: "linear-gradient(180deg, #103b66 0%, #0a2a4d 100%)",
    color: theme.white,
  },
  navButton: {
    display: "block",
    width: "100%",
    padding: "13px 15px",
    boxSizing: "border-box",
    textDecoration: "none",
    backgroundColor: theme.white,
    color: theme.colors.neutral[6],
    border: 0,
    borderBottom: `1px solid ${theme.colors.neutral[2]}`,
    outline: "none",
    cursor: "pointer",
    transition:
      "background-color 140ms ease, color 140ms ease, transform 140ms ease",
    "&:last-child": {
      borderBottom: 0,
    },
    "&:hover": {
      background: "linear-gradient(180deg, #103b66 0%, #0a2a4d 100%)",
      color: theme.white,
    },
    "&:hover $navChevron": {
      transform: "translateX(2px)",
      color: theme.white,
    },
    "&:hover $navIconWrap": {
      color: theme.white,
    },
    "&:focus, &:focus-visible": {
      outline: "none",
      boxShadow: "none",
    },
  },
  navButtonActive: {
    background: "linear-gradient(180deg, #103b66 0%, #0a2a4d 100%)",
    color: theme.white,
    "& $navItemTitle, & $navChevron": {
      color: theme.white,
    },
    "& $navIconWrap": {
      backgroundColor: alpha(theme.white, 0.14),
      color: theme.white,
    },
    "&:hover": {
      background: "linear-gradient(180deg, #103b66 0%, #0a2a4d 100%)",
      color: theme.white,
    },
  },
  navIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "inherit",
    transition: "color 140ms ease",
  },
  navItemTitle: {
    color: "inherit",
    lineHeight: 1.2,
  },
  logoutActions: {
    width: "100%",
    marginTop: "0.5rem",
  },
  logoutDangerButton: {
    minHeight: "56px",
    fontWeight: 700,
    boxShadow: theme.shadows.md,
  },
  navChevron: {
    color: theme.colors.neutral[4],
    flexShrink: 0,
    transition: "transform 140ms ease, color 140ms ease",
  },
  navChevronOpen: {
    transform: "rotate(180deg)",
  },
}));
