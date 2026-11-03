import { NextResponse } from "next/server";

import { getAdminClientWithGuard } from "@/lib/auth/adminAccess";

function hasWorkflowColumnsError(error: { code?: string; message?: string } | null) {
  const normalizedMessage = error?.message?.toLowerCase() ?? "";

  return (
    error?.code === "42703" ||
    normalizedMessage.includes("status does not exist") ||
    normalizedMessage.includes("internal_notes does not exist") ||
    normalizedMessage.includes("reviewed_at does not exist") ||
    normalizedMessage.includes("reviewed_by does not exist")
  );
}

export async function GET() {
  const access = await getAdminClientWithGuard();

  if ("error" in access) {
    return access.error;
  }

  const [requestsQuery, coursesQuery] = await Promise.all([
    access.supabase
      .from("inscription_requests")
      .select(
        `
          id,
          student_full_name,
          student_dni,
          level,
          responsible_type,
          tutor_full_name,
          tutor_dni,
          father_full_name,
          father_dni,
          mother_full_name,
          mother_dni,
          contact_phone,
          email,
          status,
          internal_notes,
          reviewed_at,
          reviewed_by,
          created_at
        `,
      )
      .order("created_at", { ascending: false }),
    access.supabase
      .from("courses")
      .select("id, name, commission, subjects ( name )")
      .eq("status", "activa")
      .order("name", { ascending: true }),
  ]);

  const { data, error } = requestsQuery;
  const availableCourses = (
    (coursesQuery.data ?? []) as Array<{
      id: number;
      name: string;
      commission: string | null;
      subjects: { name: string } | Array<{ name: string }> | null;
    }>
  ).map((course) => {
    const subject = Array.isArray(course.subjects) ? course.subjects[0] : course.subjects;
    const subjectLabel = subject?.name && subject.name !== course.name ? ` · ${subject.name}` : "";
    const commissionLabel = course.commission ? ` (${course.commission})` : "";
    return {
      value: String(course.id),
      label: `${course.name}${commissionLabel}${subjectLabel}`,
    };
  });

  if (hasWorkflowColumnsError(error)) {
    const fallback = await access.supabase
      .from("inscription_requests")
      .select(
        `
          id,
          student_full_name,
          student_dni,
          level,
          responsible_type,
          tutor_full_name,
          tutor_dni,
          father_full_name,
          father_dni,
          mother_full_name,
          mother_dni,
          contact_phone,
          email,
          created_at
        `,
      )
      .order("created_at", { ascending: false });

    if (fallback.error) {
      return NextResponse.json(
        { error: fallback.error.message ?? "No se pudieron obtener las solicitudes." },
        { status: 500 },
      );
    }

    const requests = (fallback.data ?? []).map((request) => ({
      ...request,
      status: "pendiente",
      internal_notes: null,
      reviewed_at: null,
      reviewed_by: null,
    }));

    return NextResponse.json(
      {
        requests,
        code: "ADMIN_REQUESTS_MIGRATION_REQUIRED",
        workflowEnabled: false,
        schemaWarning:
          "La tabla inscription_requests todavía no tiene columnas de seguimiento administrativo. Aplicá la migración correspondiente en Supabase para habilitar estados, notas internas y auditoría.",
      },
      { status: 409 },
    );
  }

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "No se pudieron obtener las solicitudes." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    requests: data ?? [],
    availableCourses,
    workflowEnabled: true,
  });
}
