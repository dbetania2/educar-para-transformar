import { alpha } from "@mantine/core";
import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme, _params, helpers) => ({
  shell: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "row",
    background: "#f8fafc",
  },
  desktopSidebar: {
    width: 250,
    flexShrink: 0,
    background: "linear-gradient(to top, rgba(139,92,246,0.2) 0%, rgba(239,68,68,0.15) 10%, rgba(234,179,8,0.1) 20%, rgba(16,185,129,0.05) 30%, #ffffff 50%)",
    color: "#334155",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
    zIndex: 90,
    boxShadow: "2px 0 12px rgba(0,0,0,0.12)",
    [helpers.smallerThan("md")]: {
      display: "none",
    },
  },
  sidebarHeader: {
    padding: "20px 20px 24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sidebarLogoBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarBrandTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  sidebarBrandSub: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.2,
  },
  sidebarNav: {
    flex: 1,
    padding: "0 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflowY: "auto",
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 14px",
    borderRadius: 10,
    color: "#64748b",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 500,
    transition: "all 140ms ease",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    width: "100%",
    position: "relative",
    "&:hover": {
      backgroundColor: "#f8fafc",
      color: "#0f172a",
    },
  },
  sidebarItemActive: {
    backgroundColor: "#f0f9ff !important",
    color: "#0284c7 !important",
    fontWeight: 600,
    "&::after": {
      content: '""',
      position: "absolute",
      right: -12,
      top: 6,
      bottom: 6,
      width: 4,
      backgroundColor: "#0ea5e9",
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
    }
  },
  sidebarFooter: {
    padding: 16,
    borderTop: "1px solid #e2e8f0",
  },
  sidebarLogoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    color: "#64748b",
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 140ms ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      color: "#dc2626",
    },
  },
  mainArea: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 80,
    backgroundColor: theme.white,
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
  },
  topBarInner: {
    minHeight: 64,
    display: "flex",
    alignItems: "center",
  },
  burgerMobile: {
    [helpers.largerThan("md")]: {
      display: "none",
    },
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
    paddingBlock: theme.spacing.lg,
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
