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
const { data, error } = await supabase
  .from("profile_roles")
  .select("role_code, profiles!inner(id, first_name, last_name, dni, email, auth_user_id)")
  .in("role_code", ["alumno", "docente", "tutor"]);
if (error) throw new Error(error.message);
const rows = (data ?? []).map((r) => ({ role: r.role_code, profile: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles }));
const counts = rows.reduce((acc, row) => {
  acc[row.role] ??= { total: 0, linked: 0, missing: 0 };
  acc[row.role].total += 1;
  if (row.profile?.auth_user_id) acc[row.role].linked += 1;
  else acc[row.role].missing += 1;
  return acc;
}, {});
console.log(JSON.stringify(counts, null, 2));
const missing = rows.filter((row) => !row.profile?.auth_user_id);
if (missing.length) {
  console.log("Sin auth_user_id:");
  for (const row of missing) {
    console.log(`${row.role}: ${row.profile?.first_name ?? ""} ${row.profile?.last_name ?? ""} DNI ${row.profile?.dni ?? "sin DNI"} email ${row.profile?.email ?? "sin email"}`);
  }
}
