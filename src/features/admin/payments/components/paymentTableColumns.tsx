"use client";

import { ActionIcon, Badge, Button, Group, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconBallFootball,
  IconBus,
  IconCalendarEvent,
  IconEye,
  IconFileText,
  IconId,
  IconReceipt2,
} from "@tabler/icons-react";

import { PastelBadge, StatusToneBadge } from "@/components/atoms";
import type { ResponsiveDataTableColumn } from "@/components/molecules";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import {
  CONCEPTO_TIPO_COLOR_HEX,
  CONCEPTO_TIPO_LABELS,
  formatArs,
} from "../constants";
import type {
  ComprobantePendienteRow,
  ReporteDeporteTransporteItem,
  ReporteIngresoItem,
  ReportePagoAlumnoItem,
} from "../types";

export function getComprobantesColumns(
  onSelectReceipt: (row: ComprobantePendienteRow) => void,
): ResponsiveDataTableColumn<ComprobantePendienteRow>[] {
  return [
    {
      key: "id",
      header: "Comprobante",
      noWrap: true,
      mobileMinWidth: 120,
      render: (row) => (
        <Badge
          variant="light"
          color="blue"
          radius="xl"
          leftSection={<IconReceipt2 size={12} />}
        >
          #{row.comprobante_id}
        </Badge>
      ),
    },
    {
      key: "fecha",
      header: "Fecha de Envío",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Text size="sm" c="#334155">
          {formatDateTime(row.created_at)}
        </Text>
      ),
    },
    {
      key: "tutor",
      header: "Padre / Tutor",
      mobileMinWidth: 220,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.tutor_nombre}
          </Text>
          <Text size="xs" c="#64748b">
            {row.tutor_email || "Sin correo"}
          </Text>
        </Stack>
      ),
    },
    {
      key: "conceptos",
      header: "Conceptos Incluidos",
      mobileMinWidth: 260,
      render: (row) => (
        <Stack gap={4}>
          {row.conceptos.slice(0, 2).map((c) => (
            <Text key={c.factura_id} size="xs" c="#334155">
              <Text span fw={700} c="#0f172a">
                {c.alumno}:
              </Text>{" "}
              {c.concepto} ({c.periodo})
            </Text>
          ))}
          {row.conceptos.length > 2 ? (
            <Text size="xs" c="dimmed" fw={600}>
              +{row.conceptos.length - 2} concepto(s) adicional(es)
            </Text>
          ) : null}
        </Stack>
      ),
    },
    {
      key: "archivo",
      header: "Archivo Adjunto",
      mobileMinWidth: 170,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <IconFileText size={15} color="#2563eb" />
          <Stack gap={0}>
            <Text size="xs" fw={600} c="#334155" lineClamp={1}>
              {row.archivo_nombre}
            </Text>
            <Text size="xs" c="#64748b">
              {(row.tamano_bytes / 1024).toFixed(0)} KB
            </Text>
          </Stack>
        </Group>
      ),
    },
    {
      key: "total",
      header: "Importe Total",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) => (
        <Text fw={800} size="sm" c="#103b66">
          {formatArs(row.total)}
        </Text>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      noWrap: true,
      mobileMinWidth: 130,
      render: (row) => {
        if (row.estado_validacion === "Aprobado") {
          return <StatusToneBadge tone="success">Aprobado</StatusToneBadge>;
        }
        if (row.estado_validacion === "Rechazado") {
          return <StatusToneBadge tone="danger">Rechazado</StatusToneBadge>;
        }
        return <StatusToneBadge tone="review">En Revisión</StatusToneBadge>;
      },
    },
    {
      key: "acciones",
      header: "Acción",
      noWrap: true,
      mobileMinWidth: 130,
      render: (row) =>
        row.estado_validacion === "En Revisión" ? (
          <Button
            size="xs"
            radius="xl"
            variant="light"
            color="blue"
            leftSection={<IconEye size={14} />}
            onClick={() => onSelectReceipt(row)}
          >
            Evaluar
          </Button>
        ) : (
          <Tooltip label="Ver detalle del comprobante">
            <ActionIcon
              variant="subtle"
              color="blue"
              radius="xl"
              aria-label={`Ver comprobante ${row.comprobante_id}`}
              onClick={() => onSelectReceipt(row)}
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        ),
    },
  ];
}

export function getIngresosPeriodoColumns(): ResponsiveDataTableColumn<ReporteIngresoItem>[] {
  return [
    {
      key: "periodo",
      header: "Período Mensual",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <IconCalendarEvent size={16} color="#2563eb" />
          <Text fw={700} size="sm" c="#0f172a">
            {row.periodo}
          </Text>
        </Group>
      ),
    },
    {
      key: "anio",
      header: "Año Académico",
      noWrap: true,
      mobileMinWidth: 130,
      render: (row) => (
        <Badge variant="light" color="gray" radius="xl">
          Ciclo {row.anio_academico}
        </Badge>
      ),
    },
    {
      key: "rubro",
      header: "Rubro / Tipo de Concepto",
      noWrap: true,
      mobileMinWidth: 190,
      render: (row) => (
        <PastelBadge
          label={CONCEPTO_TIPO_LABELS[row.concepto_tipo] ?? row.concepto_tipo}
          colorHex={CONCEPTO_TIPO_COLOR_HEX[row.concepto_tipo] ?? "#2563eb"}
        />
      ),
    },
    {
      key: "cantidad",
      header: "Cuotas Cobradas",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Badge variant="light" color="blue" radius="xl">
          {row.cantidad_conceptos_cobrados} cobros
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total Recaudado",
      noWrap: true,
      mobileMinWidth: 160,
      render: (row) => (
        <Text fw={800} size="sm" c="#166534">
          {formatArs(row.total_recaudado)}
        </Text>
      ),
    },
  ];
}

export function getPagosAlumnosColumns(): ResponsiveDataTableColumn<ReportePagoAlumnoItem>[] {
  return [
    {
      key: "anio",
      header: "Año Lectivo",
      noWrap: true,
      mobileMinWidth: 120,
      render: (row) => (
        <Badge variant="light" color="gray" radius="xl">
          {row.anio_academico}
        </Badge>
      ),
    },
    {
      key: "legajo",
      header: "Legajo",
      noWrap: true,
      mobileMinWidth: 120,
      render: (row) => (
        <Badge
          variant="light"
          color="blue"
          radius="xl"
          leftSection={<IconId size={12} />}
        >
          {row.student_code}
        </Badge>
      ),
    },
    {
      key: "alumno",
      header: "Alumno",
      mobileMinWidth: 220,
      render: (row) => (
        <Stack gap={2}>
          <Text fw={700} size="sm" c="#0f172a">
            {row.alumno_nombre_completo}
          </Text>
          {row.alumno_dni ? (
            <Text size="xs" c="#64748b">
              DNI {row.alumno_dni}
            </Text>
          ) : null}
        </Stack>
      ),
    },
    {
      key: "pagadas",
      header: "Cuotas Pagadas",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) => (
        <Text size="sm" fw={600} c="#334155">
          {row.conceptos_pagados} / {row.total_conceptos}
        </Text>
      ),
    },
    {
      key: "pendientes",
      header: "Pendientes",
      noWrap: true,
      mobileMinWidth: 120,
      render: (row) => (
        <Badge
          variant="light"
          color={row.conceptos_pendientes > 0 ? "red" : "green"}
          radius="xl"
        >
          {row.conceptos_pendientes}
        </Badge>
      ),
    },
    {
      key: "abonado",
      header: "Monto Abonado",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Text fw={700} size="sm" c="#166534">
          {formatArs(row.monto_pagado)}
        </Text>
      ),
    },
    {
      key: "deuda",
      header: "Saldo Adeudado",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Text
          fw={700}
          size="sm"
          c={row.saldo_deuda > 0 ? "#b91c1c" : "#64748b"}
        >
          {formatArs(row.saldo_deuda)}
        </Text>
      ),
    },
    {
      key: "estado",
      header: "Estado Anual",
      noWrap: true,
      mobileMinWidth: 140,
      render: (row) =>
        row.estado_pago === "Completo" ? (
          <StatusToneBadge tone="success">Completo</StatusToneBadge>
        ) : (
          <StatusToneBadge tone="danger">Incompleto</StatusToneBadge>
        ),
    },
  ];
}

export function getDeporteTransporteColumns(): ResponsiveDataTableColumn<ReporteDeporteTransporteItem>[] {
  return [
    {
      key: "tipo",
      header: "Categoría",
      noWrap: true,
      mobileMinWidth: 170,
      render: (row) =>
        row.concepto_tipo === "deporte" ? (
          <Badge
            variant="light"
            color="grape"
            radius="xl"
            leftSection={<IconBallFootball size={13} />}
          >
            Deporte Extracurricular
          </Badge>
        ) : (
          <Badge
            variant="light"
            color="teal"
            radius="xl"
            leftSection={<IconBus size={13} />}
          >
            Transporte Escolar
          </Badge>
        ),
    },
    {
      key: "concepto",
      header: "Concepto Facturado",
      mobileMinWidth: 210,
      render: (row) => (
        <Text fw={700} size="sm" c="#0f172a">
          {row.concepto}
        </Text>
      ),
    },
    {
      key: "especificacion",
      header: "Disciplina / Línea de Micro",
      mobileMinWidth: 220,
      render: (row) => (
        <PastelBadge
          label={row.especificacion_servicio}
          colorHex={CONCEPTO_TIPO_COLOR_HEX[row.concepto_tipo]}
        />
      ),
    },
    {
      key: "anio",
      header: "Año Lectivo",
      noWrap: true,
      mobileMinWidth: 120,
      render: (row) => (
        <Badge variant="light" color="gray" radius="xl">
          {row.anio_academico}
        </Badge>
      ),
    },
    {
      key: "inscriptos",
      header: "Inscriptos Cobrados",
      noWrap: true,
      mobileMinWidth: 150,
      render: (row) => (
        <Badge variant="light" color="blue" radius="xl">
          {row.cantidad_inscriptos_cobrados} cuotas
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total Recaudado",
      noWrap: true,
      mobileMinWidth: 160,
      render: (row) => (
        <Text fw={800} size="sm" c="#166534">
          {formatArs(row.total_recaudado)}
        </Text>
      ),
    },
  ];
}

