import { redirect } from "next/navigation";

import { buildFullName } from "@/lib/academicProfiles";
import {
  getNoDocenteHomePath,
  getNoDocenteHomePathBySlug,
  getNoDocenteSectionPathBySlug,
  getNoDocenteSlug,
  getProtectedHomePathForUser,
  getRoleFromUser,
  type NoDocenteSection,
} from "@/lib/auth/roles";
import { formatDate } from "@/lib/studentDashboardShared";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type NoDocenteTaskRecord = {
  id: number;
  title: string;
  description: string | null;
  category: "solicitud" | "legajo" | "asistencia" | "comunicacion" | "soporte" | "otro";
  status: "pendiente" | "en_proceso" | "resuelta" | "cancelada";
  priority: "baja" | "media" | "alta";
  due_date: string | null;
  created_at: string;
};

export type StudentRecord = {
  profile_id: string;
  full_name: string;
  dni: string;
  email: string | null;
  phone: string | null;
  student_code: string;
  current_status: string;
  active_courses: number;
};

export type ContactMessageRecord = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
};

export type RequestRecord = {
  id: number;
  student_full_name: string;
  student_dni: string;
  level: string;
  responsible_type: "tutor" | "parents";
  tutor_full_name: string | null;
  father_full_name: string | null;
  mother_full_name: string | null;
  contact_phone: string;
  email: string;
  status: "pendiente" | "en_revision" | "aprobada" | "rechazada";
  internal_notes: string | null;
  created_at: string;
};

export type RouteContext = {
  user: {
    id: string;
    email: string | null;
    lastSignInAt: string | null;
  };
  slug: string;
  displayName: string;
};

export type NoDocenteOverview = {
  pendingRequests: number;
  reviewRequests: number;
  pendingTasks: number;
  activeStudents: number;
  activeTutors: number;
  activeTeachers: number;
  activeAdmins: number;
  activeNoDocentes: number;
  incompleteProfiles: number;
  contactMessages: number;
  recentTasks: NoDocenteTaskRecord[];
};

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table")
  );
}

function failOnUnexpectedQueryError(error: { message?: string } | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message ?? fallbackMessage);
  }
}

async function getNoDocenteProfileName(authUserId: string) {
  const supabase = createAdminClient();
  const query = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (query.error && query.error.code !== "PGRST116") {
    failOnUnexpectedQueryError(query.error, "No se pudo obtener el perfil no docente.");
  }

  return buildFullName(query.data?.first_name, query.data?.last_name);
}

export async function requireNoDocenteRouteContext(slug: string): Promise<NoDocenteRouteContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/");
  }

  if (getRoleFromUser(data.user) !== "no_docente") {
    redirect(getProtectedHomePathForUser(data.user) ?? "/");
  }

  const expectedSlug = getNoDocenteSlug(data.user);

  if (slug !== expectedSlug) {
    redirect(getNoDocenteHomePath(data.user));
  }

  const fallbackName =
    typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim().length > 0
      ? data.user.user_metadata.full_name.trim()
      : "No docente";

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
      lastSignInAt: data.user.last_sign_in_at ?? null,
    },
    slug: expectedSlug,
    displayName: await getNoDocenteProfileName(data.user.id) || fallbackName,
  };
}

export async function getNoDocenteTasks(slug: string) {
  await requireNoDocenteRouteContext(slug);
  const supabase = createAdminClient();
  const query = await supabase
    .from("administrative_tasks")
    .select("id, title, description, category, status, priority, due_date, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (isMissingRelationError(query.error)) return [] as NoDocenteTaskRecord[];
  failOnUnexpectedQueryError(query.error, "No se pudieron obtener las tareas administrativas.");

  return (query.data ?? []) as NoDocenteTaskRecord[];
}

export async function getNoDocenteStudents(slug: string) {
  await requireNoDocenteRouteContext(slug);
  const supabase = createAdminClient();
  const query = await supabase
    .from("students")
    .select("profile_id, student_code, current_status, profiles!inner ( first_name, last_name, dni, email, phone ), course_enrollments ( enrollment_status )")
    .eq("current_status", "activo")
    .eq("profiles.is_active", true)
    .order("student_code", { ascending: true });

  failOnUnexpectedQueryError(query.error, "No se pudieron obtener los legajos de alumnos.");

  return ((query.data ?? []) as Array<{
    profile_id: string;
    student_code: string;
    current_status: string;
    profiles: { first_name: string; last_name: string; dni: string; email: string | null; phone: string | null } | Array<{ first_name: string; last_name: string; dni: string; email: string | null; phone: string | null }>;
    course_enrollments: Array<{ enrollment_status: string }> | null;
  }>).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

    return {
      profile_id: row.profile_id,
      full_name: buildFullName(profile.first_name, profile.last_name),
      dni: profile.dni,
      email: profile.email,
      phone: profile.phone,
      student_code: row.student_code,
      current_status: row.current_status,
      active_courses: (row.course_enrollments ?? []).filter((enrollment) => enrollment.enrollment_status === "activa").length,
    };
  });
}

export async function getNoDocenteRequests(slug: string) {
  await requireNoDocenteRouteContext(slug);
  const supabase = createAdminClient();
  const query = await supabase
    .from("inscription_requests")
    .select("id, student_full_name, student_dni, level, responsible_type, tutor_full_name, father_full_name, mother_full_name, contact_phone, email, status, internal_notes, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (isMissingRelationError(query.error)) return [] as NoDocenteRequestRecord[];
  failOnUnexpectedQueryError(query.error, "No se pudieron obtener las solicitudes.");

  return (query.data ?? []) as NoDocenteRequestRecord[];
}

export async function getNoDocenteContactMessages(slug: string) {
  await requireNoDocenteRouteContext(slug);
  const supabase = createAdminClient();
  const query = await supabase
    .from("contact_messages")
    .select("id, full_name, email, phone, subject, message, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (isMissingRelationError(query.error)) return [] as NoDocenteContactMessageRecord[];
  failOnUnexpectedQueryError(query.error, "No se pudieron obtener los mensajes de contacto.");

  return (query.data ?? []) as NoDocenteContactMessageRecord[];
}

export async function getNoDocenteOverview(slug: string): Promise<NoDocenteOverview> {
  await requireNoDocenteRouteContext(slug);
  const supabase = createAdminClient();
  const [requestsQuery, studentsQuery, tutorsQuery, teachersQuery, adminsQuery, noDocentesQuery, contactQuery, tasks, students] = await Promise.all([
    supabase.from("inscription_requests").select("status", { count: "exact" }).in("status", ["pendiente", "en_revision"]),
    supabase.from("students").select("profile_id, profiles!inner(id)", { count: "exact", head: true }).eq("current_status", "activo").eq("profiles.is_active", true),
    supabase.from("profile_roles").select("profiles!inner(id)", { count: "exact", head: true }).eq("role_code", "tutor").eq("profiles.is_active", true),
    supabase.from("teachers").select("profile_id, profiles!inner(id)", { count: "exact", head: true }).eq("profiles.is_active", true),
    supabase.from("profile_roles").select("profiles!inner(id)", { count: "exact", head: true }).in("role_code", ["admin", "administrativo"]).eq("profiles.is_active", true),
    supabase.from("profile_roles").select("profiles!inner(id)", { count: "exact", head: true }).eq("role_code", "no_docente").eq("profiles.is_active", true),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    getNoDocenteTasks(slug),
    getNoDocenteStudents(slug),
  ]);

  failOnUnexpectedQueryError(requestsQuery.error, "No se pudieron contar las solicitudes.");
  failOnUnexpectedQueryError(studentsQuery.error, "No se pudieron contar los alumnos.");
  failOnUnexpectedQueryError(tutorsQuery.error, "No se pudieron contar los tutores.");
  failOnUnexpectedQueryError(teachersQuery.error, "No se pudieron contar los docentes.");
  failOnUnexpectedQueryError(adminsQuery.error, "No se pudieron contar los administradores.");
  failOnUnexpectedQueryError(noDocentesQuery.error, "No se pudieron contar los no docentes.");
  failOnUnexpectedQueryError(contactQuery.error, "No se pudieron contar los mensajes de contacto.");

  const requestRows = (requestsQuery.data ?? []) as Array<{ status: string }>;
  return {
    pendingRequests: requestRows.filter((row) => row.status === "pendiente").length,
    reviewRequests: requestRows.filter((row) => row.status === "en_revision").length,
    pendingTasks: tasks.filter((task) => task.status === "pendiente" || task.status === "en_proceso").length,
    activeStudents: studentsQuery.count ?? 0,
    activeTutors: tutorsQuery.count ?? 0,
    activeTeachers: teachersQuery.count ?? 0,
    activeAdmins: adminsQuery.count ?? 0,
    activeNoDocentes: noDocentesQuery.count ?? 0,
    incompleteProfiles: students.filter((student) => !student.email || !student.phone).length,
    contactMessages: contactQuery.count ?? 0,
    recentTasks: tasks.slice(0, 5),
  };
}

export function formatNoDocenteHomePath(slug: string) {
  return getNoDocenteHomePathBySlug(slug);
}

export function formatNoDocenteSectionPath(slug: string, section: NoDocenteSection) {
  return getNoDocenteSectionPathBySlug(slug, section);
}

export { formatDate };
