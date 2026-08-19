#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const CREDENTIALS_PATH = resolve(ROOT, "supabase/seed_test_credentials.csv");
const STUDENTS = [
  { code: "A900001", dni: "99000001", firstName: "Sofia", lastName: "Acosta", email: "sofia.acosta.test@educar.local" },
  { code: "A900002", dni: "99000002", firstName: "Mateo", lastName: "Benitez", email: "mateo.benitez.test@educar.local" },
  { code: "A900003", dni: "99000003", firstName: "Valentina", lastName: "Castro", email: "valentina.castro.test@educar.local" },
  { code: "A900004", dni: "99000004", firstName: "Tomas", lastName: "Diaz", email: "tomas.diaz.test@educar.local" },
];

const TEACHERS = [
  { code: "D900001", dni: "99100001", firstName: "Camila", lastName: "Sosa", email: "camila.sosa.test@educar.local", title: "Docente inicial" },
  { code: "D900002", dni: "99100002", firstName: "Lucia", lastName: "Benitez", email: "lucia.benitez.test@educar.local", title: "Docente primaria" },
];

const TUTORS = [
  { code: "T900001", dni: "99200001", firstName: "Tutor", lastName: "Acosta", email: "tutor.acosta.test@educar.local", links: ["A900001"] },
  { code: "T900002", dni: "99200002", firstName: "Tutor", lastName: "Familia", email: "tutor.familia.test@educar.local", links: ["A900001", "A900002", "A900003"] },
  { code: "T900003", dni: "99200003", firstName: "Tutor", lastName: "Diaz", email: "tutor.diaz.test@educar.local", links: ["A900004"] },
];

const SUBJECTS = [
  { code: "TEST-MOT", name: "TEST Juego y Motricidad", description: "Materia de prueba para inicial." },
  { code: "TEST-LEN", name: "TEST Lengua", description: "Materia de prueba para primaria." },
  { code: "TEST-MAT", name: "TEST Matematica", description: "Materia de prueba para primaria." },
];

const COURSES = [
  { key: "motricidad-s4", subjectCode: "TEST-MOT", teacherCode: "D900001", name: "TEST Juego y Motricidad - Sala de 4", commission: "Sala de 4", classroom: "Aula 1", schedule: "Miercoles 11:00 a 12:20", students: ["A900001", "A900002", "A900003"] },
  { key: "lengua-1a", subjectCode: "TEST-LEN", teacherCode: "D900002", name: "TEST Lengua - 1 Primaria A", commission: "1 Primaria A", classroom: "Aula 3", schedule: "Martes 09:30 a 10:50", students: ["A900004"] },
  { key: "matematica-1a", subjectCode: "TEST-MAT", teacherCode: "D900002", name: "TEST Matematica - 1 Primaria A", commission: "1 Primaria A", classroom: "Aula 3", schedule: "Jueves 08:00 a 09:20", students: ["A900004"] },
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] ??= value;
  }
}

function fullName(person) {
  return (person.firstName + " " + person.lastName).trim();
}

function assertNoError(result, message) {
  if (result.error) throw new Error(message + ": " + result.error.message);
  return result.data;
}

async function listAllUsers(supabase) {
  const users = [];
  const perPage = 1000;
  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error("No se pudieron listar usuarios Auth: " + error.message);
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < perPage) break;
  }
  return users;
}

function getLegajo(user) {
  const value = user.app_metadata?.legajo ?? user.user_metadata?.legajo;
  return typeof value === "string" ? value.trim().toUpperCase() : null;
}

async function deleteAuthUsersByLegajo(supabase, legajos) {
  const wanted = new Set(legajos);
  const users = await listAllUsers(supabase);
  for (const user of users) {
    if (!wanted.has(getLegajo(user))) continue;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error("No se pudo borrar usuario Auth " + user.email + ": " + error.message);
  }
}

async function deleteRows(supabase, table, column, values) {
  if (values.length === 0) return;
  const { error } = await supabase.from(table).delete().in(column, values);
  if (error) throw new Error("No se pudo limpiar " + table + ": " + error.message);
}

async function cleanupTestData(supabase) {
  const subjectCodes = SUBJECTS.map((subject) => subject.code);
  const profileDnis = [...STUDENTS, ...TEACHERS, ...TUTORS].map((person) => person.dni);
  const authLegajos = [...STUDENTS.map((item) => item.code), ...TEACHERS.map((item) => item.code), ...TUTORS.map((item) => item.code)];

  const { data: subjects, error: subjectsError } = await supabase.from("subjects").select("id").in("code", subjectCodes);
  if (subjectsError) throw new Error("No se pudieron leer materias test: " + subjectsError.message);
  const subjectIds = (subjects ?? []).map((subject) => subject.id);

  let courseIds = [];
  if (subjectIds.length > 0) {
    const { data: courses, error: coursesError } = await supabase.from("courses").select("id").in("subject_id", subjectIds);
    if (coursesError) throw new Error("No se pudieron leer cursos test: " + coursesError.message);
    courseIds = (courses ?? []).map((course) => course.id);
  }

  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id").in("dni", profileDnis);
  if (profilesError) throw new Error("No se pudieron leer perfiles test: " + profilesError.message);
  const profileIds = (profiles ?? []).map((profile) => profile.id);

  if (courseIds.length > 0) {
    const { data: sessions, error: sessionsError } = await supabase.from("class_sessions").select("id").in("course_id", courseIds);
    if (sessionsError) throw new Error("No se pudieron leer clases test: " + sessionsError.message);
    const { data: assessments, error: assessmentsError } = await supabase.from("assessments").select("id").in("course_id", courseIds);
    if (assessmentsError) throw new Error("No se pudieron leer evaluaciones test: " + assessmentsError.message);

    await deleteRows(supabase, "tutor_teacher_messages", "course_id", courseIds);
    await deleteRows(supabase, "course_materials", "course_id", courseIds);
    await deleteRows(supabase, "attendance_records", "class_session_id", (sessions ?? []).map((row) => row.id));
    await deleteRows(supabase, "class_sessions", "course_id", courseIds);
    await deleteRows(supabase, "grades", "assessment_id", (assessments ?? []).map((row) => row.id));
    await deleteRows(supabase, "assessments", "course_id", courseIds);
    await deleteRows(supabase, "course_enrollments", "course_id", courseIds);
    await deleteRows(supabase, "course_teachers", "course_id", courseIds);
    await deleteRows(supabase, "courses", "id", courseIds);
  }

  if (profileIds.length > 0) {
    await deleteRows(supabase, "student_guardians", "student_profile_id", profileIds);
    await deleteRows(supabase, "student_guardians", "guardian_profile_id", profileIds);
    await deleteRows(supabase, "profile_roles", "profile_id", profileIds);
    await deleteRows(supabase, "students", "profile_id", profileIds);
    await deleteRows(supabase, "teachers", "profile_id", profileIds);
    await deleteRows(supabase, "profiles", "id", profileIds);
  }

  await deleteRows(supabase, "subjects", "id", subjectIds);
  await deleteAuthUsersByLegajo(supabase, authLegajos);
}

async function ensureAuthUser(supabase, profile, role, legajo) {
  const email = profile.email.trim().toLowerCase();
  const users = await listAllUsers(supabase);
  const existing = users.find((user) => user.email?.toLowerCase() === email || getLegajo(user) === legajo);
  const metadata = {
    app_metadata: { role, legajo, dni: profile.dni },
    user_metadata: { role, legajo, full_name: (profile.first_name + " " + profile.last_name).trim(), dni: profile.dni },
  };

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, { email, password: profile.dni, email_confirm: true, ...metadata });
    if (error || !data.user) throw new Error("No se pudo actualizar Auth " + email + ": " + (error?.message ?? "sin usuario"));
    return data.user.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({ email, password: profile.dni, email_confirm: true, ...metadata });
  if (error || !data.user) throw new Error("No se pudo crear Auth " + email + ": " + (error?.message ?? "sin usuario"));
  return data.user.id;
}

async function seedProfilesAndAuth(supabase) {
  const allPeople = [...STUDENTS.map((item) => ({ ...item, role: "alumno" })), ...TEACHERS.map((item) => ({ ...item, role: "docente" })), ...TUTORS.map((item) => ({ ...item, role: "tutor" }))];
  const profiles = new Map();

  for (const person of allPeople) {
    const data = assertNoError(await supabase.from("profiles").upsert({ first_name: person.firstName, last_name: person.lastName, dni: person.dni, email: person.email, phone: "3510000000", birth_date: person.role === "alumno" ? "2018-04-10" : "1986-05-12", address: "Domicilio test", is_active: true }, { onConflict: "dni" }).select("id, first_name, last_name, dni, email").single(), "No se pudo crear perfil " + person.code);
    const authUserId = await ensureAuthUser(supabase, data, person.role, person.code);
    const updated = assertNoError(await supabase.from("profiles").update({ auth_user_id: authUserId }).eq("id", data.id).select("id, first_name, last_name, dni, email, auth_user_id").single(), "No se pudo vincular Auth a " + person.code);
    assertNoError(await supabase.from("profile_roles").upsert({ profile_id: updated.id, role_code: person.role }, { onConflict: "profile_id,role_code" }), "No se pudo asignar rol " + person.role + " a " + person.code);
    profiles.set(person.code, updated);
  }

  for (const student of STUDENTS) {
    assertNoError(await supabase.from("students").upsert({ profile_id: profiles.get(student.code).id, student_code: student.code, current_status: "activo", admission_date: "2026-03-02" }, { onConflict: "profile_id" }), "No se pudo crear alumno " + student.code);
  }

  for (const teacher of TEACHERS) {
    assertNoError(await supabase.from("teachers").upsert({ profile_id: profiles.get(teacher.code).id, teacher_code: teacher.code, title: teacher.title, hire_date: "2026-02-15" }, { onConflict: "profile_id" }), "No se pudo crear docente " + teacher.code);
  }

  for (const tutor of TUTORS) {
    for (const [index, studentCode] of tutor.links.entries()) {
      assertNoError(await supabase.from("student_guardians").upsert({ student_profile_id: profiles.get(studentCode).id, guardian_profile_id: profiles.get(tutor.code).id, relationship_type: "tutor", is_primary: index === 0 }, { onConflict: "student_profile_id,guardian_profile_id,relationship_type" }), "No se pudo vincular tutor " + tutor.code + " con alumno " + studentCode);
    }
  }

  return profiles;
}

async function seedAcademicData(supabase, profiles) {
  const subjectRows = [];
  for (const subject of SUBJECTS) {
    subjectRows.push(assertNoError(await supabase.from("subjects").upsert({ name: subject.name, code: subject.code, description: subject.description, is_active: true }, { onConflict: "code" }).select("id, code").single(), "No se pudo crear materia " + subject.code));
  }
  const subjectsByCode = new Map(subjectRows.map((subject) => [subject.code, subject]));
  const term = assertNoError(await supabase.from("academic_terms").upsert({ name: "Ciclo lectivo TEST", year: 2026, starts_on: "2026-03-02", ends_on: "2026-12-18", is_active: true }, { onConflict: "name,year" }).select("id").single(), "No se pudo crear ciclo lectivo test");
  const coursesByKey = new Map();

  for (const courseSeed of COURSES) {
    const teacherProfileId = profiles.get(courseSeed.teacherCode).id;
    const course = assertNoError(await supabase.from("courses").insert({ subject_id: subjectsByCode.get(courseSeed.subjectCode).id, academic_term_id: term.id, teacher_profile_id: teacherProfileId, name: courseSeed.name, commission: courseSeed.commission, classroom: courseSeed.classroom, schedule_summary: courseSeed.schedule, status: "activa" }).select("id, name, teacher_profile_id").single(), "No se pudo crear curso " + courseSeed.name);
    coursesByKey.set(courseSeed.key, course);
    assertNoError(await supabase.from("course_teachers").insert({ course_id: course.id, teacher_profile_id: teacherProfileId, role_in_course: "titular" }), "No se pudo vincular docente a " + courseSeed.name);
    assertNoError(await supabase.from("course_enrollments").insert(courseSeed.students.map((studentCode) => ({ course_id: course.id, student_profile_id: profiles.get(studentCode).id, enrollment_status: "activa", enrolled_at: "2026-03-02T12:00:00.000Z" }))), "No se pudieron inscribir alumnos en " + courseSeed.name);
    await seedCourseDetails(supabase, profiles, courseSeed, course);
  }

  await seedTutorMessages(supabase, profiles, coursesByKey);
  return coursesByKey;
}

async function seedCourseDetails(supabase, profiles, courseSeed, course) {
  const assessmentRows = [{ title: "Diagnostico inicial", type: "diagnostico", date: "2026-04-10" }, { title: "Trabajo practico 1", type: "trabajo_practico", date: "2026-05-20" }];

  for (const [assessmentIndex, assessmentSeed] of assessmentRows.entries()) {
    const assessment = assertNoError(await supabase.from("assessments").insert({ course_id: course.id, title: assessmentSeed.title, description: "<p>Evaluacion de prueba para " + course.name + ".</p>", evaluation_type: assessmentSeed.type, max_score: 10, evaluated_at: assessmentSeed.date, created_by: course.teacher_profile_id }).select("id").single(), "No se pudo crear evaluacion " + assessmentSeed.title);
    const grades = courseSeed.students.map((studentCode, studentIndex) => {
      const score = Math.max(4, Math.min(10, 5 + assessmentIndex + studentIndex));
      return { assessment_id: assessment.id, student_profile_id: profiles.get(studentCode).id, score, approved: score >= 6, teacher_comment: score >= 6 ? "Buen seguimiento en actividades." : "Reforzar contenidos con apoyo.", recorded_by: course.teacher_profile_id };
    });
    assertNoError(await supabase.from("grades").insert(grades), "No se pudieron crear notas para " + course.name);
  }

  const sessions = [{ date: "2026-05-05", topic: "Presentacion de unidad" }, { date: "2026-05-12", topic: "Practica guiada" }, { date: "2026-05-19", topic: "Actividad integradora" }, { date: "2026-05-26", topic: "Revision y cierre" }];
  const statuses = ["presente", "presente", "justificada", "ausente"];

  for (const [sessionIndex, sessionSeed] of sessions.entries()) {
    const session = assertNoError(await supabase.from("class_sessions").insert({ course_id: course.id, session_date: sessionSeed.date, topic: sessionSeed.topic, created_by: course.teacher_profile_id }).select("id").single(), "No se pudo crear clase " + sessionSeed.date);
    assertNoError(await supabase.from("attendance_records").insert(courseSeed.students.map((studentCode, studentIndex) => {
      const status = statuses[(sessionIndex + studentIndex) % statuses.length];
      return { class_session_id: session.id, student_profile_id: profiles.get(studentCode).id, status, notes: status === "ausente" ? "Ausencia sin justificar." : status === "justificada" ? "Justificacion familiar registrada." : "Sin observacion", recorded_by: course.teacher_profile_id };
    })), "No se pudo crear asistencia para " + course.name);
  }

  assertNoError(await supabase.from("course_materials").insert([{ course_id: course.id, title: "Guia inicial", description: "<p>Material de lectura y actividades para iniciar " + course.name + ".</p>", resource_url: "https://example.com/material-test.pdf", material_type: "Guia", created_by: course.teacher_profile_id }, { course_id: course.id, title: "Actividad de seguimiento", description: "Consigna breve para revisar avances.", resource_url: null, material_type: "Actividad", created_by: course.teacher_profile_id }]), "No se pudieron crear materiales para " + course.name);
}

async function seedTutorMessages(supabase, profiles, coursesByKey) {
  const course = coursesByKey.get("motricidad-s4");
  if (!course) return;
  assertNoError(await supabase.from("tutor_teacher_messages").insert([{ tutor_profile_id: profiles.get("T900001").id, student_profile_id: profiles.get("A900001").id, course_id: course.id, teacher_profile_id: course.teacher_profile_id, message: "Consulta test: queremos reforzar la actividad de motricidad en casa." }, { tutor_profile_id: profiles.get("T900002").id, student_profile_id: profiles.get("A900002").id, course_id: course.id, teacher_profile_id: course.teacher_profile_id, message: "Comentario test del tutor con varios hijos vinculados." }]), "No se pudieron crear mensajes tutor-docente");
}

function writeCredentials() {
  const rows = ["role,legajo,email,password,dni,full_name,linked_students"];
  rows.push(...STUDENTS.map((item) => ["alumno", item.code, item.email, item.dni, item.dni, '"' + fullName(item) + '"', ""].join(",")));
  rows.push(...TEACHERS.map((item) => ["docente", item.code, item.email, item.dni, item.dni, '"' + fullName(item) + '"', ""].join(",")));
  rows.push(...TUTORS.map((item) => ["tutor", item.code, item.email, item.dni, item.dni, '"' + fullName(item) + '"', '"' + item.links.join(" ") + '"'].join(",")));
  writeFileSync(CREDENTIALS_PATH, rows.join("\n") + "\n");
}

async function main() {
  loadEnvFile(resolve(ROOT, ".env.local"));
  loadEnvFile(resolve(ROOT, ".env"));
  if (!process.argv.includes("--yes")) throw new Error("Este script reemplaza solo datos TEST A900/D900/T900. Ejecutalo con --yes para confirmar.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.");
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  await cleanupTestData(supabase);
  const profiles = await seedProfilesAndAuth(supabase);
  const courses = await seedAcademicData(supabase, profiles);
  writeCredentials();
  console.log("Seed test academico creado correctamente.");
  console.log("Perfiles: " + profiles.size + ". Cursos: " + courses.size + ".");
  console.log("Credenciales: " + CREDENTIALS_PATH);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
