export type ConceptoTipo = "cuota" | "comedor" | "transporte" | "deporte";

export type EstadoValidacionComprobante =
  | "En Revisión"
  | "Aprobado"
  | "Rechazado";

export type AdminPaymentTab =
  | "comprobantes"
  | "ingresos_periodo"
  | "pagos_alumnos"
  | "deporte_transporte";

export type ComprobanteConceptoItem = {
  factura_id: number;
  alumno: string;
  concepto: string;
  concepto_tipo: ConceptoTipo;
  periodo: string;
  importe: number;
};

export type ComprobantePendienteRow = {
  comprobante_id: number;
  tutor_nombre: string;
  tutor_email: string;
  tutor_dni: string | null;
  archivo_path: string;
  archivo_nombre: string;
  archivo_url: string | null;
  mime_type: string;
  tamano_bytes: number;
  total: number;
  estado_validacion: EstadoValidacionComprobante;
  observaciones: string | null;
  created_at: string;
  conceptos: ComprobanteConceptoItem[];
};

export type ResumenGerencial = {
  total_cobrado: number;
  total_pendiente: number;
  total_vencido: number;
  comprobantes_en_revision: number;
  alumnos_al_dia: number;
  alumnos_morosos: number;
};

export type ReporteIngresoItem = {
  periodo: string;
  anio_academico: number;
  concepto_tipo: ConceptoTipo;
  cantidad_conceptos_cobrados: number;
  total_recaudado: number;
};

export type ReportePagoAlumnoItem = {
  anio_academico: number;
  student_profile_id: string;
  student_code: string;
  alumno_nombre_completo: string;
  alumno_dni: string | null;
  total_conceptos: number;
  conceptos_pagados: number;
  conceptos_pendientes: number;
  monto_pagado: number;
  saldo_deuda: number;
  estado_pago: "Completo" | "Incompleto";
};

export type ReporteDeporteTransporteItem = {
  concepto_tipo: "deporte" | "transporte";
  concepto: string;
  especificacion_servicio: string;
  anio_academico: number;
  cantidad_inscriptos_cobrados: number;
  total_recaudado: number;
};

export type AdminPaymentsApiResponse = {
  migrationReady: boolean;
  resumen: ResumenGerencial;
  comprobantes: ComprobantePendienteRow[];
  ingresos: ReporteIngresoItem[];
  pagosAlumnos: ReportePagoAlumnoItem[];
  servicios: ReporteDeporteTransporteItem[];
};

