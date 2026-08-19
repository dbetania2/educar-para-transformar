"use client";

import { IconDownload } from "@tabler/icons-react";

import { CTAButton } from "@/components/atoms";
import type { NoDocenteContactMessageRecord, NoDocenteRequestRecord, NoDocenteStudentRecord, NoDocenteTaskRecord } from "@/lib/noDocenteDashboard";
import type { NoDocenteReportRow } from "@/features/no-docente/NoDocenteReportsTable";

type NoDocenteReportPdfButtonProps = {
  rows: NoDocenteReportRow[];
  students: NoDocenteStudentRecord[];
  tasks: NoDocenteTaskRecord[];
  requests: NoDocenteRequestRecord[];
  contactMessages: NoDocenteContactMessageRecord[];
  generatedBy: string;
};

const REQUEST_STATUS_LABELS: Record<NoDocenteRequestRecord["status"], string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const TASK_STATUS_LABELS: Record<NoDocenteTaskRecord["status"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function metricCards(rows: NoDocenteReportRow[]) {
  return rows.map((row) => `
    <article class="metric-card">
      <p>${escapeHtml(row.metric)}</p>
      <strong>${escapeHtml(row.value)}</strong>
      <span>${escapeHtml(row.detail)}</span>
    </article>
  `).join("");
}

function tableSection(title: string, emptyText: string, headers: string[], rows: string[][]) {
  if (rows.length === 0) {
    return `
      <section class="section">
        <h2>${escapeHtml(title)}</h2>
        <p class="empty">${escapeHtml(emptyText)}</p>
      </section>
    `;
  }

  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function buildReportHtml({ rows, students, tasks, requests, contactMessages, generatedBy }: NoDocenteReportPdfButtonProps) {
  const generatedAt = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(new Date());
  const incompleteStudents = students.filter((student) => !student.email || !student.phone);
  const openTasks = tasks.filter((task) => task.status === "pendiente" || task.status === "en_proceso");
  const pendingRequests = requests.filter((request) => request.status === "pendiente" || request.status === "en_revision");
  const sortedMessages = [...contactMessages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte operativo - Educar para Transformar</title>
  <style>
    @page { margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #17212b;
      background: #ffffff;
      font-family: Inter, Arial, sans-serif;
      line-height: 1.45;
    }
    .report { max-width: 1120px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      padding: 28px;
      border-radius: 18px;
      background: #f4f8fb;
      border: 1px solid #d9e6ef;
      margin-bottom: 22px;
    }
    .eyebrow { margin: 0 0 8px; color: #00517c; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0; font-size: 30px; color: #003f63; }
    h2 { margin: 0 0 12px; font-size: 18px; color: #003f63; }
    .meta { margin: 4px 0; color: #51606d; font-size: 13px; text-align: right; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .metric-card {
      min-height: 126px;
      padding: 18px;
      border: 1px solid #dde6ed;
      border-radius: 14px;
      background: #ffffff;
    }
    .metric-card p { margin: 0 0 10px; color: #51606d; font-size: 13px; font-weight: 800; }
    .metric-card strong { display: block; margin-bottom: 10px; color: #003f63; font-size: 30px; }
    .metric-card span { color: #637381; font-size: 12px; }
    .section { break-inside: avoid; margin: 0 0 22px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #dce6ed; border-radius: 12px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #edf2f6; text-align: left; vertical-align: top; font-size: 12px; }
    th { background: #f4f8fb; color: #003f63; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    tr:last-child td { border-bottom: 0; }
    .empty { padding: 14px 16px; border: 1px solid #dce6ed; border-radius: 12px; color: #637381; background: #ffffff; }
    .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #dce6ed; color: #637381; font-size: 11px; }
    @media print {
      .print-actions { display: none; }
      .metric-card, .header, table, .empty { box-shadow: none; }
    }
  </style>
</head>
<body>
  <main class="report">
    <div class="print-actions" style="margin: 0 0 16px; text-align: right;">
      <button onclick="window.print()" style="padding: 10px 16px; border: 0; border-radius: 999px; background: #00466f; color: white; font-weight: 700; cursor: pointer;">Guardar como PDF</button>
    </div>
    <header class="header">
      <div>
        <p class="eyebrow">Educar para Transformar</p>
        <h1>Reporte operativo</h1>
        <p style="margin: 8px 0 0; color: #51606d;">Indicadores y registros activos del campus no docente.</p>
      </div>
      <div>
        <p class="meta"><strong>Generado:</strong> ${escapeHtml(generatedAt)}</p>
        <p class="meta"><strong>Responsable:</strong> ${escapeHtml(generatedBy)}</p>
      </div>
    </header>

    <section class="metrics">${metricCards(rows)}</section>

    ${tableSection("Solicitudes abiertas", "No hay solicitudes pendientes o en revisión.", ["Alumno", "DNI", "Nivel", "Estado", "Contacto"], pendingRequests.map((request) => [
      request.student_full_name,
      request.student_dni,
      request.level,
      REQUEST_STATUS_LABELS[request.status],
      `${request.email} / ${request.contact_phone}`,
    ]))}

    ${tableSection("Tareas administrativas abiertas", "No hay tareas administrativas abiertas.", ["Tarea", "Categoría", "Estado", "Prioridad", "Vence"], openTasks.map((task) => [
      task.title,
      task.category,
      TASK_STATUS_LABELS[task.status],
      task.priority,
      formatDate(task.due_date),
    ]))}

    ${tableSection("Legajos incompletos", "No hay legajos incompletos.", ["Alumno", "Legajo", "DNI", "Email", "Teléfono"], incompleteStudents.map((student) => [
      student.full_name,
      student.student_code,
      student.dni,
      student.email ?? "Sin email",
      student.phone ?? "Sin teléfono",
    ]))}

    ${tableSection("Últimos mensajes de contacto", "No hay mensajes de contacto.", ["Fecha", "Remitente", "Asunto", "Mensaje"], sortedMessages.slice(0, 12).map((message) => [
      formatDate(message.created_at),
      `${message.full_name} / ${message.email}`,
      message.subject,
      message.message,
    ]))}

    <footer class="footer">Reporte generado desde el campus no docente. Los datos corresponden al estado del sistema al momento de la descarga.</footer>
  </main>
</body>
</html>`;
}

export default function NoDocenteReportPdfButton(props: NoDocenteReportPdfButtonProps) {
  const handleDownload = () => {
    const popup = window.open("about:blank", "_blank", "width=1120,height=800");

    if (!popup) {
      window.alert("El navegador bloqueó la ventana de descarga. Permití ventanas emergentes para generar el PDF.");
      return;
    }

    popup.document.open();
    popup.document.write(`<!doctype html><html lang="es"><head><title>Generando reporte</title></head><body style="font-family: Arial, sans-serif; padding: 24px;">Generando reporte...</body></html>`);
    popup.document.close();
    popup.focus();

    const html = buildReportHtml(props);
    popup.setTimeout(() => {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      popup.focus();
      popup.requestAnimationFrame(() => {
        popup.requestAnimationFrame(() => popup.print());
      });
    }, 100);
  };

  return (
    <CTAButton ctaVariant="outline" variant="outline" size="md" w="fit-content" icon={<IconDownload size={16} />} onClick={handleDownload}>
      Descargar PDF
    </CTAButton>
  );
}
