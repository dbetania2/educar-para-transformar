"use client";

import { createBrowserClient } from "@supabase/ssr";

function getRequiredBrowserEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createClient() {
  const supabaseUrl = getRequiredBrowserEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabasePublishableKey = getRequiredBrowserEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
