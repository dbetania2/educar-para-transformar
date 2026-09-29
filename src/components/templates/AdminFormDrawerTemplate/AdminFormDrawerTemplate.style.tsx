import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  drawerBody: {
    padding: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "32px 32px 16px",
    position: "relative",
  },
  closeBtn: {
    color: "#64748b",
    marginTop: 6,
    "&:hover": {
      color: "#0f172a",
      backgroundColor: "transparent",
    },
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.4,
  },
  contentScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 32px 32px",
  },
  footer: {
    padding: "20px 32px",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    display: "flex",
    gap: 16,
  },
  sectionTitleBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  sectionIcon: {
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: 800,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    color: "white",
    height: 44,
    borderRadius: 24,
    fontWeight: 600,
    fontSize: 14,
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#2563eb",
    height: 44,
    borderRadius: 24,
    fontWeight: 600,
    fontSize: 14,
    border: "1px solid #bfdbfe",
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "#eff6ff",
    },
  },
  formStyles: {
    "& .mantine-InputWrapper-label": {
      fontSize: 13,
      fontWeight: 700,
      color: "#334155",
      marginBottom: 6,
    },
    "& .mantine-InputWrapper-required": {
      color: "#ef4444",
    },
    "& .mantine-Input-input": {
      borderRadius: 10,
      borderColor: "#e2e8f0",
      minHeight: 42,
      fontSize: 14,
      color: "#0f172a",
      "&::placeholder": {
        color: "#94a3b8",
      },
      "&:focus": {
        borderColor: "#2563eb",
      },
    },
  },
}));
