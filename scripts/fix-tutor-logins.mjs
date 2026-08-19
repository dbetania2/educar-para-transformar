#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = "/home/luciano/UTN/educar-para-transformar";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
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

function fullName(profile) {
  return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Tutor";
}

function normalizeEmail(email, legajo) {
  const value = String(email ?? "").trim().toLowerCase();
  return value || `${legajo.toLowerCase()}@familias.educar.test`;
}

function firstItem(value) {
  return Array.isArray(value) ? value[0] : value;
}

loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(resolve(ROOT, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Faltan credenciales de Supabase.");

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: tutorRoles, error: roleError } = await supabase
  .from("profile_roles")
  .select("profiles!inner(id, first_name, last_name, dni, email, auth_user_id)")
  .eq("role_code", "tutor")
  .order("created_at", { ascending: true });

if (roleError) throw new Error(roleError.message);

let created = 0;
let updated = 0;
let skipped = 0;
const results = [];

for (const roleRow of tutorRoles ?? []) {
  const tutorProfile = firstItem(roleRow.profiles);
  if (!tutorProfile?.id) {
    skipped += 1;
    continue;
  }

  const { data: links, error: linkError } = await supabase
    .from("student_guardians")
    .select("is_primary, relationship_type, students!inner(student_code, profiles!inner(dni))")
    .eq("guardian_profile_id", tutorProfile.id)
    .order("is_primary", { ascending: false });

  if (linkError) throw new Error(linkError.message);

  const primaryLink = (links ?? [])[0];
  const student = primaryLink ? firstItem(primaryLink.students) : null;
  const studentProfile = student ? firstItem(student.profiles) : null;
  const studentCode = student?.student_code;
  const studentDni = studentProfile?.dni;

  if (!studentCode || !studentDni) {
    skipped += 1;
    results.push({ tutor: fullName(tutorProfile), skipped: "sin alumno vinculado con legajo/DNI" });
    continue;
  }

  const legajo = String(studentCode).trim().toUpperCase().replace(/^A/, "T");
  const email = normalizeEmail(tutorProfile.email, legajo);
  const metadata = {
    role: "tutor",
    legajo,
    dni: String(tutorProfile.dni ?? "").trim(),
  };

  let user = null;
  if (tutorProfile.auth_user_id) {
    const { data } = await supabase.auth.admin.getUserById(tutorProfile.auth_user_id);
    user = data?.user ?? null;
  }

  if (!user) {
    const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw new Error(listError.message);
    user = (listed.users ?? []).find((candidate) => candidate.email?.trim().toLowerCase() === email) ?? null;
  }

  const payload = {
    email,
    password: String(studentDni).trim(),
    email_confirm: true,
    app_metadata: {
      ...(user?.app_metadata ?? {}),
      ...metadata,
    },
    user_metadata: {
      ...(user?.user_metadata ?? {}),
      ...metadata,
      full_name: fullName(tutorProfile),
    },
  };

  const result = user
    ? await supabase.auth.admin.updateUserById(user.id, payload)
    : await supabase.auth.admin.createUser(payload);

  if (result.error || !result.data.user) {
    throw new Error(`No se pudo sincronizar tutor ${fullName(tutorProfile)}: ${result.error?.message ?? "sin usuario"}`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ auth_user_id: result.data.user.id, email, is_active: true })
    .eq("id", tutorProfile.id);

  if (profileError) throw new Error(profileError.message);

  if (user) updated += 1;
  else created += 1;

  results.push({ tutor: fullName(tutorProfile), legajo, email, password: String(studentDni).trim(), status: user ? "actualizado" : "creado" });
}

console.table(results);
console.log(`Tutores sincronizados. Creados: ${created}. Actualizados: ${updated}. Omitidos: ${skipped}.`);
