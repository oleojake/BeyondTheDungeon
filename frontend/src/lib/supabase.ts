import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const isTest =
  import.meta.env.MODE === "test" || process.env.NODE_ENV === "test";

const fallbackUrl = "http://127.0.0.1:54321";
const fallbackAnonKey = "test-anon-key";

if ((!supabaseUrl || !supabaseAnonKey) && !isTest) {
  throw new Error(
    "Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(
  supabaseUrl ?? fallbackUrl,
  supabaseAnonKey ?? fallbackAnonKey
);