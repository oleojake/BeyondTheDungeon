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

// ================================================
// CAMPAIGNS ENDPOINTS
// ================================================

// 🆕 GET /api/campaigns - List all campaigns where user is DM or member
app.get("/api/campaigns", async (req, res) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Get campaigns where user is DM
		const { data, error } = await authenticatedSupabase
			.from("campaigns")
			.select("*")
			.eq("dm_id", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			return res.status(500).json({
				error: "Error al obtener campañas",
				details: error.message,
			});
		}

		res.json({ campaigns: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 GET /api/campaigns/:id - Get specific campaign
app.get("/api/campaigns/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("campaigns")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al obtener campaña",
				details: error.message,
			});
		}

		res.json({ campaign: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 POST /api/campaigns - Create new campaign
app.post("/api/campaigns", async (req, res) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { title, description, notes } = req.body;

		// Create campaign
		const { data: campaign, error: campaignError } =
			await authenticatedSupabase
				.from("campaigns")
				.insert({
					dm_id: user.id,
					title,
					description,
					notes,
				})
				.select()
				.single();

		if (campaignError) {
			return res.status(500).json({
				error: "Error al crear campaña",
				details: campaignError.message,
			});
		}

		// Add DM as campaign member
		const { error: memberError } = await authenticatedSupabase
			.from("campaign_members")
			.insert({
				campaign_id: campaign.id,
				user_id: user.id,
				role: "dm",
			});

		if (memberError) {
			// If adding member fails, rollback campaign creation
			await authenticatedSupabase
				.from("campaigns")
				.delete()
				.eq("id", campaign.id);

			return res.status(500).json({
				error: "Error al crear membresía de campaña",
				details: memberError.message,
			});
		}

		res.json({ campaign });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 PUT /api/campaigns/:id - Update campaign
app.put("/api/campaigns/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { title, description, notes } = req.body;

		const { data, error } = await authenticatedSupabase
			.from("campaigns")
			.update({ title, description, notes })
			.eq("id", id)
			.eq("dm_id", user.id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al actualizar campaña",
				details: error.message,
			});
		}

		res.json({ campaign: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 DELETE /api/campaigns/:id - Delete campaign
app.delete("/api/campaigns/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { error } = await authenticatedSupabase
			.from("campaigns")
			.delete()
			.eq("id", id)
			.eq("dm_id", user.id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar campaña",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Campaña eliminada correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 PUT /api/campaigns/:id/transfer-dm - Transfer DM role to another user
app.put("/api/campaigns/:id/transfer-dm", async (req, res) => {
	try {
		const { id } = req.params;
		const { new_dm_id } = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Verify current user is DM
		const { data: campaign, error: checkError } = await authenticatedSupabase
			.from("campaigns")
			.select("*")
			.eq("id", id)
			.eq("dm_id", user.id)
			.single();

		if (checkError || !campaign) {
			return res.status(403).json({ error: "Solo el DM puede transferir el rol" });
		}

		// Verify new DM is a member
		const { data: newDmMember, error: memberError } =
			await authenticatedSupabase
				.from("campaign_members")
				.select("*")
				.eq("campaign_id", id)
				.eq("user_id", new_dm_id)
				.single();

		if (memberError || !newDmMember) {
			return res.status(400).json({
				error: "El nuevo DM debe ser miembro de la campaña",
			});
		}

		// Update campaign DM
		const { error: updateError } = await authenticatedSupabase
			.from("campaigns")
			.update({ dm_id: new_dm_id })
			.eq("id", id);

		if (updateError) {
			return res.status(500).json({
				error: "Error al transferir DM",
				details: updateError.message,
			});
		}

		// Update roles in campaign_members
		await authenticatedSupabase
			.from("campaign_members")
			.update({ role: "player" })
			.eq("campaign_id", id)
			.eq("user_id", user.id);

		await authenticatedSupabase
			.from("campaign_members")
			.update({ role: "dm" })
			.eq("campaign_id", id)
			.eq("user_id", new_dm_id);

		res.json({ success: true, message: "DM transferido correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ================================================
// CAMPAIGN MEMBERS ENDPOINTS
// ================================================

// 🆕 GET /api/campaigns/:id/members - List campaign members
app.get("/api/campaigns/:id/members", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("campaign_members")
			.select("*")
			.eq("campaign_id", id)
			.order("joined_at", { ascending: true });

		if (error) {
			return res.status(500).json({
				error: "Error al obtener miembros",
				details: error.message,
			});
		}

		// Fetch user details for each member
		const membersWithDetails = await Promise.all(
			data.map(async (member) => {
				const { data: userData } = await authenticatedSupabase.auth.admin.getUserById(
					member.user_id
				);
				return {
					...member,
					email: userData?.user?.email || "Unknown",
				};
			})
		);

		res.json({ members: membersWithDetails, count: membersWithDetails.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 DELETE /api/campaigns/:id/members/:userId - Remove member
app.delete("/api/campaigns/:campaignId/members/:userId", async (req, res) => {
	try {
		const { campaignId, userId } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { error } = await authenticatedSupabase
			.from("campaign_members")
			.delete()
			.eq("campaign_id", campaignId)
			.eq("user_id", userId);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar miembro",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Miembro eliminado correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ================================================
// CAMPAIGN INVITATIONS ENDPOINTS
// ================================================

// 🆕 GET /api/campaign-invitations - List user's invitations
app.get("/api/campaign-invitations", async (req, res) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { data, error } = await authenticatedSupabase
			.from("campaign_invitations")
			.select("*")
			.eq("invited_user_id", user.id)
			.eq("status", "pending")
			.order("created_at", { ascending: false });

		if (error) {
			return res.status(500).json({
				error: "Error al obtener invitaciones",
				details: error.message,
			});
		}

		res.json({ invitations: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 POST /api/campaigns/:id/invitations - Create invitation
app.post("/api/campaigns/:id/invitations", async (req, res) => {
	try {
		const { id } = req.params;
		const { username } = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Find user by username in user_metadata or email
		const { data: usersList } = await supabase.auth.admin.listUsers();
		const invitedUser = usersList?.users?.find(
			(u) => 
				u.user_metadata?.username?.toLowerCase() === username.toLowerCase() ||
				u.email?.toLowerCase() === username.toLowerCase()
		);

		if (!invitedUser) {
			return res.status(404).json({
				error: "Usuario no encontrado",
			});
		}

		// Check if user is already a member
		const { data: existingMember } = await authenticatedSupabase
			.from("campaign_members")
			.select("*")
			.eq("campaign_id", id)
			.eq("user_id", invitedUser.id)
			.single();

		if (existingMember) {
			return res.status(400).json({
				error: "El usuario ya es miembro de la campaña",
			});
		}

		// Check if invitation already exists
		const { data: existingInvitation } = await authenticatedSupabase
			.from("campaign_invitations")
			.select("*")
			.eq("campaign_id", id)
			.eq("email", invitedUser.email)
			.eq("status", "pending")
			.single();

		if (existingInvitation) {
			return res.status(400).json({
				error: "Ya existe una invitación pendiente para este usuario",
			});
		}

		const { data, error } = await authenticatedSupabase
			.from("campaign_invitations")
			.insert({
				campaign_id: id,
				invited_by: user.id,
				invited_user_id: invitedUser.id,
				email: invitedUser.email,
			})
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al crear invitación",
				details: error.message,
			});
		}

		// TODO: Send email notification
		// sendInvitationEmail(email, data.token);

		res.json({ invitation: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 PUT /api/campaign-invitations/:token/accept - Accept invitation
app.put("/api/campaign-invitations/:token/accept", async (req, res) => {
	try {
		const { token } = req.params;
		const authToken = req.headers.authorization?.split(" ")[1];

		if (!authToken) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${authToken}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Get invitation
		const { data: invitation, error: invError } = await authenticatedSupabase
			.from("campaign_invitations")
			.select("*")
			.eq("token", token)
			.eq("email", user.email)
			.eq("status", "pending")
			.single();

		if (invError || !invitation) {
			return res.status(404).json({ error: "Invitación no encontrada o expirada" });
		}

		// Check expiration
		if (new Date(invitation.expires_at) < new Date()) {
			return res.status(400).json({ error: "La invitación ha expirado" });
		}

		// Add user to campaign
		const { error: memberError } = await authenticatedSupabase
			.from("campaign_members")
			.insert({
				campaign_id: invitation.campaign_id,
				user_id: user.id,
				role: "player",
			});

		if (memberError) {
			return res.status(500).json({
				error: "Error al unirse a la campaña",
				details: memberError.message,
			});
		}

		// Update invitation status
		await authenticatedSupabase
			.from("campaign_invitations")
			.update({ status: "accepted" })
			.eq("id", invitation.id);

		res.json({ success: true, message: "Invitación aceptada correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 PUT /api/campaign-invitations/:token/reject - Reject invitation
app.put("/api/campaign-invitations/:token/reject", async (req, res) => {
	try {
		const { token } = req.params;
		const authToken = req.headers.authorization?.split(" ")[1];

		if (!authToken) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${authToken}` } },
			}
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { error } = await authenticatedSupabase
			.from("campaign_invitations")
			.update({ status: "rejected" })
			.eq("token", token)
			.eq("email", user.email);

		if (error) {
			return res.status(500).json({
				error: "Error al rechazar invitación",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Invitación rechazada correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 DELETE /api/campaign-invitations/:id - Delete invitation (DM only)
app.delete("/api/campaign-invitations/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { error } = await authenticatedSupabase
			.from("campaign_invitations")
			.delete()
			.eq("id", id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar invitación",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Invitación eliminada correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ================================================
// CHAPTERS ENDPOINTS
// ================================================

// 🆕 GET /api/campaigns/:campaignId/chapters - List chapters
app.get("/api/campaigns/:campaignId/chapters", async (req, res) => {
	try {
		const { campaignId } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("chapters")
			.select("*")
			.eq("campaign_id", campaignId)
			.order("order_index", { ascending: true });

		if (error) {
			return res.status(500).json({
				error: "Error al obtener capítulos",
				details: error.message,
			});
		}

		res.json({ chapters: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 POST /api/campaigns/:campaignId/chapters - Create chapter
app.post("/api/campaigns/:campaignId/chapters", async (req, res) => {
	try {
		const { campaignId } = req.params;
		const { title, content, order_index } = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("chapters")
			.insert({
				campaign_id: campaignId,
				title,
				content,
				order_index: order_index || 0,
			})
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al crear capítulo",
				details: error.message,
			});
		}

		res.json({ chapter: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 PUT /api/chapters/:id - Update chapter
app.put("/api/chapters/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { title, content, order_index } = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("chapters")
			.update({ title, content, order_index })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al actualizar capítulo",
				details: error.message,
			});
		}

		res.json({ chapter: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 DELETE /api/chapters/:id - Delete chapter
app.delete("/api/chapters/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { error } = await authenticatedSupabase
			.from("chapters")
			.delete()
			.eq("id", id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar capítulo",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Capítulo eliminado correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ================================================
// SCENES ENDPOINTS
// ================================================

// 🆕 GET /api/chapters/:chapterId/scenes - List scenes
app.get("/api/chapters/:chapterId/scenes", async (req, res) => {
	try {
		const { chapterId } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("scenes")
			.select("*")
			.eq("chapter_id", chapterId)
			.order("order_index", { ascending: true });

		if (error) {
			return res.status(500).json({
				error: "Error al obtener escenas",
				details: error.message,
			});
		}

		res.json({ scenes: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 POST /api/chapters/:chapterId/scenes - Create scene
app.post("/api/chapters/:chapterId/scenes", async (req, res) => {
	try {
		const { chapterId } = req.params;
		const {
			title,
			content,
			narration_text,
			dm_notes,
			battle_map_id,
			order_index,
		} = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("scenes")
			.insert({
				chapter_id: chapterId,
				title,
				content,
				narration_text,
				dm_notes,
				battle_map_id: battle_map_id || null,
				order_index: order_index || 0,
			})
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al crear escena",
				details: error.message,
			});
		}

		res.json({ scene: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 PUT /api/scenes/:id - Update scene
app.put("/api/scenes/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const {
			title,
			content,
			narration_text,
			dm_notes,
			battle_map_id,
			order_index,
		} = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("scenes")
			.update({
				title,
				content,
				narration_text,
				dm_notes,
				battle_map_id: battle_map_id || null,
				order_index,
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al actualizar escena",
				details: error.message,
			});
		}

		res.json({ scene: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 DELETE /api/scenes/:id - Delete scene
app.delete("/api/scenes/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { error } = await authenticatedSupabase
			.from("scenes")
			.delete()
			.eq("id", id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar escena",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Escena eliminada correctamente" });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// ================================================
// SCENE ENTITIES ENDPOINTS
// ================================================

// 🆕 GET /api/scenes/:sceneId/entities - List scene entities
app.get("/api/scenes/:sceneId/entities", async (req, res) => {
	try {
		const { sceneId } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("scene_entities")
			.select("*")
			.eq("scene_id", sceneId);

		if (error) {
			return res.status(500).json({
				error: "Error al obtener entidades",
				details: error.message,
			});
		}

		res.json({ entities: data, count: data.length });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 POST /api/scenes/:sceneId/entities - Add entity to scene
app.post("/api/scenes/:sceneId/entities", async (req, res) => {
	try {
		const { sceneId } = req.params;
		const { entity_type, entity_id, entity_name, entity_data } = req.body;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { data, error } = await authenticatedSupabase
			.from("scene_entities")
			.insert({
				scene_id: sceneId,
				entity_type,
				entity_id,
				entity_name,
				entity_data,
			})
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al añadir entidad",
				details: error.message,
			});
		}

		res.json({ entity: data });
	} catch (err) {
		res.status(500).json({
			error: "Error interno",
			details: err.message,
		});
	}
});

// 🆕 DELETE /api/scene-entities/:id - Delete scene entity
app.delete("/api/scene-entities/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{
				global: { headers: { Authorization: `Bearer ${token}` } },
			}
		);

		const { error } = await authenticatedSupabase
			.from("scene_entities")
			.delete()
			.eq("id", id);

		if (error) {
			return res.status(500).json({
				error: "Error al eliminar entidad",
				details: error.message,
			});
		}

		res.json({ success: true, message: "Entidad eliminada correctamente" });
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
