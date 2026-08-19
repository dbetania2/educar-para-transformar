#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const CREDENTIALS_PATH = resolve(ROOT, "supabase/poc_demo_credentials.csv");
const ADMIN_ROLES = new Set(["admin", "administrativo"]);

const PEOPLE = [
  { role: "alumno", legajo: "A000001", firstName: "Sofia", lastName: "Acosta", dni: "45020001", email: "a000001@alumnos.educar.test", phone: "3516000001", birthDate: "2016-04-12", address: "Calle Demo 101" },
  { role: "alumno", legajo: "A000002", firstName: "Mateo", lastName: "Benitez", dni: "45020002", email: "a000002@alumnos.educar.test", phone: "3516000002", birthDate: "2016-07-20", address: "Calle Demo 102" },
  { role: "alumno", legajo: "A000003", firstName: "Valentina", lastName: "Castro", dni: "45020003", email: "a000003@alumnos.educar.test", phone: "3516000003", birthDate: "2017-02-08", address: "Calle Demo 103" },
  { role: "alumno", legajo: "A000004", firstName: "Tomas", lastName: "Diaz", dni: "45020004", email: "a000004@alumnos.educar.test", phone: "3516000004", birthDate: "2017-09-17", address: "Calle Demo 104" },
  { role: "docente", legajo: "D000001", firstName: "Mariana", lastName: "Pereyra", dni: "31010001", email: "d000001@educar.test", phone: "3515001001", birthDate: "1985-05-10", address: "Av. Docente 1", title: "Profesora de Matematica y Ciencias" },
  { role: "docente", legajo: "D000002", firstName: "Lucia", lastName: "Benitez", dni: "31010002", email: "d000002@educar.test", phone: "3515001002", birthDate: "1987-08-22", address: "Av. Docente 2", title: "Profesora de Lengua" },
  { role: "tutor", legajo: "T000001", firstName: "Carolina", lastName: "Fernandez", dni: "52090001", email: "t000001@familias.educar.test", phone: "3517000001", address: "Domicilio Familia Fernandez", linkedStudents: ["A000001"] },
  { role: "tutor", legajo: "T000002", firstName: "Ricardo", lastName: "Gomez", dni: "52090002", email: "t000002@familias.educar.test", phone: "3517000002", address: "Domicilio Familia Gomez", linkedStudents: ["A000002", "A000003", "A000004"] },
  { role: "no_docente", legajo: "N000001", firstName: "Andrea", lastName: "Mansilla", dni: "33090001", email: "n000001@educar.test", phone: "3518100001", address: "Mesa de entrada" },
  { role: "no_docente", legajo: "N000002", firstName: "Pablo", lastName: "Suarez", dni: "33090002", email: "n000002@educar.test", phone: "3518100002", address: "Soporte administrativo" },
];

const COURSES = [
  { subjectCode: "MAT", subjectName: "Matematica", name: "Matematica - 1 Primaria A", teacher: "D000001", classroom: "Aula 1", schedule: "Lunes y miercoles 08:00 a 09:30", students: ["A000001", "A000002", "A000003", "A000004"] },
  { subjectCode: "LEN", subjectName: "Lengua", name: "Lengua - 1 Primaria A", teacher: "D000002", classroom: "Aula 2", schedule: "Martes y jueves 10:00 a 11:30", students: ["A000001", "A000002", "A000003", "A000004"] },
  { subjectCode: "CN", subjectName: "Ciencias Naturales", name: "Ciencias Naturales - Proyecto Huerta", teacher: "D000001", classroom: "Laboratorio", schedule: "Viernes 09:00 a 10:30", students: ["A000001", "A000002", "A000003", "A000004"] },
];

const REQUESTS = [
  { status: "pendiente", student_full_name: "Luciana Demo", student_dni: "98000001", level: "Inicial", responsible_type: "tutor", tutor_full_name: "Mariela Demo", tutor_dni: "97000001", contact_phone: "3519000001", email: "solicitud.pendiente@familias.educar.test", internal_notes: "Pendiente: falta adjuntar documentacion." },
  { status: "en_revision", student_full_name: "Bruno Demo", student_dni: "98000002", level: "Primario", responsible_type: "parents", father_full_name: "Gustavo Demo", father_dni: "97000002", mother_full_name: "Laura Demo", mother_dni: "97000003", contact_phone: "3519000002", email: "solicitud.revision@familias.educar.test", internal_notes: "En revision: validar domicilio y responsable principal." },
  { status: "aprobada", student_full_name: "Martina Demo", student_dni: "98000003", level: "Secundario", responsible_type: "tutor", tutor_full_name: "Paula Demo", tutor_dni: "97000004", contact_phone: "3519000003", email: "solicitud.aprobada@familias.educar.test", internal_notes: "Aprobada para mostrar cierre administrativo." },
  { status: "rechazada", student_full_name: "Tomas Demo", student_dni: "98000004", level: "Primario", responsible_type: "parents", father_full_name: "Sergio Demo", father_dni: "97000005", mother_full_name: "Noelia Demo", mother_dni: "97000006", contact_phone: "3519000004", email: "solicitud.rechazada@familias.educar.test", internal_notes: "Rechazada por cupo completo." },
];

const TASKS = [
  { title: "Validar solicitud pendiente", description: "Revisar DNI del responsable y documentacion inicial.", category: "solicitud", status: "pendiente", priority: "alta", due_date: "2026-06-05" },
  { title: "Completar legajo de Bruno Demo", description: "Confirmar contacto alternativo antes de aprobar.", category: "legajo", status: "en_proceso", priority: "media", due_date: "2026-06-07" },
  { title: "Responder consulta por cupo", description: "Enviar respuesta institucional a familia rechazada.", category: "comunicacion", status: "pendiente", priority: "media", due_date: "2026-06-04" },
  { title: "Archivar solicitud aprobada", description: "Caso resuelto para historial operativo.", category: "solicitud", status: "resuelta", priority: "baja", due_date: "2026-06-01", resolved_at: "2026-06-01T15:00:00.000Z" },
];

const CONTACTS = [
  { full_name: "Familia Consulta Demo", email: "consulta.demo@familias.educar.test", phone: "3519100001", subject: "Consulta por vacantes", message: "Mensaje demo para alimentar reportes." },
  { full_name: "Proveedor Demo", email: "proveedor.demo@educar.test", phone: "3519100002", subject: "Soporte administrativo", message: "Consulta demo de soporte administrativo." },
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith(String.fromCharCode(34)) && value.endsWith(String.fromCharCode(34))) || (value.startsWith(String.fromCharCode(39)) && value.endsWith(String.fromCharCode(39)))) value = value.slice(1, -1);
    process.env[key] ??= value;
  }
}

function fullName(person) {
  return (person.firstName + " " + person.lastName).trim();
}

function firstItem(value) {
  return Array.isArray(value) ? value[0] : value;
}

async function listAllUsers(supabase) {
  const users = [];
  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("No se pudieron listar usuarios Auth: " + error.message);
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < 1000) break;
  }
  return users;
}

async function getAdminAuthUserIds(supabase) {
  const ids = new Set();
  const users = await listAllUsers(supabase);
  for (const user of users) {
    const role = String(user.app_metadata?.role ?? user.user_metadata?.role ?? "").trim().toLowerCase();
    if (ADMIN_ROLES.has(role)) ids.add(user.id);
  }
  const { data, error } = await supabase.from("profile_roles").select("role_code, profiles!inner(auth_user_id)").in("role_code", [...ADMIN_ROLES]);
  if (error) throw new Error("No se pudieron detectar admins: " + error.message);
  for (const row of data ?? []) {
    const profile = firstItem(row.profiles);
    if (profile?.auth_user_id) ids.add(profile.auth_user_id);
  }
  return ids;
}

async function deleteNonAdminAuthUsers(supabase) {
  const [users, adminIds] = await Promise.all([listAllUsers(supabase), getAdminAuthUserIds(supabase)]);
  let deleted = 0;
  for (const user of users) {
    if (adminIds.has(user.id)) continue;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error("No se pudo borrar Auth " + (user.email ?? user.id) + ": " + error.message);
    deleted += 1;
  }
  return deleted;
}

async function cleanupPublicData(supabase) {
  const adminProfiles = await supabase.from("profile_roles").select("profile_id").in("role_code", [...ADMIN_ROLES]);
  if (adminProfiles.error) throw new Error("No se pudieron detectar perfiles admin: " + adminProfiles.error.message);
  const adminProfileIds = (adminProfiles.data ?? []).map((row) => row.profile_id);

  for (const table of ["course_forum_posts", "course_forum_threads", "course_materials", "attendance_records", "class_sessions", "grades", "assessments", "course_enrollments", "course_teachers", "courses", "student_guardians", "students", "teachers", "administrative_tasks", "contact_messages", "inscription_requests", "subjects", "academic_terms"]) {
    const { error } = await supabase.from(table).delete().neq("id", -1);
    if (error && !String(error.message).includes("does not exist")) throw new Error("No se pudo limpiar " + table + ": " + error.message);
  }

  if (adminProfileIds.length > 0) {
    await supabase.from("profile_roles").delete().not("profile_id", "in", "(" + adminProfileIds.join(",") + ")");
    await supabase.from("profiles").delete().not("id", "in", "(" + adminProfileIds.join(",") + ")");
  } else {
    await supabase.from("profile_roles").delete().neq("role_code", "__none__");
    await supabase.from("profiles").delete().neq("dni", "__none__");
  }
}

async function ensureAppRoles(supabase) {
  const roles = [
    { code: "admin", label: "Administrador" },
    { code: "administrativo", label: "Administrativo" },
    { code: "alumno", label: "Alumno" },
    { code: "docente", label: "Docente" },
    { code: "tutor", label: "Tutor" },
    { code: "no_docente", label: "No docente" },
  ];
  const { error } = await supabase.from("app_roles").upsert(roles, { onConflict: "code" });
  if (error) throw new Error("No se pudieron asegurar roles: " + error.message);
}

async function createProfileAndAuth(supabase, person) {
  const profileInsert = await supabase.from("profiles").insert({
    first_name: person.firstName,
    last_name: person.lastName,
    dni: person.dni,
    email: person.email,
    phone: person.phone ?? null,
    birth_date: person.birthDate ?? null,
    address: person.address ?? null,
    is_active: true,
  }).select("id").single();
  if (profileInsert.error) throw new Error("No se pudo crear perfil " + person.legajo + ": " + profileInsert.error.message);

  const metadata = { role: person.role, legajo: person.legajo, dni: person.dni };
  const authResult = await supabase.auth.admin.createUser({
    email: person.email,
    password: person.dni,
    email_confirm: true,
    app_metadata: metadata,
    user_metadata: { ...metadata, full_name: fullName(person) },
  });
  if (authResult.error || !authResult.data.user) throw new Error("No se pudo crear Auth " + person.legajo + ": " + (authResult.error?.message ?? "sin usuario"));

  const updateProfile = await supabase.from("profiles").update({ auth_user_id: authResult.data.user.id }).eq("id", profileInsert.data.id);
  if (updateProfile.error) throw new Error("No se pudo vincular Auth " + person.legajo + ": " + updateProfile.error.message);

  const roleInsert = await supabase.from("profile_roles").insert({ profile_id: profileInsert.data.id, role_code: person.role });
  if (roleInsert.error) throw new Error("No se pudo asignar rol " + person.legajo + ": " + roleInsert.error.message);

  return { ...person, profileId: profileInsert.data.id, authUserId: authResult.data.user.id };
}

async function createPeople(supabase) {
  const created = new Map();
  for (const person of PEOPLE) {
    const item = await createProfileAndAuth(supabase, person);
    created.set(person.legajo, item);
  }

  for (const person of created.values()) {
    if (person.role === "alumno") {
      const { error } = await supabase.from("students").insert({ profile_id: person.profileId, student_code: person.legajo, current_status: "activo", admission_date: "2026-03-02" });
      if (error) throw new Error("No se pudo crear alumno " + person.legajo + ": " + error.message);
    }
    if (person.role === "docente") {
      const { error } = await supabase.from("teachers").insert({ profile_id: person.profileId, teacher_code: person.legajo, title: person.title, hire_date: "2026-02-15" });
      if (error) throw new Error("No se pudo crear docente " + person.legajo + ": " + error.message);
    }
  }

  for (const tutor of [...created.values()].filter((person) => person.role === "tutor")) {
    for (const [index, studentCode] of tutor.linkedStudents.entries()) {
      const student = created.get(studentCode);
      const { error } = await supabase.from("student_guardians").insert({ student_profile_id: student.profileId, guardian_profile_id: tutor.profileId, relationship_type: "tutor", is_primary: index === 0 });
      if (error) throw new Error("No se pudo vincular " + tutor.legajo + " con " + studentCode + ": " + error.message);
    }
  }

  return created;
}

async function createCourses(supabase, people) {
  const term = await supabase.from("academic_terms").insert({ name: "Ciclo lectivo POC", year: 2026, starts_on: "2026-03-02", ends_on: "2026-12-18", is_active: true }).select("id").single();
  if (term.error) throw new Error("No se pudo crear ciclo lectivo: " + term.error.message);

  const subjects = new Map();
  for (const course of COURSES) {
    if (subjects.has(course.subjectCode)) continue;
    const subject = await supabase.from("subjects").insert({ code: course.subjectCode, name: course.subjectName, description: "Materia POC para demo comercial.", is_active: true }).select("id").single();
    if (subject.error) throw new Error("No se pudo crear materia " + course.subjectCode + ": " + subject.error.message);
    subjects.set(course.subjectCode, subject.data.id);
  }

  const courseRows = [];
  for (const courseSeed of COURSES) {
    const teacher = people.get(courseSeed.teacher);
    const course = await supabase.from("courses").insert({ subject_id: subjects.get(courseSeed.subjectCode), academic_term_id: term.data.id, teacher_profile_id: teacher.profileId, name: courseSeed.name, commission: "A", classroom: courseSeed.classroom, schedule_summary: courseSeed.schedule, status: "activa" }).select("id, name").single();
    if (course.error) throw new Error("No se pudo crear curso " + courseSeed.name + ": " + course.error.message);
    courseRows.push({ ...courseSeed, id: course.data.id });
    await supabase.from("course_teachers").insert({ course_id: course.data.id, teacher_profile_id: teacher.profileId, role_in_course: "titular" });
    await supabase.from("course_enrollments").insert(courseSeed.students.map((code) => ({ course_id: course.data.id, student_profile_id: people.get(code).profileId, enrollment_status: "activa", enrolled_at: "2026-03-02T12:00:00.000Z" })));

    const assessment = await supabase.from("assessments").insert({ course_id: course.data.id, title: "Evaluacion POC", description: "Evaluacion de muestra para demo.", evaluation_type: "evaluacion", max_score: 10, evaluated_at: "2026-05-20", created_by: teacher.profileId }).select("id").single();
    if (assessment.error) throw new Error("No se pudo crear evaluacion: " + assessment.error.message);
    await supabase.from("grades").insert(courseSeed.students.map((code, index) => ({ assessment_id: assessment.data.id, student_profile_id: people.get(code).profileId, score: 7 + (index % 3), approved: true, teacher_comment: "Seguimiento positivo en demo.", recorded_by: teacher.profileId })));

    const sessions = ["2026-05-06", "2026-05-13", "2026-05-20"];
    for (const [sessionIndex, date] of sessions.entries()) {
      const session = await supabase.from("class_sessions").insert({ course_id: course.data.id, session_date: date, topic: "Clase POC " + (sessionIndex + 1), created_by: teacher.profileId }).select("id").single();
      if (session.error) throw new Error("No se pudo crear clase: " + session.error.message);
      const statuses = ["presente", "presente", sessionIndex === 1 ? "ausente" : "tarde", "justificada"];
      await supabase.from("attendance_records").insert(courseSeed.students.map((code, index) => ({ class_session_id: session.data.id, student_profile_id: people.get(code).profileId, status: statuses[index], notes: statuses[index] === "presente" ? null : "Registro de muestra para demo.", recorded_by: teacher.profileId })));
    }

    await supabase.from("course_materials").insert({ course_id: course.data.id, title: "Material inicial", description: "Recurso de ejemplo para el curso.", resource_url: "https://educar.test/materiales/poc.pdf", material_type: "pdf", created_by: teacher.profileId });
  }

  return courseRows;
}

async function createRequestsTasksAndReportsData(supabase, people) {
  for (const request of REQUESTS) {
    const payload = {
      ...request,
      tutor_full_name: request.tutor_full_name ?? null,
      tutor_dni: request.tutor_dni ?? null,
      father_full_name: request.father_full_name ?? null,
      father_dni: request.father_dni ?? null,
      mother_full_name: request.mother_full_name ?? null,
      mother_dni: request.mother_dni ?? null,
      reviewed_at: request.status === "pendiente" ? null : new Date().toISOString(),
      reviewed_by: request.status === "pendiente" ? null : "demo",
    };
    const { error } = await supabase.from("inscription_requests").insert(payload);
    if (error) throw new Error("No se pudo crear solicitud " + request.status + ": " + error.message);
  }

  const noDocente = people.get("N000001");
  for (const task of TASKS) {
    const { error } = await supabase.from("administrative_tasks").insert({ ...task, assigned_profile_id: noDocente.profileId, created_by_profile_id: noDocente.profileId, resolved_at: task.resolved_at ?? null });
    if (error) throw new Error("No se pudo crear tarea " + task.title + ": " + error.message);
  }

  const { error } = await supabase.from("contact_messages").insert(CONTACTS);
  if (error) throw new Error("No se pudieron crear mensajes de contacto: " + error.message);
}

function writeCredentials(people) {
  const quote = String.fromCharCode(34);
  const rows = ["role,legajo,email,password,dni,full_name"];
  for (const person of people.values()) {
    rows.push([person.role, person.legajo, person.email, person.dni, person.dni, quote + fullName(person).replaceAll(quote, quote + quote) + quote].join(","));
  }
  writeFileSync(CREDENTIALS_PATH, rows.join("\n") + "\n");
}

async function verify(supabase) {
  const roles = await supabase.from("profile_roles").select("role_code, profiles!inner(auth_user_id)").in("role_code", ["alumno", "docente", "tutor", "no_docente"]);
  if (roles.error) throw new Error("No se pudo verificar roles: " + roles.error.message);
  const counts = {};
  const authCounts = {};
  for (const row of roles.data ?? []) {
    counts[row.role_code] = (counts[row.role_code] ?? 0) + 1;
    const profile = firstItem(row.profiles);
    if (profile?.auth_user_id) authCounts[row.role_code] = (authCounts[row.role_code] ?? 0) + 1;
  }

  const links = await supabase.from("student_guardians").select("id", { count: "exact", head: true });
  const requests = await supabase.from("inscription_requests").select("status");
  const tasks = await supabase.from("administrative_tasks").select("status");
  return {
    roles: counts,
    auth: authCounts,
    tutorLinks: links.count ?? 0,
    requests: (requests.data ?? []).reduce((acc, row) => ({ ...acc, [row.status]: (acc[row.status] ?? 0) + 1 }), {}),
    tasks: (tasks.data ?? []).reduce((acc, row) => ({ ...acc, [row.status]: (acc[row.status] ?? 0) + 1 }), {}),
  };
}

async function main() {
  loadEnvFile(resolve(ROOT, ".env.local"));
  loadEnvFile(resolve(ROOT, ".env"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.");
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const deletedAuth = await deleteNonAdminAuthUsers(supabase);
  await cleanupPublicData(supabase);
  await ensureAppRoles(supabase);
  const people = await createPeople(supabase);
  const courses = await createCourses(supabase, people);
  await createRequestsTasksAndReportsData(supabase, people);
  writeCredentials(people);
  const summary = await verify(supabase);

  console.log("POC demo lista.");
  console.log("Auth no-admin eliminados antes de recrear: " + deletedAuth + ".");
  console.log("Usuarios demo: " + people.size + ". Cursos: " + courses.length + ".");
  console.log(JSON.stringify(summary, null, 2));
  console.log("Credenciales: " + CREDENTIALS_PATH);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
