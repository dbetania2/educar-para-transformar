"use client";

import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

import { REPORT_TAB_OPTIONS } from "../constants";
import type {
  AdminReportsSummaryStats,
  ReportTabType,
  SportReportGroupingMode,
  StudentByCourseReportRow,
  StudentBySportReportRow,
  StudentBySubjectReportRow,
  StudentByTransportReportRow,
  TeacherByLevelReportRow,
} from "../types";

type AdminReportPdfButtonProps = {
  activeTab: ReportTabType;
  stats: AdminReportsSummaryStats;
  levelFilter: string;
  sportGroupingMode: SportReportGroupingMode;
  studentsByCourse: StudentByCourseReportRow[];
  studentsBySubject: StudentBySubjectReportRow[];
  teachersByLevel: TeacherByLevelReportRow[];
  studentsBySport: StudentBySportReportRow[];
  studentsByTransport: StudentByTransportReportRow[];
};

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildHtml(props: AdminReportPdfButtonProps) {
  const tabMeta =
    REPORT_TAB_OPTIONS.find((item) => item.value === props.activeTab) ??
    REPORT_TAB_OPTIONS[0];
  const generatedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  const levelLabel =
    props.levelFilter === "all" ? "Todos los niveles" : `Nivel ${props.levelFilter}`;

  let headers: string[] = [];
  let rows: string[][] = [];

  if (props.activeTab === "students_by_course") {
    headers = ["Legajo", "Apellido y Nombre", "DNI", "Nivel Educativo", "Curso / División", "Correo"];
    rows = props.studentsByCourse.map((row) => [
      row.studentCode,
      row.fullName,
      row.dni,
      row.level,
      row.courseDivision,
      row.email ?? "Sin correo",
    ]);
  } else if (props.activeTab === "students_by_subject") {
    headers = ["Nivel", "Curso", "Materia", "Profesor a cargo", "Alumno", "Legajo"];
    rows = props.studentsBySubject.map((row) => [
      row.level,
      row.courseDivision,
      row.subjectName,
      row.teacherName,
      row.fullName,
      row.studentCode,
    ]);
  } else if (props.activeTab === "teachers_by_level") {
    headers = ["Nivel Educativo", "Profesor", "Legajo", "Especialidad", "Materias a cargo", "Comisiones"];
    rows = props.teachersByLevel.map((row) => [
      row.level,
      row.fullName,
      row.teacherCode,
      row.specialty,
      row.subjects.join(", "),
      row.courses.map((c) => `${c.subjectName} (${c.commission})`).join(" · "),
    ]);
  } else if (props.activeTab === "students_by_sport") {
    if (props.sportGroupingMode === "by_sport") {
      headers = ["Deporte", "Legajo", "Alumno (Apellido y Nombre)", "DNI", "Curso"];
      rows = props.studentsBySport.map((row) => [
        row.sportName,
        row.studentCode,
        row.fullName,
        row.dni,
        row.courseDivision,
      ]);
    } else if (props.sportGroupingMode === "by_sport_level") {
      headers = ["Deporte", "Nivel Educativo", "Legajo", "Alumno (Apellido y Nombre)", "Curso"];
      rows = props.studentsBySport.map((row) => [
        row.sportName,
        row.level,
        row.studentCode,
        row.fullName,
        row.courseDivision,
      ]);
    } else {
      headers = [
        "Deporte",
        "Nivel Educativo",
        "Horario",
        "Profesor a cargo",
        "Legajo",
        "Alumno",
      ];
      rows = props.studentsBySport.map((row) => [
        row.sportName,
        row.level,
        row.schedule,
        row.teacherName,
        row.studentCode,
        row.fullName,
      ]);
    }
  } else {
    headers = [
      "Recorrido de Micro",
      "Nivel Educativo",
      "Curso",
      "Legajo",
      "Alumno",
      "Régimen Comedor",
      "Teléfono",
    ];
    rows = props.studentsByTransport.map((row) => [
      row.transportRoute,
      row.level,
      row.courseDivision,
      row.studentCode,
      row.fullName,
      row.diningService,
      row.phone ?? "Sin teléfono",
    ]);
  }

  const tableHtml =
    rows.length === 0
      ? `<p class="empty">No existen registros para los filtros seleccionados.</p>`
      : `<table>
          <thead>
            <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr>${r.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>`;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(tabMeta.label)} - Educar para Transformar</title>
  <style>
    @page { margin: 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #0f172a;
      background: #ffffff;
      font-family: Inter, Arial, sans-serif;
      line-height: 1.45;
    }
    .report { max-width: 1120px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding: 24px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }
    .eyebrow { margin: 0 0 6px; color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0; font-size: 24px; color: #103b66; }
    .meta { margin: 4px 0; color: #64748b; font-size: 12px; text-align: right; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .metric-card {
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #ffffff;
    }
    .metric-card span { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
    .metric-card strong { display: block; margin-top: 6px; color: #103b66; font-size: 22px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: left; vertical-align: top; font-size: 12px; }
    th { background: #103b66; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
    tr:last-child td { border-bottom: 0; }
    .empty { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; color: #64748b; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; }
    @media print {
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <main class="report">
    <div class="print-actions" style="margin: 0 0 16px; text-align: right;">
      <button onclick="window.print()" style="padding: 10px 18px; border: 0; border-radius: 10px; background: #2563eb; color: white; font-weight: 700; cursor: pointer;">Guardar / Imprimir PDF</button>
    </div>
    <header class="header">
      <div>
        <p class="eyebrow">Educar para Transformar · Reporte Oficial</p>
        <h1>Reporte Institucional: ${escapeHtml(tabMeta.label)}</h1>
        <p style="margin: 6px 0 0; color: #64748b; font-size: 13px;">${escapeHtml(tabMeta.description)}</p>
      </div>
      <div>
        <p class="meta"><strong>Emitido:</strong> ${escapeHtml(generatedAt)}</p>
        <p class="meta"><strong>Filtro de Nivel:</strong> ${escapeHtml(levelLabel)}</p>
        <p class="meta"><strong>Registros en vista:</strong> ${rows.length}</p>
      </div>
    </header>
    <section class="metrics">
      <div class="metric-card"><span>Alumnos activos</span><strong>${props.stats.activeStudentsCount}</strong></div>
      <div class="metric-card"><span>Docentes activos</span><strong>${props.stats.activeTeachersCount}</strong></div>
      <div class="metric-card"><span>Comisiones activas</span><strong>${props.stats.activeCoursesCount}</strong></div>
      <div class="metric-card"><span>Materias dictadas</span><strong>${props.stats.activeSubjectsCount}</strong></div>
    </section>
    ${tableHtml}
    <footer class="footer">Documento oficial emitido desde el Panel Administrativo de Dirección — Educar para Transformar.</footer>
  </main>
</body>
</html>`;
}

export function AdminReportPdfButton(props: AdminReportPdfButtonProps) {
  const handleExport = () => {
    const popup = window.open("about:blank", "_blank", "width=1120,height=800");
    if (!popup) {
      window.alert(
        "El navegador bloqueó la ventana emergente. Habilitala para exportar el reporte PDF.",
      );
      return;
    }

    popup.document.open();
    popup.document.write(buildHtml(props));
    popup.document.close();
    popup.focus();
    popup.setTimeout(() => {
      popup.print();
    }, 150);
  };

  return (
    <Button
      variant="light"
      color="blue"
      radius="md"
      h={42}
      leftSection={<IconDownload size={16} />}
      onClick={handleExport}
    >
      Exportar PDF
    </Button>
  );
}

