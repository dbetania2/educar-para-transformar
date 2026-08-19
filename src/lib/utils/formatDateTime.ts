export function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
