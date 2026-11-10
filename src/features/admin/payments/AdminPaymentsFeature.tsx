"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBallFootball,
  IconCash,
  IconCircleCheck,
  IconDownload,
  IconPrinter,
  IconReceipt2,
  IconRefresh,
  IconUsers,
} from "@tabler/icons-react";

import { ResponsiveDataTable } from "@/components/molecules";
import { AdminListTemplate } from "@/components/templates/AdminListTemplate/AdminListTemplate";
import { AdminPaymentsStatsGrid } from "./components/AdminPaymentsStatsGrid";
import { AdminReceiptReviewModal } from "./components/AdminReceiptReviewModal";
import {
  getComprobantesColumns,
  getDeporteTransporteColumns,
  getIngresosPeriodoColumns,
  getPagosAlumnosColumns,
} from "./components/paymentTableColumns";
import {
  CONCEPTO_TIPO_LABELS,
  EMPTY_PAYMENT_RESUMEN,
  formatArs,
} from "./constants";
import type {
  AdminPaymentsApiResponse,
  AdminPaymentTab,
  ComprobantePendienteRow,
  ReporteDeporteTransporteItem,
  ReporteIngresoItem,
  ReportePagoAlumnoItem,
  ResumenGerencial,
} from "./types";

function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? "").replace(/"/g, '""');
    return `"${str}"`;
  };
  const csvContent = [
    headers.map(escapeCell).join(";"),
    ...rows.map((r) => r.map(escapeCell).join(";")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminPaymentsFeature() {
  const [activeTab, setActiveTab] = useState<AdminPaymentTab>("comprobantes");
  const [migrationReady, setMigrationReady] = useState(true);
  const [resumen, setResumen] = useState<ResumenGerencial>(
    EMPTY_PAYMENT_RESUMEN,
  );
  const [comprobantes, setComprobantes] = useState<ComprobantePendienteRow[]>(
    [],
  );
  const [ingresos, setIngresos] = useState<ReporteIngresoItem[]>([]);
  const [pagosAlumnos, setPagosAlumnos] = useState<ReportePagoAlumnoItem[]>([]);
  const [servicios, setServicios] = useState<ReporteDeporteTransporteItem[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [estadoComprobanteFilter, setEstadoComprobanteFilter] =
    useState<string>("En Revisión");
  const [desdeFilter, setDesdeFilter] = useState<string>("2026-01-01");
  const [hastaFilter, setHastaFilter] = useState<string>("2026-12-31");
  const [anioFilter, setAnioFilter] = useState<string>("2026");
  const [estadoAlumnoFilter, setEstadoAlumnoFilter] = useState<string>("all");
  const [servicioCategoriaFilter, setServicioCategoriaFilter] =
    useState<string>("all");

  // Modal de revisión de comprobante
  const [selectedReceipt, setSelectedReceipt] =
    useState<ComprobantePendienteRow | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchPaymentsData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      if (desdeFilter) params.set("desde", desdeFilter);
      if (hastaFilter) params.set("hasta", hastaFilter);

      const response = await fetch(`/api/admin/pagos?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminPaymentsApiResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "No se pudieron cargar los datos de cobranzas.",
        );
      }

      setMigrationReady(payload.migrationReady ?? true);
      setResumen(payload.resumen ?? EMPTY_PAYMENT_RESUMEN);
      setComprobantes(payload.comprobantes ?? []);
      setIngresos(payload.ingresos ?? []);
      setPagosAlumnos(payload.pagosAlumnos ?? []);
      setServicios(payload.servicios ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error inesperado al cargar cobranzas y reportes financieros.",
      );
    } finally {
      setLoading(false);
    }
  }, [desdeFilter, hastaFilter]);

  useEffect(() => {
    void fetchPaymentsData();

    const handleRefreshEvent = () => {
      void fetchPaymentsData();
    };
    window.addEventListener("admin-payments-refresh", handleRefreshEvent);
    return () => {
      window.removeEventListener("admin-payments-refresh", handleRefreshEvent);
    };
  }, [fetchPaymentsData]);

  const handleOpenReceiptModal = useCallback((row: ComprobantePendienteRow) => {
    setSelectedReceipt(row);
    setReviewNotes(row.observaciones ?? "");
    setReviewError(null);
  }, []);

  const handleCloseReceiptModal = useCallback(() => {
    if (isSubmittingReview) return;
    setSelectedReceipt(null);
    setReviewNotes("");
    setReviewError(null);
  }, [isSubmittingReview]);

  const handleReviewDecision = useCallback(
    async (aprobar: boolean) => {
      if (!selectedReceipt) return;
      if (!aprobar && !reviewNotes.trim()) {
        setReviewError(
          "Por favor, ingresá el motivo del rechazo para notificar al tutor.",
        );
        return;
      }

      setIsSubmittingReview(true);
      setReviewError(null);

      try {
        const response = await fetch("/api/admin/pagos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comprobanteId: selectedReceipt.comprobante_id,
            aprobar,
            observaciones: reviewNotes.trim() || null,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error ?? "No se pudo actualizar el comprobante.",
          );
        }

        setFeedbackMessage(
          aprobar
            ? `Comprobante #${selectedReceipt.comprobante_id} aprobado. Las cuotas asociadas pasaron a estado Pagada.`
            : `Comprobante #${selectedReceipt.comprobante_id} rechazado. Las cuotas volvieron a quedar habilitadas para pago.`,
        );
        setSelectedReceipt(null);
        setReviewNotes("");
        await fetchPaymentsData();
        window.dispatchEvent(new Event("admin-payments-refresh"));
      } catch (err) {
        setReviewError(
          err instanceof Error
            ? err.message
            : "Error inesperado al procesar el comprobante.",
        );
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [selectedReceipt, reviewNotes, fetchPaymentsData],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredComprobantes = useMemo(
    () =>
      comprobantes.filter((row) => {
        if (
          estadoComprobanteFilter !== "all" &&
          row.estado_validacion !== estadoComprobanteFilter
        ) {
          return false;
        }
        if (!normalizedSearch) return true;
        return (
          String(row.comprobante_id).includes(normalizedSearch) ||
          row.tutor_nombre.toLowerCase().includes(normalizedSearch) ||
          row.tutor_email.toLowerCase().includes(normalizedSearch) ||
          row.conceptos.some(
            (c) =>
              c.alumno.toLowerCase().includes(normalizedSearch) ||
              c.concepto.toLowerCase().includes(normalizedSearch),
          )
        );
      }),
    [comprobantes, estadoComprobanteFilter, normalizedSearch],
  );

  const filteredIngresos = useMemo(
    () =>
      ingresos.filter((row) => {
        if (!normalizedSearch) return true;
        const label =
          CONCEPTO_TIPO_LABELS[row.concepto_tipo]?.toLowerCase() ?? "";
        return (
          row.periodo.toLowerCase().includes(normalizedSearch) ||
          row.concepto_tipo.toLowerCase().includes(normalizedSearch) ||
          label.includes(normalizedSearch)
        );
      }),
    [ingresos, normalizedSearch],
  );

  const filteredPagosAlumnos = useMemo(
    () =>
      pagosAlumnos.filter((row) => {
        if (
          anioFilter !== "all" &&
          String(row.anio_academico) !== anioFilter
        ) {
          return false;
        }
        if (
          estadoAlumnoFilter !== "all" &&
          row.estado_pago !== estadoAlumnoFilter
        ) {
          return false;
        }
        if (!normalizedSearch) return true;
        return (
          row.alumno_nombre_completo.toLowerCase().includes(normalizedSearch) ||
          row.student_code.toLowerCase().includes(normalizedSearch) ||
          (row.alumno_dni ?? "").toLowerCase().includes(normalizedSearch)
        );
      }),
    [pagosAlumnos, anioFilter, estadoAlumnoFilter, normalizedSearch],
  );

  const filteredServicios = useMemo(
    () =>
      servicios.filter((row) => {
        if (
          servicioCategoriaFilter !== "all" &&
          row.concepto_tipo !== servicioCategoriaFilter
        ) {
          return false;
        }
        if (
          anioFilter !== "all" &&
          String(row.anio_academico) !== anioFilter
        ) {
          return false;
        }
        if (!normalizedSearch) return true;
        return (
          row.concepto.toLowerCase().includes(normalizedSearch) ||
          row.especificacion_servicio.toLowerCase().includes(normalizedSearch)
        );
      }),
    [servicios, servicioCategoriaFilter, anioFilter, normalizedSearch],
  );

  const subtotalIngresos = useMemo(
    () =>
      filteredIngresos.reduce((acc, r) => acc + Number(r.total_recaudado), 0),
    [filteredIngresos],
  );

  const subtotalServicios = useMemo(
    () =>
      filteredServicios.reduce((acc, r) => acc + Number(r.total_recaudado), 0),
    [filteredServicios],
  );

  const handleExportActiveTabCsv = () => {
    if (activeTab === "comprobantes") {
      downloadCsv(
        "comprobantes_pago.csv",
        [
          "Comprobante ID",
          "Fecha",
          "Tutor",
          "Email Tutor",
          "Conceptos",
          "Importe Total",
          "Estado Validacion",
        ],
        filteredComprobantes.map((r) => [
          r.comprobante_id,
          r.created_at,
          r.tutor_nombre,
          r.tutor_email,
          r.conceptos.map((c) => `${c.alumno}: ${c.concepto}`).join(" | "),
          r.total,
          r.estado_validacion,
        ]),
      );
      return;
    }

    if (activeTab === "ingresos_periodo") {
      downloadCsv(
        "reporte_ingresos_por_periodo.csv",
        [
          "Periodo",
          "Anio Academico",
          "Rubro",
          "Conceptos Cobrados",
          "Total Recaudado",
        ],
        filteredIngresos.map((r) => [
          r.periodo,
          r.anio_academico,
          CONCEPTO_TIPO_LABELS[r.concepto_tipo] ?? r.concepto_tipo,
          r.cantidad_conceptos_cobrados,
          r.total_recaudado,
        ]),
      );
      return;
    }

    if (activeTab === "pagos_alumnos") {
      downloadCsv(
        "reporte_pagos_alumnos.csv",
        [
          "Anio Academico",
          "Legajo",
          "Alumno",
          "Cuotas Pagadas",
          "Cuotas Pendientes",
          "Monto Abonado",
          "Saldo Deuda",
          "Estado",
        ],
        filteredPagosAlumnos.map((r) => [
          r.anio_academico,
          r.student_code,
          r.alumno_nombre_completo,
          r.conceptos_pagados,
          r.conceptos_pendientes,
          r.monto_pagado,
          r.saldo_deuda,
          r.estado_pago,
        ]),
      );
      return;
    }

    downloadCsv(
      "reporte_ingresos_deporte_transporte.csv",
      [
        "Categoria",
        "Concepto",
        "Disciplina o Recorrido",
        "Anio Academico",
        "Inscriptos Cobrados",
        "Total Recaudado",
      ],
      filteredServicios.map((r) => [
        r.concepto_tipo,
        r.concepto,
        r.especificacion_servicio,
        r.anio_academico,
        r.cantidad_inscriptos_cobrados,
        r.total_recaudado,
      ]),
    );
  };

  const comprobantesColumns = useMemo(
    () => getComprobantesColumns(handleOpenReceiptModal),
    [handleOpenReceiptModal],
  );
  const ingresosColumns = useMemo(() => getIngresosPeriodoColumns(), []);
  const pagosAlumnosColumns = useMemo(() => getPagosAlumnosColumns(), []);
  const serviciosColumns = useMemo(() => getDeporteTransporteColumns(), []);

  return (
    <AdminListTemplate
      title="Pagos, Comprobantes y Reportes Financieros"
      description="Validá los comprobantes de pago enviados desde la aplicación móvil de familias y consultá los reportes gerenciales de recaudación, morosidad y servicios."
      breadcrumbs={[
        { label: "Panel Administrativo", href: "/admin" },
        { label: "Pagos y Cobranzas" },
      ]}
      searchProps={{
        value: search,
        onChange: setSearch,
        placeholder:
          "Buscar por tutor, alumno, legajo, concepto o número de comprobante...",
      }}
      statsSlot={<AdminPaymentsStatsGrid resumen={resumen} />}
      filtersSlot={
        <>
          {activeTab === "comprobantes" ? (
            <Select
              label="Estado de validación"
              value={estadoComprobanteFilter}
              onChange={(val) => setEstadoComprobanteFilter(val ?? "all")}
              data={[
                { value: "En Revisión", label: "En Revisión (Pendientes)" },
                { value: "all", label: "Todos los estados" },
                { value: "Aprobado", label: "Aprobados" },
                { value: "Rechazado", label: "Rechazados" },
              ]}
              w={{ base: "100%", sm: 230 }}
            />
          ) : null}

          {activeTab === "ingresos_periodo" ? (
            <>
              <TextInput
                label="Período desde"
                type="date"
                value={desdeFilter}
                onChange={(e) => setDesdeFilter(e.currentTarget.value)}
                w={{ base: "100%", sm: 165 }}
              />
              <TextInput
                label="Período hasta"
                type="date"
                value={hastaFilter}
                onChange={(e) => setHastaFilter(e.currentTarget.value)}
                w={{ base: "100%", sm: 165 }}
              />
            </>
          ) : null}

          {(activeTab === "pagos_alumnos" ||
            activeTab === "deporte_transporte") ? (
            <Select
              label="Año lectivo"
              value={anioFilter}
              onChange={(val) => setAnioFilter(val ?? "all")}
              data={[
                { value: "all", label: "Todos los ciclos" },
                { value: "2026", label: "Ciclo 2026" },
                { value: "2025", label: "Ciclo 2025" },
              ]}
              w={{ base: "100%", sm: 165 }}
            />
          ) : null}

          {activeTab === "pagos_alumnos" ? (
            <Select
              label="Estado de cuenta"
              value={estadoAlumnoFilter}
              onChange={(val) => setEstadoAlumnoFilter(val ?? "all")}
              data={[
                { value: "all", label: "Todos (Completos e Incompletos)" },
                { value: "Incompleto", label: "Incompletos (Con deuda)" },
                { value: "Completo", label: "Completos (Al día)" },
              ]}
              w={{ base: "100%", sm: 240 }}
            />
          ) : null}

          {activeTab === "deporte_transporte" ? (
            <Select
              label="Categoría de servicio"
              value={servicioCategoriaFilter}
              onChange={(val) => setServicioCategoriaFilter(val ?? "all")}
              data={[
                { value: "all", label: "Deportes y Transporte" },
                { value: "deporte", label: "Solo Deportes" },
                { value: "transporte", label: "Solo Transporte (Micro)" },
              ]}
              w={{ base: "100%", sm: 220 }}
            />
          ) : null}

          <Group gap="xs" align="flex-end">
            <Button
              variant="default"
              radius="xl"
              leftSection={<IconRefresh size={16} />}
              onClick={() => void fetchPaymentsData()}
              loading={loading}
            >
              Actualizar
            </Button>
            <Button
              variant="light"
              color="blue"
              radius="xl"
              leftSection={<IconDownload size={16} />}
              onClick={handleExportActiveTabCsv}
            >
              Exportar CSV
            </Button>
            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              leftSection={<IconPrinter size={16} />}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
          </Group>
        </>
      }
    >
      <Stack gap="md">
        {!migrationReady ? (
          <Alert
            variant="light"
            color="yellow"
            radius="md"
            icon={<IconAlertCircle size={18} />}
            title="Tablas de facturación móvil pendientes de migración"
          >
            Para visualizar comprobantes y reportes financieros en vivo, ejecutá
            las migraciones{" "}
            <Text span fw={700}>
              20260607000014_mobile_billing.sql
            </Text>
            ,{" "}
            <Text span fw={700}>
              20260607000015_review_and_balances.sql
            </Text>{" "}
            y{" "}
            <Text span fw={700}>
              20260607000016_management_reports.sql
            </Text>{" "}
            en el proyecto de Supabase.
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert
            variant="light"
            color="red"
            radius="md"
            icon={<IconAlertCircle size={18} />}
            title="Error al cargar cobranzas"
          >
            {errorMessage}
          </Alert>
        ) : null}

        {feedbackMessage ? (
          <Alert
            variant="light"
            color="green"
            radius="md"
            withCloseButton
            onClose={() => setFeedbackMessage(null)}
            icon={<IconCircleCheck size={18} />}
          >
            {feedbackMessage}
          </Alert>
        ) : null}

        <Tabs
          value={activeTab}
          onChange={(value) =>
            setActiveTab((value as AdminPaymentTab) ?? "comprobantes")
          }
          variant="pills"
          radius="xl"
        >
          <Tabs.List>
            <Tabs.Tab
              value="comprobantes"
              leftSection={<IconReceipt2 size={16} />}
              rightSection={
                <Badge size="xs" variant="filled" color="yellow">
                  {resumen.comprobantes_en_revision}
                </Badge>
              }
            >
              Revisión de Comprobantes
            </Tabs.Tab>
            <Tabs.Tab
              value="ingresos_periodo"
              leftSection={<IconCash size={16} />}
              rightSection={
                <Badge size="xs" variant="filled" color="green">
                  {filteredIngresos.length}
                </Badge>
              }
            >
              Ingresos por Período (REQ-WEB-01)
            </Tabs.Tab>
            <Tabs.Tab
              value="pagos_alumnos"
              leftSection={<IconUsers size={16} />}
              rightSection={
                <Badge size="xs" variant="filled" color="blue">
                  {filteredPagosAlumnos.length}
                </Badge>
              }
            >
              Estado por Alumno (REQ-WEB-02)
            </Tabs.Tab>
            <Tabs.Tab
              value="deporte_transporte"
              leftSection={<IconBallFootball size={16} />}
              rightSection={
                <Badge size="xs" variant="filled" color="grape">
                  {filteredServicios.length}
                </Badge>
              }
            >
              Deporte y Transporte (REQ-WEB-03)
            </Tabs.Tab>
          </Tabs.List>

          <Divider my="md" />

          <Tabs.Panel value="comprobantes">
            <ResponsiveDataTable
              columns={comprobantesColumns}
              data={filteredComprobantes}
              rowKey={(row) => String(row.comprobante_id)}
              loading={loading}
              pageSize={15}
              onRowClick={handleOpenReceiptModal}
              emptyMessage="No hay comprobantes que coincidan con el filtro seleccionado."
            />
          </Tabs.Panel>

          <Tabs.Panel value="ingresos_periodo">
            <Stack gap="sm">
              <ResponsiveDataTable
                columns={ingresosColumns}
                data={filteredIngresos}
                rowKey={(row) =>
                  `${row.periodo}-${row.anio_academico}-${row.concepto_tipo}`
                }
                loading={loading}
                pageSize={15}
                emptyMessage="No se registran ingresos cobrados en el período seleccionado."
              />
              {filteredIngresos.length > 0 ? (
                <Group justify="flex-end" px="md" py="xs">
                  <Text size="sm" fw={700} c="#64748b">
                    Subtotal recaudado en el período:
                  </Text>
                  <Text fz={18} fw={900} c="#166534">
                    {formatArs(subtotalIngresos)}
                  </Text>
                </Group>
              ) : null}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="pagos_alumnos">
            <ResponsiveDataTable
              columns={pagosAlumnosColumns}
              data={filteredPagosAlumnos}
              rowKey={(row) =>
                `${row.anio_academico}-${row.student_profile_id}`
              }
              loading={loading}
              pageSize={15}
              emptyMessage="No se encontraron registros de estado de cuenta de alumnos."
            />
          </Tabs.Panel>

          <Tabs.Panel value="deporte_transporte">
            <Stack gap="sm">
              <ResponsiveDataTable
                columns={serviciosColumns}
                data={filteredServicios}
                rowKey={(row) =>
                  `${row.concepto_tipo}-${row.concepto}-${row.especificacion_servicio}-${row.anio_academico}`
                }
                loading={loading}
                pageSize={15}
                emptyMessage="No se registran cobros de deportes ni transporte escolar."
              />
              {filteredServicios.length > 0 ? (
                <Group justify="flex-end" px="md" py="xs">
                  <Text size="sm" fw={700} c="#64748b">
                    Subtotal recaudado en servicios seleccionados:
                  </Text>
                  <Text fz={18} fw={900} c="#166534">
                    {formatArs(subtotalServicios)}
                  </Text>
                </Group>
              ) : null}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <AdminReceiptReviewModal
        selectedReceipt={selectedReceipt}
        observaciones={reviewNotes}
        isSubmitting={isSubmittingReview}
        errorMessage={reviewError}
        onClose={handleCloseReceiptModal}
        onChangeObservaciones={setReviewNotes}
        onReviewDecision={handleReviewDecision}
      />
    </AdminListTemplate>
  );
}
