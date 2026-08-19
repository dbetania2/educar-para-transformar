#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const NO_DOCENTE_USERS = [
  {
    role: "no_docente",
    legajo: "N000001",
    firstName: "Andrea",
    lastName: "Mansilla",
    dni: "33090001",
    email: "andrea.mansilla@educar.test",
    phone: "3518100001",
    address: "Mesa de entrada y legajos",
  },
  {
    role: "no_docente",
    legajo: "N000002",
    firstName: "Pablo",
    lastName: "Suarez",
    dni: "33090002",
    email: "pablo.suarez@educar.test",
    phone: "3518100002",
    address: "Soporte administrativo",
  },
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

function fullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
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

async function ensureProfile(supabase, user) {
  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("dni", user.dni)
    .maybeSingle();

  if (existingError) throw new Error(`No se pudo buscar profile ${user.dni}: ${existingError.message}`);

  if (existingProfile?.id) {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        is_active: true,
      })
      .eq("id", existingProfile.id)
      .select("id")
      .single();

    if (error) throw new Error(`No se pudo actualizar profile ${user.dni}: ${error.message}`);
    return data.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      first_name: user.firstName,
      last_name: user.lastName,
      dni: user.dni,
      email: user.email,
      phone: user.phone,
      address: user.address,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(`No se pudo crear profile ${user.dni}: ${error.message}`);
  return data.id;
}

async function ensureProfileRole(supabase, profileId) {
  const { error: roleError } = await supabase
    .from("app_roles")
    .upsert({ code: "no_docente", label: "No docente" }, { onConflict: "code" });

  if (roleError) throw new Error(`No se pudo asegurar app_roles.no_docente: ${roleError.message}`);

  const { error } = await supabase
    .from("profile_roles")
    .upsert({ profile_id: profileId, role_code: "no_docente" }, { onConflict: "profile_id,role_code" });

  if (error) throw new Error(`No se pudo asignar rol no_docente a profile ${profileId}: ${error.message}`);
}

async function ensureAuthUser(supabase, profileId, user, existingUsers) {
  const email = user.email.toLowerCase();
  const password = user.dni;
  const metadata = {
    role: user.role,
    legajo: user.legajo,
    dni: user.dni,
  };
  const userMetadata = {
    ...metadata,
    full_name: fullName(user),
  };
  const existingUser = existingUsers.find((candidate) => candidate.email?.toLowerCase() === email);

  const result = existingUser
    ? await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        app_metadata: metadata,
        user_metadata: userMetadata,
        email_confirm: true,
      })
    : await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: metadata,
        user_metadata: userMetadata,
      });

  if (result.error || !result.data.user) {
    throw new Error(`No se pudo crear/actualizar Auth ${user.legajo}: ${result.error?.message ?? "sin usuario"}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ auth_user_id: result.data.user.id, email })
    .eq("id", profileId);

  if (error) throw new Error(`No se pudo vincular Auth con profile ${profileId}: ${error.message}`);

  return {
    legajo: user.legajo,
    email,
    password,
    fullName: fullName(user),
  };
}

async function main() {
  loadEnvFile(resolve(ROOT, ".env.local"));
  loadEnvFile(resolve(ROOT, ".env"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const existingUsers = await listAllUsers(supabase);
  const credentials = [];

  for (const user of NO_DOCENTE_USERS) {
    const profileId = await ensureProfile(supabase, user);
    await ensureProfileRole(supabase, profileId);
    credentials.push(await ensureAuthUser(supabase, profileId, user, existingUsers));
  }

  console.log("Usuarios no_docente listos:");
  for (const item of credentials) {
    console.log(`${item.legajo} | ${item.email} | password/DNI: ${item.password} | ${item.fullName}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
