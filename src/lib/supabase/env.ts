function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
export const supabasePublishableKey = getRequiredEnv(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
);

export const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
