import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";

export type AdminNotificationPayload = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type: "request" | "message" | "system";
  category: string;
  href?: string;
};

export async function GET() {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const [requestsQuery, messagesQuery, auditQuery, receiptsQuery] = await Promise.all([
    // 1. Solicitudes de inscripción pendientes de revisión
    access.supabase
      .from("inscription_requests")
      .select("id, student_full_name, level, created_at, status")
      .eq("status", "pendiente")
      .order("created_at", { ascending: false })
      .limit(5),

    // 2. Mensajes de contacto recientes
    access.supabase
      .from("contact_messages")
      .select("id, full_name, subject, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    // 3. Registros de auditoría / sistema recientes
    access.supabase
      .from("audit_logs")
      .select("id, action, entity_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    // 4. Comprobantes de pago en revisión enviados desde la app móvil
    access.supabase
      .from("comprobantes_pago")
      .select("id, total, archivo_nombre, created_at, estado_validacion")
      .eq("estado_validacion", "En Revisión")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const notifications: AdminNotificationPayload[] = [];

  // Mapear solicitudes de inscripción reales
  if (requestsQuery.data) {
    for (const req of requestsQuery.data) {
      notifications.push({
        id: `req-${req.id}`,
        title: "Solicitud de inscripción pendiente",
        description: `${req.student_full_name} (${req.level}) aguarda revisión.`,
        created_at: req.created_at,
        type: "request",
        category: "Admisiones",
        href: "/admin/solicitudes",
      });
    }
  }

  // Mapear consultas de contacto web reales
  if (messagesQuery.data) {
    for (const msg of messagesQuery.data) {
      notifications.push({
        id: `msg-${msg.id}`,
        title: `Consulta: ${msg.subject || "Contacto web"}`,
        description: `${msg.full_name}: "${(msg.message || "").slice(0, 70)}..."`,
        created_at: msg.created_at,
        type: "message",
        category: "Contacto Web",
        href: "/admin/solicitudes",
      });
    }
  }

  // Mapear actividades de auditoría reales
  if (auditQuery.data) {
    for (const audit of auditQuery.data) {
      const actionName = (audit.action || "").replace(/_/g, " ");
      notifications.push({
        id: `audit-${audit.id}`,
        title: "Actividad administrativa",
        description: `Acción: ${actionName} en ${audit.entity_name}.`,
        created_at: audit.created_at,
        type: "system",
        category: "Sistema",
      });
    }
  }

  // Mapear comprobantes de pago en revisión enviados desde la app móvil
  if (receiptsQuery.data) {
    for (const receipt of receiptsQuery.data) {
      const formattedTotal = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(Number(receipt.total ?? 0));
      notifications.push({
        id: `receipt-${receipt.id}`,
        title: `Comprobante de pago #${receipt.id} en revisión`,
        description: `Importe declarado: ${formattedTotal} (${receipt.archivo_nombre}).`,
        created_at: receipt.created_at,
        type: "request",
        category: "Pagos y Cobranzas",
        href: "/admin/pagos",
      });
    }
  }

  // Ordenar cronológicamente descendente (más recientes primero)
  notifications.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return NextResponse.json({ notifications });
}

