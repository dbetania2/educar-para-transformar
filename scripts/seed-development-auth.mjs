#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const CREDENTIALS_PATH = resolve(ROOT, "supabase/seed_credentials.csv");
const ADMIN_ROLES = new Set(["admin", "administrativo"]);
const SEEDED_ROLES = new Set(["alumno", "docente"]);
const EXTRA_TUTOR_RECORDS = [
  { role: "tutor", legajo: "T000001", dni: "52090001" },
  { role: "tutor", legajo: "T000002", dni: "52090002" },
];

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

function normalizeRole(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function fullName(profile) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}

function toAuthSafeEmail(email) {
  return email
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9@._+-]/g, "");
}

async function listAllUsers(supabase) {
  const users = [];
  const perPage = 1000;

  for (let page = 1; page < 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`No se pudieron listar usuarios Auth: ${error.message}`);

    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < perPage) break;
  }

  return users;
}

async function getAdminAuthUserIds(supabase) {
  const { data, error } = await supabase
    .from("profile_roles")
    .select("role_code, profiles!inner(auth_user_id)")
    .in("role_code", [...ADMIN_ROLES]);

  if (error) throw new Error(`No se pudieron detectar admins en profiles: ${error.message}`);

  return new Set(
    (data ?? [])
      .map((row) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return profile?.auth_user_id ?? null;
      })
      .filter(Boolean),
  );
}

function isAdminUser(user, adminAuthUserIds) {
  const appRole = normalizeRole(user.app_metadata?.role);
  const userRole = normalizeRole(user.user_metadata?.role);

  return ADMIN_ROLES.has(appRole) || ADMIN_ROLES.has(userRole) || adminAuthUserIds.has(user.id);
}

async function deleteNonAdminAuthUsers(supabase) {
  const [users, adminAuthUserIds] = await Promise.all([
    listAllUsers(supabase),
    getAdminAuthUserIds(supabase),
  ]);

  const usersToDelete = users.filter((user) => !isAdminUser(user, adminAuthUserIds));

  for (const user of usersToDelete) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`No se pudo borrar Auth user ${user.email ?? user.id}: ${error.message}`);
  }

  return { preserved: users.length - usersToDelete.length, deleted: usersToDelete.length };
}

async function getSeedProfiles(supabase) {
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("student_code, profiles!inner(id, first_name, last_name, dni, email)")
    .order("student_code", { ascending: true });

  if (studentsError) throw new Error(`No se pudieron leer alumnos seed: ${studentsError.message}`);

  const { data: teachers, error: teachersError } = await supabase
    .from("teachers")
    .select("teacher_code, profiles!inner(id, first_name, last_name, dni, email)")
    .order("teacher_code", { ascending: true });

  if (teachersError) throw new Error(`No se pudieron leer docentes seed: ${teachersError.message}`);

  return [
    ...(students ?? []).map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return { role: "alumno", legajo: row.student_code, profile };
    }),
    ...(teachers ?? []).map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return { role: "docente", legajo: row.teacher_code, profile };
    }),
  ].filter((record) => SEEDED_ROLES.has(record.role) && record.profile?.id && record.profile?.dni && record.profile?.email);
}

async function getExtraTutorProfiles(supabase) {
  const dnis = EXTRA_TUTOR_RECORDS.map((record) => record.dni);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, dni, email")
    .in("dni", dnis)
    .order("dni", { ascending: true });

  if (error) throw new Error(`No se pudieron leer tutores seed: ${error.message}`);

  return (data ?? []).filter((profile) => profile?.id && profile?.dni && profile?.email);
}

async function ensureProfileRole(supabase, profileId, roleCode) {
  const { data, error } = await supabase
    .from("profile_roles")
    .select("id")
    .eq("profile_id", profileId)
    .eq("role_code", roleCode)
    .maybeSingle();

  if (error) throw new Error(`No se pudo revisar rol ${roleCode} para profile ${profileId}: ${error.message}`);
  if (data?.id) return;

  const { error: insertError } = await supabase
    .from("profile_roles")
    .insert({ profile_id: profileId, role_code: roleCode });

  if (insertError) throw new Error(`No se pudo asignar rol ${roleCode} a profile ${profileId}: ${insertError.message}`);
}

async function createLoginUser(supabase, record) {
  const email = toAuthSafeEmail(record.profile.email);
  const password = record.profile.dni.trim();
  const name = fullName(record.profile);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role: record.role,
      legajo: record.legajo,
      dni: record.profile.dni,
    },
    user_metadata: {
      role: record.role,
      legajo: record.legajo,
      full_name: name,
      dni: record.profile.dni,
    },
  });

  if (error || !data.user) {
    throw new Error(`No se pudo crear ${record.role} ${record.legajo} (${email}): ${error?.message ?? "sin usuario"}`);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ auth_user_id: data.user.id, email })
    .eq("id", record.profile.id);

  if (updateError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(`No se pudo vincular profile ${record.profile.id}: ${updateError.message}`);
  }

  await ensureProfileRole(supabase, record.profile.id, record.role);

  return {
    role: record.role,
    legajo: record.legajo,
    email,
    password,
    dni: record.profile.dni,
    fullName: name,
  };
}

async function main() {
  loadEnvFile(resolve(ROOT, ".env.local"));
  loadEnvFile(resolve(ROOT, ".env"));

  if (!process.argv.includes("--yes")) {
    throw new Error("Este script borra usuarios Auth no admin. Ejecutalo con --yes cuando ya corriste supabase/seed_development.sql.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const cleanup = await deleteNonAdminAuthUsers(supabase);
  const records = await getSeedProfiles(supabase);

  if (records.length !== 60) {
    throw new Error(`Se esperaban 60 perfiles seed para login (50 alumnos + 10 docentes), pero se encontraron ${records.length}. Primero ejecutá supabase/seed_development.sql.`);
  }

  const extraTutorProfiles = await getExtraTutorProfiles(supabase);

  if (extraTutorProfiles.length !== EXTRA_TUTOR_RECORDS.length) {
    throw new Error(`Se esperaban ${EXTRA_TUTOR_RECORDS.length} tutores seed extra, pero se encontraron ${extraTutorProfiles.length}. Primero ejecutá supabase/seed_development.sql.`);
  }

  const credentials = [];
  for (const record of records) {
    credentials.push(await createLoginUser(supabase, record));
  }

  for (const extraTutor of extraTutorProfiles) {
    const seedRecord = EXTRA_TUTOR_RECORDS.find((record) => record.dni === extraTutor.dni);

    if (!seedRecord) {
      throw new Error(`No se encontró configuración para el tutor seed con DNI ${extraTutor.dni}.`);
    }

    credentials.push(await createLoginUser(supabase, {
      role: seedRecord.role,
      legajo: seedRecord.legajo,
      profile: extraTutor,
    }));
  }

  const csv = [
    "role,legajo,email,password,dni,full_name",
    ...credentials.map((item) => [item.role, item.legajo, item.email, item.password, item.dni, `"${item.fullName.replaceAll('"', '""')}"`].join(",")),
  ].join("\n");

  writeFileSync(CREDENTIALS_PATH, `${csv}\n`);

  console.log(`Auth limpio. Preservados: ${cleanup.preserved}. Eliminados: ${cleanup.deleted}.`);
  console.log(`Usuarios seed creados: ${credentials.length}.`);
  console.log(`Credenciales: ${CREDENTIALS_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
