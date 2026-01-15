import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.warn(
		"⚠️  SUPABASE_URL o SUPABASE_ANON_KEY no configurados en backend/.env"
	);
	throw new Error(
		"Backend requiere SUPABASE_URL y SUPABASE_ANON_KEY en backend/.env"
	);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
