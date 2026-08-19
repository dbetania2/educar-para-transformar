export type AdminBootstrapStatus = {
  enabled: boolean;
  requiresSecret: boolean;
  lockedReason: string | null;
};

export const adminBootstrapSecret =
  process.env.ADMIN_BOOTSTRAP_SECRET?.trim() || null;

export function getAdminBootstrapStatus(): AdminBootstrapStatus {
  const requiresSecret = Boolean(adminBootstrapSecret);
  const enabled = requiresSecret;

  return {
    enabled,
    requiresSecret,
    lockedReason: enabled
      ? null
      : "El bootstrap administrativo está bloqueado. Configurá ADMIN_BOOTSTRAP_SECRET para habilitar de forma controlada el setup inicial.",
  };
}

export function buildAdminBootstrapRequiredPayload() {
  return {
    error:
      "Todavía no existe un usuario administrativo. Creá el primero para habilitar el panel.",
    code: "ADMIN_BOOTSTRAP_REQUIRED" as const,
    bootstrap: getAdminBootstrapStatus(),
  };
}
