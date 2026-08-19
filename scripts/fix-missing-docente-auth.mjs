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
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] ??= value;
  }
}
loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(resolve(ROOT, ".env"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: rows, error } = await supabase
  .from("profile_roles")
  .select("profiles!inner(id, first_name, last_name, dni, email, auth_user_id)")
  .eq("role_code", "docente");
if (error) throw new Error(error.message);
const missing = (rows ?? [])
  .map((row) => Array.isArray(row.profiles) ? row.profiles[0] : row.profiles)
  .find((profile) => profile && !profile.auth_user_id && profile.dni === "123456789");
if (!missing) {
  console.log("No queda docente pendiente con DNI 123456789.");
  process.exit(0);
}
const legajo = `D${String(missing.dni).replace(/\D/g, "").slice(-6)}`;
const fullName = `${missing.first_name ?? ""} ${missing.last_name ?? ""}`.trim();
const email = String(missing.email).trim().toLowerCase();
const { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw new Error(listError.message);
const existing = (users.users ?? []).find((user) => user.email?.trim().toLowerCase() === email);
const result = existing
  ? await supabase.auth.admin.updateUserById(existing.id, {
      email,
      password: String(missing.dni).trim(),
      email_confirm: true,
      app_metadata: { ...(existing.app_metadata ?? {}), role: "docente", legajo, dni: missing.dni },
      user_metadata: { ...(existing.user_metadata ?? {}), role: "docente", legajo, dni: missing.dni, full_name: fullName },
    })
  : await supabase.auth.admin.createUser({
      email,
      password: String(missing.dni).trim(),
      email_confirm: true,
      app_metadata: { role: "docente", legajo, dni: missing.dni },
      user_metadata: { role: "docente", legajo, dni: missing.dni, full_name: fullName },
    });
if (result.error || !result.data.user) throw new Error(result.error?.message ?? "No se pudo restaurar docente faltante");
const { error: updateError } = await supabase.from("profiles").update({ auth_user_id: result.data.user.id, email }).eq("id", missing.id);
if (updateError) throw new Error(updateError.message);
await supabase.from("teachers").upsert({ profile_id: missing.id, teacher_code: legajo }, { onConflict: "profile_id" });
console.log(`Docente restaurado: ${email} ${legajo}`);
