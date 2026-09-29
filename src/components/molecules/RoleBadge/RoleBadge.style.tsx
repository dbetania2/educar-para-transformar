import { createStyles } from "@mantine/emotion";

export const useStyles = createStyles((theme) => ({
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  badgeAdmin: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },
  badgeTutor: {
    backgroundColor: "#f3e8ff",
    color: "#7e22ce",
    border: "1px solid #e9d5ff",
  },
  badgeDocente: {
    backgroundColor: "#e6fffa",
    color: "#0d9488",
    border: "1px solid #99f6e4",
  },
  badgeAlumno: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
    border: "1px solid #fde68a",
  },
  badgeNoDocente: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
  },
}));
