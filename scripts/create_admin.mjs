import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

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

loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(resolve(ROOT, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log("Checking if user already exists...");
const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) {
  console.error("Error listing users:", listError.message);
  process.exit(1);
}

const email = "admin12345@educar.test";
const password = "admin12345";
const fullName = "Administrador Principal";

const existing = users.find(u => u.email === email);
if (existing) {
  console.log(`User ${email} already exists. Updating metadata/role...`);
  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    app_metadata: { role: "administrativo" },
    user_metadata: { role: "administrativo", full_name: fullName }
  });
  if (error) {
    console.error("Error updating user:", error.message);
    process.exit(1);
  }
  console.log("Successfully updated admin user!");
} else {
  console.log(`Creating user ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "administrativo" },
    user_metadata: { role: "administrativo", full_name: fullName }
  });
  if (error) {
    console.error("Error creating user:", error.message);
    process.exit(1);
  }
  console.log("Successfully created admin user!");
}
