export type SportDefinition = {
  id: string;
  name: string;
  schedule: string;
  defaultTeacherIndex: number;
};

export const SPORTS_CATALOG: SportDefinition[] = [
  {
    id: "futbol",
    name: "Fútbol",
    schedule: "Lunes y Miércoles 16:00 a 17:30",
    defaultTeacherIndex: 0,
  },
  {
    id: "basquet",
    name: "Básquet",
    schedule: "Martes y Jueves 16:00 a 17:30",
    defaultTeacherIndex: 1,
  },
  {
    id: "voley",
    name: "Vóley",
    schedule: "Lunes y Miércoles 17:30 a 19:00",
    defaultTeacherIndex: 2,
  },
  {
    id: "hockey",
    name: "Hockey",
    schedule: "Martes y Jueves 17:30 a 19:00",
    defaultTeacherIndex: 3,
  },
  {
    id: "natacion",
    name: "Natación",
    schedule: "Viernes 15:00 a 16:30",
    defaultTeacherIndex: 4,
  },
  {
    id: "atletismo",
    name: "Atletismo",
    schedule: "Viernes 16:30 a 18:00",
    defaultTeacherIndex: 5,
  },
  {
    id: "handball",
    name: "Handball",
    schedule: "Lunes y Miércoles 16:00 a 17:30",
    defaultTeacherIndex: 6,
  },
  {
    id: "gimnasia",
    name: "Gimnasia Artística",
    schedule: "Martes y Jueves 16:00 a 17:30",
    defaultTeacherIndex: 7,
  },
];

export const SPORT_OPTIONS = SPORTS_CATALOG.map((sport) => ({
  value: sport.name,
  label: `${sport.name} (${sport.schedule})`,
}));

export const TRANSPORT_ROUTES = [
  "Recorrido 1 - Zona Norte",
  "Recorrido 2 - Zona Sur",
  "Recorrido 3 - Zona Este",
  "Recorrido 4 - Zona Oeste",
] as const;

export const TRANSPORT_ROUTE_OPTIONS = [
  { value: "No Registrado", label: "No Registrado (Sin transporte)" },
  ...TRANSPORT_ROUTES.map((route) => ({ value: route, label: route })),
];

export const DINING_SERVICE_OPTIONS = [
  { value: "No Registrado", label: "No Registrado (Sin comedor)" },
  { value: "Comedor General", label: "Comedor General" },
  {
    value: "Menú Especial (Celíaco / Vegetariano)",
    label: "Menú Especial (Celíaco / Vegetariano)",
  },
];

export function getSportDefinitionByName(name: string): SportDefinition | undefined {
  return SPORTS_CATALOG.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase(),
  );
}

/**
 * REQ-ADM-01.3: Valida máximo 2 deportes por alumno y que no exista choque de horarios.
 */
export function validateStudentSports(sportNames: string[]): string | null {
  const uniqueSports = Array.from(new Set(sportNames.map((s) => s.trim()).filter(Boolean)));

  if (uniqueSports.length > 2) {
    return "El alumno puede inscribirse como máximo en 2 disciplinas deportivas.";
  }

  const seenSchedules = new Map<string, string>();

  for (const sportName of uniqueSports) {
    const def = getSportDefinitionByName(sportName);
    if (!def) {
      return `La disciplina "${sportName}" no pertenece al catálogo oficial de deportes.`;
    }

    const conflictingSport = seenSchedules.get(def.schedule);
    if (conflictingSport) {
      return `Conflicto de horario detectado entre ${conflictingSport} y ${def.name} (${def.schedule}).`;
    }

    seenSchedules.set(def.schedule, def.name);
  }

  return null;
}

/**
 * Obtiene los servicios extracurriculares de un alumno desde auth.users.user_metadata,
 * o asigna valores determinísticos basados en su legajo para los datos semilla demo.
 */
export function resolveStudentExtracurricular(params: {
  studentCode: string;
  userMetadata?: Record<string, unknown> | null;
}): {
  sports: Array<{ name: string; schedule: string }>;
  transportRoute: string;
  diningService: string;
} {
  const { studentCode, userMetadata } = params;

  const hasExplicitMetadata =
    userMetadata &&
    (Array.isArray(userMetadata.sports) ||
      typeof userMetadata.transport_route === "string" ||
      typeof userMetadata.dining_service === "string");

  if (hasExplicitMetadata) {
    const rawSports = Array.isArray(userMetadata?.sports)
      ? userMetadata.sports.filter((s): s is string => typeof s === "string")
      : [];
    const sports = rawSports
      .map((name) => {
        const def = getSportDefinitionByName(name);
        return def ? { name: def.name, schedule: def.schedule } : null;
      })
      .filter((item): item is { name: string; schedule: string } => item !== null)
      .slice(0, 2);

    const transportRoute =
      typeof userMetadata?.transport_route === "string" &&
      userMetadata.transport_route.trim().length > 0
        ? userMetadata.transport_route.trim()
        : "No Registrado";

    const diningService =
      typeof userMetadata?.dining_service === "string" &&
      userMetadata.dining_service.trim().length > 0
        ? userMetadata.dining_service.trim()
        : "No Registrado";

    return {
      sports,
      transportRoute,
      diningService,
    };
  }

  // Fallback determinístico para alumnos semilla (A000001, A000002, etc.)
  const numericPart = Number.parseInt(studentCode.replace(/\D/g, ""), 10);
  const seed = Number.isFinite(numericPart) && numericPart > 0 ? numericPart : 1;

  const firstSport = SPORTS_CATALOG[seed % SPORTS_CATALOG.length];
  // 50% de los alumnos cursan un segundo deporte en horario no superpuesto
  const secondSportCandidate = SPORTS_CATALOG[(seed + 1) % SPORTS_CATALOG.length];
  const sports =
    seed % 2 === 0 && secondSportCandidate.schedule !== firstSport.schedule
      ? [
          { name: firstSport.name, schedule: firstSport.schedule },
          { name: secondSportCandidate.name, schedule: secondSportCandidate.schedule },
        ]
      : [{ name: firstSport.name, schedule: firstSport.schedule }];

  // 4 recorridos fijos o "No Registrado" cada 5 alumnos
  const transportRoute =
    seed % 5 === 0
      ? "No Registrado"
      : TRANSPORT_ROUTES[(seed - 1) % TRANSPORT_ROUTES.length];

  const diningService =
    seed % 4 === 0
      ? "No Registrado"
      : seed % 3 === 0
        ? "Menú Especial (Celíaco / Vegetariano)"
        : "Comedor General";

  return {
    sports,
    transportRoute,
    diningService,
  };
}

