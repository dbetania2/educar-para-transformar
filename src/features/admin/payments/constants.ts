import type { ConceptoTipo, ResumenGerencial } from "./types";

export const EMPTY_PAYMENT_RESUMEN: ResumenGerencial = {
  total_cobrado: 0,
  total_pendiente: 0,
  total_vencido: 0,
  comprobantes_en_revision: 0,
  alumnos_al_dia: 0,
  alumnos_morosos: 0,
};

export const CONCEPTO_TIPO_LABELS: Record<ConceptoTipo, string> = {
  cuota: "Cuota Académica",
  comedor: "Servicio de Comedor",
  transporte: "Transporte Escolar",
  deporte: "Actividad Deportiva",
};

export const CONCEPTO_TIPO_COLOR_HEX: Record<ConceptoTipo, string> = {
  cuota: "#2563eb",
  comedor: "#ca8a04",
  transporte: "#0d9488",
  deporte: "#9333ea",
};

export function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

