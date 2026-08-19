import { createClient } from "@supabase/supabase-js";

import {
  supabaseSecretKey,
  supabaseUrl,
} from "./env";

export function createAdminClient() {
  if (!supabaseSecretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required for admin operations.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
