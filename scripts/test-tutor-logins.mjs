#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
const ROOT = "/home/luciano/UTN/educar-para-transformar";
function loadEnvFile(path) { if (!existsSync(path)) return; for (const line of readFileSync(path, "utf8").split(/\r?\n/)) { const t=line.trim(); if(!t||t.startsWith("#")||!t.includes("=")) continue; const i=t.indexOf("="); const k=t.slice(0,i).trim(); let v=t.slice(i+1).trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1); process.env[k] ??= v; }}
loadEnvFile(resolve(ROOT, ".env.local")); loadEnvFile(resolve(ROOT, ".env"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
const cases = [
  { legajo: "T887566", email: "t887566@educar.test", dni: "37428287" },
  { legajo: "T346565", email: "t346565@educar.test", dni: "65258741" },
];
for (const item of cases) {
  const supabase = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email: item.email, password: item.dni });
  console.log(item.legajo, error ? `ERROR ${error.message}` : `OK role=${data.user?.app_metadata?.role} legajo=${data.user?.app_metadata?.legajo}`);
}
