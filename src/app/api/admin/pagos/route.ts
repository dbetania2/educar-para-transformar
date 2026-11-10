import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";
import type {
  AdminPaymentsApiResponse,
  ComprobanteConceptoItem,
  ComprobantePendienteRow,
  ConceptoTipo,
  ReporteDeporteTransporteItem,
  ReporteIngresoItem,
  ReportePagoAlumnoItem,
  ResumenGerencial,
} from "@/features/admin/payments/types";

type RawFacturaRow = {
  id: number;
  student_profile_id: string;
  concepto_tipo: ConceptoTipo;
  concepto: string;
  detalle: string | null;
  anio_academico: number;
  periodo: string;
  importe: number | string;
  vencimiento: string;
  estado: "Pendiente" | "Pagada" | "Vencida" | "En Revisión";
};

type RawComprobanteRow = {
  id: number;
  tutor_profile_id: string;
  archivo_path: string;
  archivo_nombre: string;
  mime_type: string;
  tamano_bytes: number;
  total: number | string;
  estado_validacion: "En Revisión" | "Aprobado" | "Rechazado";
  observaciones: string | null;
  created_at: string;
};

type RawComprobanteItemRow = {
  comprobante_id: number;
  factura_id: number;
  importe: number | string;
};

type RawProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  dni: string | null;
};

type RawStudentRow = {
  profile_id: string;
  student_code: string | null;
};

const EMPTY_RESUMEN: ResumenGerencial = {
  total_cobrado: 0,
  total_pendiente: 0,
  total_vencido: 0,
  comprobantes_en_revision: 0,
  alumnos_al_dia: 0,
  alumnos_morosos: 0,
};

function toNumber(val: number | string | null | undefined): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatFullName(profile?: RawProfileRow): string {
  if (!profile) return "Sin nombre";
  const last = (profile.last_name ?? "").trim();
  const first = (profile.first_name ?? "").trim();
  if (last && first) return `${last}, ${first}`;
  return last || first || "Sin nombre";
}

export async function GET(request: Request) {
  const access = await getAdminClientWithGuard();
  if ("error" in access) {
    return access.error;
  }

  const { supabase } = access;
  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde")?.trim() || null;
  const hasta = searchParams.get("hasta")?.trim() || null;

  const [facturasRes, comprobantesRes, itemsRes, profilesRes, studentsRes] =
    await Promise.all([
      supabase
        .from("facturas_cuotas")
        .select(
          "id, student_profile_id, concepto_tipo, concepto, detalle, anio_academico, periodo, importe, vencimiento, estado",
        )
        .order("periodo", { ascending: false }),
      supabase
        .from("comprobantes_pago")
        .select(
          "id, tutor_profile_id, archivo_path, archivo_nombre, mime_type, tamano_bytes, total, estado_validacion, observaciones, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("comprobante_items")
        .select("comprobante_id, factura_id, importe"),
      supabase
        .from("profiles")
        .select("id, first_name, last_name, email, dni"),
      supabase
        .from("students")
        .select("profile_id, student_code"),
    ]);

  // Si las tablas de facturación móvil aún no fueron migradas, devolvemos estado controlado
  if (facturasRes.error || comprobantesRes.error) {
    const errCode = facturasRes.error?.code ?? comprobantesRes.error?.code;
    if (errCode === "42P01" || errCode === "PGRST205") {
      const fallback: AdminPaymentsApiResponse = {
        migrationReady: false,
        resumen: EMPTY_RESUMEN,
        comprobantes: [],
        ingresos: [],
        pagosAlumnos: [],
        servicios: [],
      };
      return NextResponse.json(fallback);
    }

    return NextResponse.json(
      {
        error:
          facturasRes.error?.message ??
          comprobantesRes.error?.message ??
          "No se pudieron consultar los datos de facturación y cobranzas.",
      },
      { status: 500 },
    );
  }

  const facturas = (facturasRes.data ?? []) as RawFacturaRow[];
  const comprobantes = (comprobantesRes.data ?? []) as RawComprobanteRow[];
  const comprobanteItems = (itemsRes.data ?? []) as RawComprobanteItemRow[];
  const profiles = (profilesRes.data ?? []) as RawProfileRow[];
  const students = (studentsRes.data ?? []) as RawStudentRow[];

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const studentById = new Map(students.map((s) => [s.profile_id, s]));
  const facturaById = new Map(facturas.map((f) => [f.id, f]));

  const todayIso = new Date().toISOString().slice(0, 10);

  // Filtrado por rango de fechas para KPIs y REQ-WEB-01
  const facturasFiltradas = facturas.filter((f) => {
    if (desde && f.periodo < desde) return false;
    if (hasta && f.periodo > hasta) return false;
    return true;
  });

  // 1. Resumen Ejecutivo (KPIs)
  let totalCobrado = 0;
  let totalPendiente = 0;
  let totalVencido = 0;

  const studentStatusMap = new Map<
    string,
    { hasUnpaid: boolean; hasOverdue: boolean }
  >();

  for (const f of facturasFiltradas) {
    const imp = toNumber(f.importe);
    const isOverdue =
      f.estado === "Vencida" ||
      (f.estado === "Pendiente" && f.vencimiento < todayIso);

    if (f.estado === "Pagada") {
      totalCobrado += imp;
    } else {
      if (f.estado === "Pendiente" || f.estado === "En Revisión") {
        totalPendiente += imp;
      }
      if (isOverdue) {
        totalVencido += imp;
      }
    }

    const current = studentStatusMap.get(f.student_profile_id) ?? {
      hasUnpaid: false,
      hasOverdue: false,
    };
    if (f.estado !== "Pagada") {
      current.hasUnpaid = true;
    }
    if (isOverdue) {
      current.hasOverdue = true;
    }
    studentStatusMap.set(f.student_profile_id, current);
  }

  let alumnosAlDia = 0;
  let alumnosMorosos = 0;
  for (const st of studentStatusMap.values()) {
    if (!st.hasUnpaid) alumnosAlDia += 1;
    if (st.hasOverdue) alumnosMorosos += 1;
  }

  const comprobantesEnRevisionCount = comprobantes.filter(
    (c) => c.estado_validacion === "En Revisión",
  ).length;

  const resumen: ResumenGerencial = {
    total_cobrado: totalCobrado,
    total_pendiente: totalPendiente,
    total_vencido: totalVencido,
    comprobantes_en_revision: comprobantesEnRevisionCount,
    alumnos_al_dia: alumnosAlDia,
    alumnos_morosos: alumnosMorosos,
  };

  // 2. Comprobantes con detalle de conceptos y URL firmada de Storage
  const itemsByComprobante = new Map<number, RawComprobanteItemRow[]>();
  for (const item of comprobanteItems) {
    const list = itemsByComprobante.get(item.comprobante_id) ?? [];
    list.push(item);
    itemsByComprobante.set(item.comprobante_id, list);
  }

  const comprobantesRows: ComprobantePendienteRow[] = await Promise.all(
    comprobantes.map(async (c) => {
      const tutorProfile = profileById.get(c.tutor_profile_id);
      const rawItems = itemsByComprobante.get(c.id) ?? [];

      const conceptos: ComprobanteConceptoItem[] = rawItems.map((ci) => {
        const factura = facturaById.get(ci.factura_id);
        const studentProfile = factura
          ? profileById.get(factura.student_profile_id)
          : undefined;
        return {
          factura_id: ci.factura_id,
          alumno: formatFullName(studentProfile),
          concepto: factura?.concepto ?? `Cuota #${ci.factura_id}`,
          concepto_tipo: factura?.concepto_tipo ?? "cuota",
          periodo: factura?.periodo ?? "",
          importe: toNumber(ci.importe),
        };
      });

      let signedUrl: string | null = null;
      if (c.archivo_path) {
        const { data: signedData } = await supabase.storage
          .from("comprobantes")
          .createSignedUrl(c.archivo_path, 3600);
        signedUrl = signedData?.signedUrl ?? null;
      }

      return {
        comprobante_id: c.id,
        tutor_nombre: formatFullName(tutorProfile),
        tutor_email: tutorProfile?.email ?? "",
        tutor_dni: tutorProfile?.dni ?? null,
        archivo_path: c.archivo_path,
        archivo_nombre: c.archivo_nombre,
         archivo_url: signedUrl,
        mime_type: c.mime_type,
        tamano_bytes: c.tamano_bytes,
        total: toNumber(c.total),
        estado_validacion: c.estado_validacion,
        observaciones: c.observaciones,
        created_at: c.created_at,
        conceptos,
      };
    }),
  );

  // 3. REQ-WEB-01: Reporte de Ingresos Totales por Período y Rubro
  const ingresosMap = new Map<string, ReporteIngresoItem>();
  for (const f of facturasFiltradas) {
    if (f.estado !== "Pagada") continue;
    const key = `${f.periodo}__${f.anio_academico}__${f.concepto_tipo}`;
    const existing = ingresosMap.get(key);
    const imp = toNumber(f.importe);
    if (existing) {
      existing.cantidad_conceptos_cobrados += 1;
      existing.total_recaudado += imp;
    } else {
      ingresosMap.set(key, {
        periodo: f.periodo,
        anio_academico: f.anio_academico,
        concepto_tipo: f.concepto_tipo,
        cantidad_conceptos_cobrados: 1,
        total_recaudado: imp,
      });
    }
  }

  const ingresos = Array.from(ingresosMap.values()).sort((a, b) => {
    if (a.periodo !== b.periodo) return b.periodo.localeCompare(a.periodo);
    return b.total_recaudado - a.total_recaudado;
  });

  // 4. REQ-WEB-02: Reporte de Pagos Completos / Incompletos por Alumno y Año Académico
  const pagosAlumnosMap = new Map<string, ReportePagoAlumnoItem>();
  for (const f of facturas) {
    const key = `${f.anio_academico}__${f.student_profile_id}`;
    const studentProfile = profileById.get(f.student_profile_id);
    const studentRow = studentById.get(f.student_profile_id);
    const imp = toNumber(f.importe);
    const isPaid = f.estado === "Pagada";

    const existing = pagosAlumnosMap.get(key);
    if (existing) {
      existing.total_conceptos += 1;
      if (isPaid) {
        existing.conceptos_pagados += 1;
        existing.monto_pagado += imp;
      } else {
        existing.conceptos_pendientes += 1;
        existing.saldo_deuda += imp;
      }
      existing.estado_pago =
        existing.conceptos_pendientes === 0 ? "Completo" : "Incompleto";
    } else {
      const pendientes = isPaid ? 0 : 1;
      pagosAlumnosMap.set(key, {
        anio_academico: f.anio_academico,
        student_profile_id: f.student_profile_id,
        student_code: studentRow?.student_code ?? "S/L",
        alumno_nombre_completo: formatFullName(studentProfile),
        alumno_dni: studentProfile?.dni ?? null,
        total_conceptos: 1,
        conceptos_pagados: isPaid ? 1 : 0,
        conceptos_pendientes: pendientes,
        monto_pagado: isPaid ? imp : 0,
        saldo_deuda: isPaid ? 0 : imp,
        estado_pago: pendientes === 0 ? "Completo" : "Incompleto",
      });
    }
  }

  const pagosAlumnos = Array.from(pagosAlumnosMap.values()).sort((a, b) => {
    if (a.anio_academico !== b.anio_academico) {
      return b.anio_academico - a.anio_academico;
    }
    return a.alumno_nombre_completo.localeCompare(b.alumno_nombre_completo, "es");
  });

  // 5. REQ-WEB-03: Reporte de Ingresos por Deporte y Recorrido de Transporte
  const serviciosMap = new Map<string, ReporteDeporteTransporteItem>();
  for (const f of facturas) {
    if (
      f.estado !== "Pagada" ||
      (f.concepto_tipo !== "deporte" && f.concepto_tipo !== "transporte")
    ) {
      continue;
    }
    const especificacion = (f.detalle ?? "").trim() || "General";
    const key = `${f.concepto_tipo}__${f.concepto}__${especificacion}__${f.anio_academico}`;
    const imp = toNumber(f.importe);
    const existing = serviciosMap.get(key);
    if (existing) {
      existing.cantidad_inscriptos_cobrados += 1;
      existing.total_recaudado += imp;
    } else {
      serviciosMap.set(key, {
        concepto_tipo: f.concepto_tipo,
        concepto: f.concepto,
        especificacion_servicio: especificacion,
        anio_academico: f.anio_academico,
        cantidad_inscriptos_cobrados: 1,
        total_recaudado: imp,
      });
    }
  }

  const servicios = Array.from(serviciosMap.values()).sort((a, b) => {
    if (a.concepto_tipo !== b.concepto_tipo) {
      return a.concepto_tipo.localeCompare(b.concepto_tipo);
    }
    return b.total_recaudado - a.total_recaudado;
  });

  const payload: AdminPaymentsApiResponse = {
    migrationReady: true,
    resumen,
    comprobantes: comprobantesRows,
    ingresos,
    pagosAlumnos,
    servicios,
  };

  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const access = await getAdminClientWithGuard();
  if ("error" in access) {
    return access.error;
  }

  const { supabase } = access;

  try {
    const body = (await request.json()) as {
      comprobanteId?: number;
      aprobar?: boolean;
      observaciones?: string | null;
    };

    const comprobanteId = Number(body.comprobanteId);
    const aprobar = Boolean(body.aprobar);
    const observaciones = body.observaciones?.trim() || null;

    if (!Number.isFinite(comprobanteId) || comprobanteId <= 0) {
      return NextResponse.json(
        { error: "Identificador de comprobante inválido." },
        { status: 400 },
      );
    }

    if (!aprobar && !observaciones) {
      return NextResponse.json(
        { error: "Debe indicar el motivo del rechazo para informar al tutor." },
        { status: 400 },
      );
    }

    const { data: comp, error: compError } = await supabase
      .from("comprobantes_pago")
      .select("id, estado_validacion")
      .eq("id", comprobanteId)
      .single();

    if (compError || !comp) {
      return NextResponse.json(
        { error: "El comprobante indicado no existe." },
        { status: 404 },
      );
    }

    if (comp.estado_validacion !== "En Revisión") {
      return NextResponse.json(
        { error: "Este comprobante ya fue procesado anteriormente." },
        { status: 400 },
      );
    }

    const nuevoEstadoValidacion = aprobar ? "Aprobado" : "Rechazado";
    const { error: updateCompError } = await supabase
      .from("comprobantes_pago")
      .update({
        estado_validacion: nuevoEstadoValidacion,
        observaciones: aprobar ? observaciones : observaciones,
      })
      .eq("id", comprobanteId);

    if (updateCompError) {
      return NextResponse.json(
        { error: updateCompError.message },
        { status: 500 },
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("comprobante_items")
      .select("factura_id")
      .eq("comprobante_id", comprobanteId);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 },
      );
    }

    const facturaIds = (items ?? []).map((i) => i.factura_id);

    if (facturaIds.length > 0) {
      if (aprobar) {
        const { error: updateFacturasError } = await supabase
          .from("facturas_cuotas")
          .update({ estado: "Pagada" })
          .in("id", facturaIds);

        if (updateFacturasError) {
          return NextResponse.json(
            { error: updateFacturasError.message },
            { status: 500 },
          );
        }
      } else {
        const todayIso = new Date().toISOString().slice(0, 10);
        const { data: facturasRows } = await supabase
          .from("facturas_cuotas")
          .select("id, vencimiento")
          .in("id", facturaIds);

        for (const f of facturasRows ?? []) {
          const restoredState =
            f.vencimiento < todayIso ? "Vencida" : "Pendiente";
          await supabase
            .from("facturas_cuotas")
            .update({ estado: restoredState })
            .eq("id", f.id);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      estado_validacion: nuevoEstadoValidacion,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error inesperado al procesar la revisión del comprobante.",
      },
      { status: 500 },
    );
  }
}

