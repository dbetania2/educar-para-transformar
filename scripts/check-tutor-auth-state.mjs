#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
const ROOT = "/home/luciano/UTN/educar-para-transformar";
function loadEnvFile(path) { if (!existsSync(path)) return; for (const line of readFileSync(path, "utf8").split(/\r?\n/)) { const t=line.trim(); if(!t||t.startsWith("#")||!t.includes("=")) continue; const i=t.indexOf("="); const k=t.slice(0,i).trim(); let v=t.slice(i+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1); process.env[k] ??= v; }}
loadEnvFile(resolve(ROOT, ".env.local")); loadEnvFile(resolve(ROOT, ".env"));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) throw new Error(error.message);
for (const legajo of ["T887566", "T346565"]) {
  const user = (data.users ?? []).find((u) => u.app_metadata?.legajo === legajo || u.user_metadata?.legajo === legajo);
  console.log(JSON.stringify({ legajo, found: Boolean(user), email: user?.email, role: user?.app_metadata?.role ?? user?.user_metadata?.role, confirmed: user?.email_confirmed_at != null }, null, 2));
}
