export type ProfileName = {
  firstName: string;
  lastName: string;
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function splitFullName(fullName: string): ProfileName {
  const normalized = normalizeWhitespace(fullName);

  if (!normalized) {
    return {
      firstName: "Sin nombre",
      lastName: "Sin apellido",
    };
  }

  const parts = normalized.split(" ");

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: parts[0],
    };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? parts[0],
  };
}

export function buildFullName(firstName: string | null | undefined, lastName: string | null | undefined) {
  const normalized = [firstName, lastName]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeWhitespace(value))
    .join(" ")
    .trim();

  return normalized;
}

export function normalizeEmail(email: string | null | undefined) {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  return normalized.length > 0 ? normalized : null;
}
