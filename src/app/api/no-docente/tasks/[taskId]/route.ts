import { NextResponse } from "next/server";

import { getRoleFromUser } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pendiente", "en_proceso", "resuelta", "cancelada"] as const;

type TaskStatus = (typeof VALID_STATUSES)[number];

type UpdateTaskPayload = {
  status: TaskStatus;
};

function isValidPayload(payload: unknown): payload is UpdateTaskPayload {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Record<string, unknown>;

  return typeof candidate.status === "string" && VALID_STATUSES.includes(candidate.status as TaskStatus);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ taskId: string }> },
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Tenés que iniciar sesión para actualizar tareas." }, { status: 401 });
  }

  const role = getRoleFromUser(data.user);

  if (role !== "no_docente") {
    return NextResponse.json({ error: "No tenés permisos para actualizar tareas administrativas." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Estado inválido para la tarea." }, { status: 400 });
  }

  const { taskId } = await context.params;
  const taskIdAsNumber = Number(taskId);

  if (!Number.isFinite(taskIdAsNumber)) {
    return NextResponse.json({ error: "El identificador de tarea es inválido." }, { status: 400 });
  }

  const admin = createAdminClient();
  const nextPayload = {
    status: body.status,
    resolved_at: body.status === "resuelta" || body.status === "cancelada" ? new Date().toISOString() : null,
  };

  const { data: task, error: updateError } = await admin
    .from("administrative_tasks")
    .update(nextPayload)
    .eq("id", taskIdAsNumber)
    .select("id, title, description, category, status, priority, due_date, created_at")
    .single();

  if (updateError || !task) {
    return NextResponse.json(
      { error: updateError?.message ?? "No se pudo actualizar la tarea." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, task });
}
