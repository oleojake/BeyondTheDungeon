import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// healthcheck para Docker / monitorización
app.get("/health", (req, res) => {
	res.json({ ok: true, service: "btd-backend" });
});

// endpoint de prueba para el front
app.get("/api/ping", (req, res) => {
	res.json({ pong: true, ts: Date.now() });
});

// Verifica configuración de Supabase
app.get("/api/supabase-status", (req, res) => {
	const hasUrl = Boolean(process.env.SUPABASE_URL);
	const hasKey = Boolean(
		process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
	);

	res.json({
		supabaseConfigured: hasUrl && hasKey,
		hasUrl,
		hasKey,
	});
});

// 🆕 Endpoint de ejemplo: obtener usuarios autenticados
app.get("/api/users", async (req, res) => {
	try {
		// Consulta la tabla 'auth.users' de Supabase
		// Nota: Esto requiere permisos RLS configurados o usar service_role_key
		const { data, error } = await supabase.auth.admin.listUsers();

		if (error) {
			return res.status(500).json({
				error: "Error al consultar usuarios",
				details: error.message,
			});
		}

		// Devolver solo info básica (sin datos sensibles)
		const users = data.users.map((u) => ({
			id: u.id,
			email: u.email,
			created_at: u.created_at,
		}));

		res.json({ users, count: users.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener todos los monstruos del bestiario
app.get("/api/compendium-bestiary", async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("compendium_bestiary")
			.select("*")
			.order("name", { ascending: true });

		if (error) {
			return res.status(500).json({
				error: "Error al consultar compendium_bestiary",
				details: error.message,
				hint: "Asegúrate de que la tabla 'compendium_bestiary' existe y tiene permisos RLS configurados",
			});
		}

		res.json({ characters: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener un monstruo específico por ID
app.get("/api/compendium-bestiary/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { data, error } = await supabase
			.from("compendium_bestiary")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			return res.status(404).json({
				error: "Monstruo no encontrado",
				details: error.message,
			});
		}

		res.json(data);
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener todos los objetos/items
app.get("/api/compendium-items", async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("compendium_items")
			.select("*")
			.order("name", { ascending: true });

		if (error) {
			return res.status(500).json({
				error: "Error al consultar compendium_items",
				details: error.message,
				hint: "Asegúrate de que la tabla 'compendium_items' existe y tiene permisos RLS configurados",
			});
		}

		res.json({ items: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener todos los hechizos
app.get("/api/compendium-spells", async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("compendium_spells")
			.select("*")
			.order("name", { ascending: true });

		if (error) {
			return res.status(500).json({
				error: "Error al consultar compendium_spells",
				details: error.message,
				hint: "Asegúrate de que la tabla 'compendium_spells' existe y tiene permisos RLS configurados",
			});
		}

		res.json({ spells: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener un hechizo específico por ID
app.get("/api/compendium-spells/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { data, error } = await supabase
			.from("compendium_spells")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			return res.status(404).json({
				error: "Hechizo no encontrado",
				details: error.message,
			});
		}

		res.json(data);
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ==============================================================================
// CHARACTER SHEETS (Fichas de Personaje)
// ==============================================================================

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				error: "No autorizado",
				details: "Token de autenticación requerido",
			});
		}

		const token = authHeader.split(" ")[1];
		const { data: { user }, error } = await supabase.auth.getUser(token);

		if (error || !user) {
			return res.status(401).json({
				error: "No autorizado",
				details: "Token inválido o expirado",
			});
		}

		req.user = user;
		next();
	} catch (err) {
		res.status(500).json({
			error: "Error de autenticación",
			details: err.message,
		});
	}
};

// 🆕 Endpoint: listar todas las fichas del usuario autenticado
app.get("/api/character-sheets", requireAuth, async (req, res) => {
	try {
		// Crear cliente autenticado con el token del usuario
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("characters")
			.select("id, name, classes, race, created_at, updated_at")
			.eq("user_id", req.user.id)
			.eq("is_npc", false)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("❌ Error al listar fichas:", error);
			return res.status(500).json({
				error: "Error al consultar fichas",
				details: error.message,
			});
		}

		// Calcular nivel total de cada personaje
		const charactersWithLevel = (data || []).map(char => {
			const level = Array.isArray(char.classes) 
				? char.classes.reduce((sum, cls) => sum + (cls.level || 0), 0)
				: (char.classes?.level || 1);
			return { ...char, level };
		});

		res.json({ characters: charactersWithLevel });
	} catch (err) {
		console.error("💥 Exception listando fichas:", err);
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener la ficha del usuario autenticado
app.get("/api/character-sheet", requireAuth, async (req, res) => {
	try {
		const { data, error } = await supabase
			.from("characters")
			.select("*")
			.eq("user_id", req.user.id)
			.eq("is_npc", false)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No existe aún
				return res.json({ character: null });
			}
			return res.status(500).json({
				error: "Error al consultar ficha",
				details: error.message,
			});
		}

		res.json({ character: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: obtener una ficha específica por ID
app.get("/api/character-sheet/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;
		
		// Crear cliente autenticado con el token del usuario
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);
		
		const { data, error } = await authenticatedSupabase
			.from("characters")
			.select("*")
			.eq("id", id)
			.eq("user_id", req.user.id)
			.eq("is_npc", false)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return res.status(404).json({
					error: "Ficha no encontrada",
				});
			}
			return res.status(500).json({
				error: "Error al consultar ficha",
				details: error.message,
			});
		}

		res.json({ character: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: crear ficha de personaje
app.post("/api/character-sheet", requireAuth, async (req, res) => {
	try {
		const characterData = {
			user_id: req.user.id,
			...req.body,
			is_npc: false,
		};

		console.log("🔍 Intentando crear personaje para user_id:", req.user.id);
		console.log("📝 Datos del personaje:", JSON.stringify(characterData, null, 2));

		// Crear cliente autenticado con el token del usuario
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		// Verificar el usuario autenticado
		const { data: { user }, error: authError } = await authenticatedSupabase.auth.getUser();
		console.log("👤 Usuario autenticado:", user?.id, "Error:", authError?.message);

		const { data, error } = await authenticatedSupabase
			.from("characters")
			.insert([characterData])
			.select()
			.single();

		if (error) {
			console.error("❌ Error creating character:", error);
			console.error("   Code:", error.code);
			console.error("   Message:", error.message);
			console.error("   Details:", error.details);
			console.error("   Hint:", error.hint);
			return res.status(500).json({
				error: "Error al crear ficha",
				details: error.message,
				code: error.code,
			});
		}

		console.log("✅ Personaje creado exitosamente:", data.id);
		res.status(201).json({ character: data });
	} catch (err) {
		console.error("💥 Exception creating character:", err);
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: actualizar ficha de personaje
app.put("/api/character-sheet/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;

		// Crear cliente autenticado con el token del usuario
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		// Verificar que la ficha existe y pertenece al usuario
		const { data: existing, error: checkError } = await authenticatedSupabase
			.from("characters")
			.select("id")
			.eq("id", id)
			.eq("user_id", req.user.id)
			.eq("is_npc", false)
			.single();

		if (checkError) {
			if (checkError.code === "PGRST116") {
				return res.status(404).json({
					error: "Ficha no encontrada",
				});
			}
			return res.status(500).json({
				error: "Error al verificar ficha",
				details: checkError.message,
			});
		}

		const { data, error } = await authenticatedSupabase
			.from("characters")
			.update({
				...req.body,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al actualizar ficha",
				details: error.message,
			});
		}

		res.json({ character: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 Endpoint: eliminar ficha de personaje
app.delete("/api/character-sheet/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;

		// Crear cliente autenticado con el token del usuario
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		// Verificar que la ficha existe y pertenece al usuario
		const { data: existing, error: checkError } = await authenticatedSupabase
			.from("characters")
			.select("id")
			.eq("id", id)
			.eq("user_id", req.user.id)
			.eq("is_npc", false)
			.single();

		if (checkError) {
			if (checkError.code === "PGRST116") {
				return res.status(404).json({
					error: "Ficha no encontrada",
				});
			}
			return res.status(500).json({
				error: "Error al verificar ficha",
				details: checkError.message,
			});
		}

		const { error } = await authenticatedSupabase
			.from("characters")
			.delete()
			.eq("id", id)
			.eq("user_id", req.user.id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar ficha",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Ficha eliminada correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ==============================================================================
// BATTLE MAPS ENDPOINTS
// ==============================================================================

// 📍 Endpoint: listar mapas del usuario autenticado
app.get("/api/battle-maps", requireAuth, async (req, res) => {
	try {
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("battle_maps")
			.select("id, name, grid_size, created_at, updated_at")
			.eq("user_id", req.user.id)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("❌ Error al listar mapas:", error);
			return res.status(500).json({
				error: "Error al consultar mapas",
				details: error.message,
			});
		}

		res.json({ maps: data || [] });
	} catch (err) {
		console.error("💥 Exception listando mapas:", err);
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 📍 Endpoint: obtener un mapa específico
app.get("/api/battle-maps/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("battle_maps")
			.select("*")
			.eq("id", id)
			.eq("user_id", req.user.id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return res.status(404).json({
					error: "Mapa no encontrado",
				});
			}
			return res.status(500).json({
				error: "Error al consultar mapa",
				details: error.message,
			});
		}

		res.json({ map: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 📍 Endpoint: crear nuevo mapa
app.post("/api/battle-maps", requireAuth, async (req, res) => {
	try {
		console.log("📍 POST /api/battle-maps - Datos recibidos:", {
			name: req.body.name,
			grid_size: req.body.grid_size,
			grid_color: req.body.grid_color,
			image_data: req.body.image_data ? `${req.body.image_data.substring(0, 50)}...` : null
		});

		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		const mapData = {
			user_id: req.user.id,
			name: req.body.name,
			image_data: req.body.image_data,
			grid_size: req.body.grid_size || 50,
			grid_color: req.body.grid_color || "rgba(255, 255, 255, 0.3)",
		};

		console.log("📍 Guardando mapa con datos:", {
			user_id: mapData.user_id,
			name: mapData.name,
			grid_size: mapData.grid_size,
			grid_color: mapData.grid_color,
		});

		const { data, error } = await authenticatedSupabase
			.from("battle_maps")
			.insert(mapData)
			.select()
			.single();

		if (error) {
			console.error("❌ Error de Supabase:", error);
			return res.status(500).json({
				error: "Error al guardar mapa",
				details: error.message,
			});
		}

		console.log("✅ Mapa guardado correctamente:", data.id);
		res.status(201).json({ map: data });
	} catch (err) {
		console.error("💥 Exception en POST /api/battle-maps:", err);
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 📍 Endpoint: actualizar mapa
app.put("/api/battle-maps/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		// Verificar que el mapa existe y pertenece al usuario
		const { data: existing, error: checkError } = await authenticatedSupabase
			.from("battle_maps")
			.select("id")
			.eq("id", id)
			.eq("user_id", req.user.id)
			.single();

		if (checkError) {
			if (checkError.code === "PGRST116") {
				return res.status(404).json({
					error: "Mapa no encontrado",
				});
			}
			return res.status(500).json({
				error: "Error al verificar mapa",
				details: checkError.message,
			});
		}

		const { data, error } = await authenticatedSupabase
			.from("battle_maps")
			.update({
				name: req.body.name,
				grid_size: req.body.grid_size,
				grid_color: req.body.grid_color,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al  actualizar mapa",
				details: error.message,
			});
		}

		res.json({ map: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 📍 Endpoint: eliminar mapa
app.delete("/api/battle-maps/:id", requireAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const userToken = req.headers.authorization.replace("Bearer ", "");
		const { createClient } = await import("@supabase/supabase-js");
		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				},
			}
		);

		// Verificar que el mapa existe y pertenece al usuario
		const { data: existing, error: checkError } = await authenticatedSupabase
			.from("battle_maps")
			.select("id")
			.eq("id", id)
			.eq("user_id", req.user.id)
			.single();

		if (checkError) {
			if (checkError.code === "PGRST116") {
				return res.status(404).json({
					error: "Mapa no encontrado",
				});
			}
			return res.status(500).json({
				error: "Error al verificar mapa",
				details: checkError.message,
			});
		}

		const { error } = await authenticatedSupabase
			.from("battle_maps")
			.delete()
			.eq("id", id)
			.eq("user_id", req.user.id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar mapa",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Mapa eliminado correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
	console.log(`btd-backend listening on port ${PORT}`);
});
