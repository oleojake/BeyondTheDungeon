import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.warn(
		"⚠️  SUPABASE_URL o SUPABASE_ANON_KEY no configurados en backend/.env",
	);
	throw new Error(
		"Backend requiere SUPABASE_URL y SUPABASE_ANON_KEY en backend/.env",
	);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Cliente con service_role key: bypasa RLS y tiene acceso a auth.admin.*
 * Necesario para operaciones de administración (promover, eliminar usuarios, listar auth.users).
 * Si SUPABASE_SERVICE_ROLE_KEY no está definido, cae al cliente anon (funcionalidad limitada).
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey
	? createClient(supabaseUrl, serviceRoleKey, {
			auth: { autoRefreshToken: false, persistSession: false },
		})
	: supabase;
