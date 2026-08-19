#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = "/home/luciano/UTN/educar-para-transformar";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function fullName(profile) {
  return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Sin nombre";
}

function legajoFromRoleRecord(role, record, index) {
  if (role === "alumno" && record.students?.student_code) return record.students.student_code;
  if (role === "docente" && record.teachers?.teacher_code) return record.teachers.teacher_code;
  if (role === "tutor") {
    const studentCode = record.student_guardians?.[0]?.students?.student_code;
    if (studentCode) return studentCode.replace(/^A/i, "T");
    return `T${String(index + 1).padStart(6, "0")}`;
  }
  return null;
}

async function listAllUsers(supabase) {
  const users = [];
  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`No se pudieron listar usuarios Auth: ${error.message}`);
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < 1000) break;
  }
  return users;
}

async function getRoleRecords(supabase) {
  const { data: roles, error: rolesError } = await supabase
    .from("profile_roles")
    .select("role_code, profiles!inner(id, first_name, last_name, dni, email, phone)")
    .in("role_code", ["alumno", "docente", "tutor"])
    .order("role_code", { ascending: true });

  if (rolesError) throw new Error(`No se pudieron leer roles/perfiles: ${rolesError.message}`);

  const profileIds = (roles ?? [])
    .map((record) => {
      const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;
      return profile?.id;
    })
    .filter(Boolean);

  const [studentsResult, teachersResult, guardiansResult] = await Promise.all([
    supabase.from("students").select("profile_id, student_code, profiles(dni)").in("profile_id", profileIds),
    supabase.from("teachers").select("profile_id, teacher_code").in("profile_id", profileIds),
    supabase
      .from("student_guardians")
      .select("guardian_profile_id, students(student_code, profiles(dni))")
      .in("guardian_profile_id", profileIds)
      .order("is_primary", { ascending: false }),
  ]);

  if (studentsResult.error) throw new Error(`No se pudieron leer alumnos: ${studentsResult.error.message}`);
  if (teachersResult.error) throw new Error(`No se pudieron leer docentes: ${teachersResult.error.message}`);
  if (guardiansResult.error) throw new Error(`No se pudieron leer tutores vinculados: ${guardiansResult.error.message}`);

  const studentsByProfileId = new Map((studentsResult.data ?? []).map((item) => [item.profile_id, item]));
  const teachersByProfileId = new Map((teachersResult.data ?? []).map((item) => [item.profile_id, item]));
  const guardiansByProfileId = new Map();

  for (const item of guardiansResult.data ?? []) {
    if (!guardiansByProfileId.has(item.guardian_profile_id)) {
      guardiansByProfileId.set(item.guardian_profile_id, []);
    }
    guardiansByProfileId.get(item.guardian_profile_id).push(item);
  }

  return (roles ?? []).map((record) => {
    const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;
    return {
      ...record,
      profiles: profile,
      students: studentsByProfileId.get(profile?.id) ?? null,
      teachers: teachersByProfileId.get(profile?.id) ?? null,
      student_guardians: guardiansByProfileId.get(profile?.id) ?? [],
    };
  });
}

async function ensureAuthUser({ supabase, usersByEmail, role, profile, legajo, password, email }) {
  const existing = usersByEmail.get(email);
  const metadata = { role, legajo, dni: profile.dni };
  const payload = {
    email,
    password,
    email_confirm: true,
    app_metadata: { ...(existing?.app_metadata ?? {}), ...metadata },
    user_metadata: { ...(existing?.user_metadata ?? {}), ...metadata, full_name: fullName(profile) },
  };

  const result = existing
    ? await supabase.auth.admin.updateUserById(existing.id, payload)
    : await supabase.auth.admin.createUser(payload);

  if (result.error || !result.data.user) {
    throw new Error(`No se pudo ${existing ? "actualizar" : "crear"} ${role} ${legajo} (${email}): ${result.error?.message ?? "sin usuario"}`);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ auth_user_id: result.data.user.id, email })
    .eq("id", profile.id);

  if (updateError) throw new Error(`No se pudo vincular profile ${profile.id}: ${updateError.message}`);

  usersByEmail.set(email, result.data.user);
  return existing ? "actualizado" : "creado";
}

async function main() {
  loadEnvFile(resolve(ROOT, ".env.local"));
  loadEnvFile(resolve(ROOT, ".env"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const [records, users] = await Promise.all([getRoleRecords(supabase), listAllUsers(supabase)]);
  const usersByEmail = new Map(users.filter((u) => u.email).map((u) => [normalizeEmail(u.email), u]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const [index, record] of records.entries()) {
    const role = record.role_code;
    const profile = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;
    if (!profile?.id || !profile?.dni) { skipped += 1; continue; }

    const legajo = legajoFromRoleRecord(role, record, index);
    if (!legajo) { skipped += 1; continue; }

    let email = normalizeEmail(profile.email);
    if (role === "alumno") email = `${legajo.toLowerCase()}@alumnos.educar.test`;
    if (!email) email = `${legajo.toLowerCase()}@educar.test`;

    let password = String(profile.dni).trim();
    if (role === "tutor") {
      const linkedStudentDni = record.student_guardians?.[0]?.students?.profiles?.dni;
      password = String(linkedStudentDni ?? profile.dni).trim();
    }

    const status = await ensureAuthUser({ supabase, usersByEmail, role, profile, legajo, password, email });
    if (status === "creado") created += 1;
    else updated += 1;
  }

  console.log(`Restauracion Auth completa. Creados: ${created}. Actualizados: ${updated}. Omitidos: ${skipped}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
