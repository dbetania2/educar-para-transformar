#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
const ROOT = "/home/luciano/UTN/educar-para-transformar";
function loadEnvFile(path) { if (!existsSync(path)) return; for (const line of readFileSync(path, "utf8").split(/\r?\n/)) { const t=line.trim(); if(!t||t.startsWith("#")||!t.includes("=")) continue; const i=t.indexOf("="); const k=t.slice(0,i).trim(); let v=t.slice(i+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1); process.env[k] ??= v; }}
loadEnvFile(resolve(ROOT, ".env.local")); loadEnvFile(resolve(ROOT, ".env"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const email = "agustin.vega@educar.test";
const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
const user = (users.users ?? []).find((u) => u.email?.toLowerCase() === email);
console.log("auth user", user?.id, user?.email, user?.app_metadata, user?.user_metadata);
if (user?.id) {
  const { data: profiles, error } = await supabase.from("profiles").select("id, first_name, last_name, dni, email, auth_user_id").eq("auth_user_id", user.id);
  if (error) throw new Error(error.message);
  console.log("profiles linked", profiles);
}
const { data: byEmail, error: emailError } = await supabase.from("profiles").select("id, first_name, last_name, dni, email, auth_user_id").eq("email", email);
if (emailError) throw new Error(emailError.message);
console.log("profiles by email", byEmail);
