import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "./supabase.js";
import nodemailer from "nodemailer";

// ─── Mailer setup (optional – only sends if SMTP_HOST is configured) ─────────
let transporter = null;
if (process.env.SMTP_HOST) {
	transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT || "587"),
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});
}

const sendSessionEmail = async (
	to,
	campaignTitle,
	sessionNumber,
	dmName,
	appUrl,
) => {
	if (!transporter) {
		console.log(`[EMAIL skipped – SMTP not configured] → ${to}`);
		return;
	}
	try {
		await transporter.sendMail({
			from:
				process.env.SMTP_FROM ||
				"Beyond The Dungeon <noreply@beyondthedungeon.org>",
			to,
			subject: `¡La partida comienza! – ${campaignTitle} (Sesión ${sessionNumber})`,
			html: `
				<div style="font-family:sans-serif;max-width:600px;margin:auto">
					<h2 style="color:#7c3aed">🎲 Beyond The Dungeon</h2>
					<h3>${campaignTitle} – Sesión ${sessionNumber}</h3>
					<p>El Dungeon Master <strong>${dmName}</strong> ha iniciado la sesión.</p>
					<p>Entra a la app para unirte a la partida:</p>
					<a href="${appUrl}/mis-campanas"
					   style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:6px;text-decoration:none">
						Ir a Mis Campañas
					</a>
					<p style="color:#666;font-size:12px;margin-top:24px">
						Recibes este correo porque eres miembro de la campaña en Beyond The Dungeon.
					</p>
				</div>`,
		});
	} catch (err) {
		console.error("[EMAIL ERROR]", err.message);
	}
};

const sendInvitationEmail = async (to, campaignTitle, dmName, appUrl) => {
	if (!transporter) {
		console.log(`[EMAIL skipped – SMTP not configured] → ${to}`);
		return;
	}
	try {
		await transporter.sendMail({
			from:
				process.env.SMTP_FROM ||
				"Beyond The Dungeon <noreply@beyondthedungeon.org>",
			to,
			subject: `Has sido invitado a unirte a "${campaignTitle}" en Beyond The Dungeon`,
			html: `
				<div style="font-family:sans-serif;max-width:600px;margin:auto">
					<h2 style="color:#7c3aed">🎲 Beyond The Dungeon</h2>
					<h3>Invitación a campaña: ${campaignTitle}</h3>
					<p>El Dungeon Master <strong>${dmName}</strong> te ha invitado a unirte a su campaña.</p>
					<p>Entra a <em>Mis Campañas</em> para aceptar o rechazar la invitación:</p>
					<a href="${appUrl}/mis-campanas"
					   style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:6px;text-decoration:none">
						Ver invitación
					</a>
					<p style="color:#666;font-size:12px;margin-top:24px">
						Esta invitación expira en 7 días. Si no reconoces esta solicitud, ignora este correo.
					</p>
				</div>`,
		});
	} catch (err) {
		console.error("[EMAIL ERROR]", err.message);
	}
};

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
		process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
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

// 🆕 Endpoint: obtener un item específico por ID (UUID o slug SRD)
app.get("/api/compendium-items/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const isUUID =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				id,
			);

		let query = supabase.from("compendium_items").select("*");
		if (isUUID) {
			query = query.eq("id", id);
		} else {
			// Buscar por el campo index dentro del JSONB stats
			query = query.filter("stats->>index", "eq", id);
		}

		const { data, error } = await query.single();

		if (error || !data) {
			return res.status(404).json({
				error: "Item no encontrado",
				details: error?.message,
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
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

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
		const campaignId =
			typeof req.query.campaign === "string" ? req.query.campaign : null;

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
			},
		);

		let query = authenticatedSupabase
			.from("characters")
			.select(
				campaignId
					? "*"
					: "id, user_id, campaign_id, name, classes, race, inventory, avatar_url, created_at, updated_at",
			)
			.eq("user_id", req.user.id)
			.eq("is_npc", false)
			.order("created_at", { ascending: false });

		if (campaignId) {
			query = query.eq("campaign_id", campaignId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("❌ Error al listar fichas:", error);
			return res.status(500).json({
				error: "Error al consultar fichas",
				details: error.message,
			});
		}

		// Calcular nivel total de cada personaje para vistas resumidas
		const charactersWithLevel = (data || []).map((char) => {
			const level = Array.isArray(char.classes)
				? char.classes.reduce((sum, cls) => sum + (cls.level || 0), 0)
				: char.classes?.level || 1;
			return { ...char, level, has_inventory: char.inventory != null };
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
			},
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
		console.log(
			"📝 Datos del personaje:",
			JSON.stringify(characterData, null, 2),
		);

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
			},
		);

		// Verificar el usuario autenticado
		const {
			data: { user },
			error: authError,
		} = await authenticatedSupabase.auth.getUser();
		console.log(
			"👤 Usuario autenticado:",
			user?.id,
			"Error:",
			authError?.message,
		);

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
			},
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
			},
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
			},
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
			},
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
			image_data: req.body.image_data
				? `${req.body.image_data.substring(0, 50)}...`
				: null,
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
			},
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
			},
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
			},
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
			},
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Preferred path: RPC that returns campaigns where user is DM or member.
		// This avoids depending on restrictive SELECT RLS policies on campaigns.
		const { data: rpcCampaigns, error: rpcError } =
			await authenticatedSupabase.rpc("get_my_campaigns");

		if (!rpcError) {
			return res.json({
				campaigns: rpcCampaigns || [],
				count: (rpcCampaigns || []).length,
			});
		}

		// Get campaigns where user is DM
		const { data: dmCampaigns, error: dmError } = await authenticatedSupabase
			.from("campaigns")
			.select("*")
			.eq("dm_id", user.id);

		if (dmError) {
			return res.status(500).json({
				error: "Error al obtener campañas",
				details: dmError.message,
			});
		}

		// Get campaign ids where user is a member
		const { data: memberships, error: membersError } =
			await authenticatedSupabase
				.from("campaign_members")
				.select("campaign_id")
				.eq("user_id", user.id);

		if (membersError) {
			return res.status(500).json({
				error: "Error al obtener membresías de campaña",
				details: membersError.message,
			});
		}

		const memberCampaignIds = Array.from(
			new Set((memberships || []).map((m) => m.campaign_id).filter(Boolean)),
		);

		let memberCampaigns = [];
		if (memberCampaignIds.length > 0) {
			const { data: memberData, error: memberCampaignsError } =
				await authenticatedSupabase
					.from("campaigns")
					.select("*")
					.in("id", memberCampaignIds);

			if (memberCampaignsError) {
				return res.status(500).json({
					error: "Error al obtener campañas como miembro",
					details: memberCampaignsError.message,
				});
			}

			memberCampaigns = memberData || [];
		}

		const uniqueCampaignsMap = new Map();
		for (const campaign of [...(dmCampaigns || []), ...memberCampaigns]) {
			uniqueCampaignsMap.set(campaign.id, campaign);
		}

		const campaigns = Array.from(uniqueCampaignsMap.values()).sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
		);

		res.json({ campaigns, count: campaigns.length });
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
			},
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

// 🆕 GET /api/campaigns/:id/my-character - Get my character assigned to this campaign
app.get("/api/campaigns/:id/my-character", requireAuth, async (req, res) => {
	try {
		const { id: campaignId } = req.params;
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
			},
		);

		const { data, error } = await authenticatedSupabase
			.from("characters")
			.select("*")
			.eq("user_id", req.user.id)
			.eq("campaign_id", campaignId)
			.eq("is_npc", false)
			.order("updated_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) {
			return res.status(500).json({
				error: "Error al consultar ficha de campaña",
				details: error.message,
			});
		}

		res.json({ character: data || null });
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
			},
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { title, description, notes } = req.body;

		// Create campaign
		const { data: campaign, error: campaignError } = await authenticatedSupabase
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
			},
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
			},
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
			},
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
			return res
				.status(403)
				.json({ error: "Solo el DM puede transferir el rol" });
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
			},
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

		// Fetch user details from profiles table (requires SELECT policy on profiles for authenticated users)
		const userIds = (data || []).map((m) => m.user_id);
		if (userIds.length === 0) {
			return res.json({ members: [], count: 0 });
		}
		const { data: profiles } = await authenticatedSupabase
			.from("profiles")
			.select("id, username, display_name, email")
			.in("id", userIds);

		const membersWithDetails = data.map((member) => {
			const profile = (profiles || []).find((p) => p.id === member.user_id);
			return {
				...member,
				email: profile?.email || "",
				username: profile?.username || profile?.display_name || "",
			};
		});

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
			},
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Verificar que el usuario que solicita el borrado es el DM
		const { data: campaign } = await authenticatedSupabase
			.from("campaigns")
			.select("dm_id")
			.eq("id", campaignId)
			.single();

		if (!campaign || campaign.dm_id !== user.id) {
			return res
				.status(403)
				.json({ error: "Solo el DM puede eliminar miembros" });
		}

		const { error } = await supabaseAdmin
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
			},
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		const { data, error } = await authenticatedSupabase
			.from("campaign_invitations")
			.select("*, campaigns(title)")
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
			},
		);

		const {
			data: { user },
		} = await authenticatedSupabase.auth.getUser();

		if (!user) {
			return res.status(401).json({ error: "No autorizado" });
		}

		// Find user by username or email in profiles table (case-insensitive)
		const { data: profileMatch, error: profileError } =
			await authenticatedSupabase
				.from("profiles")
				.select("id, username, email")
				.or(`username.ilike.${username},email.ilike.${username}`)
				.limit(1)
				.single();

		if (profileError || !profileMatch) {
			return res.status(404).json({
				error: "Usuario no encontrado",
			});
		}
		const invitedUser = { id: profileMatch.id, email: profileMatch.email };

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

		// Añadir el usuario directamente a la campaña mediante supabaseAdmin (evita RLS que bloquea la inserción por parte del DM a otro usuario)
		const { data, error } = await supabaseAdmin
			.from("campaign_members")
			.insert({
				campaign_id: id,
				user_id: invitedUser.id,
				role: "player",
			})
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				error: "Error al añadir jugador a la campaña",
				details: error.message,
			});
		}

		res.json({ invitation: data }); // Mantenemos el nombre 'invitation' en la respuesta por compatibilidad con el frontend
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
			},
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
			.eq("invited_user_id", user.id)
			.eq("status", "pending")
			.single();

		if (invError || !invitation) {
			return res
				.status(404)
				.json({ error: "Invitación no encontrada o expirada" });
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
			},
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
			.eq("invited_user_id", user.id);

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
			},
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

// GET /api/campaigns/:campaignId/chapters-full
// Devuelve todos los capítulos con sus escenas y entidades en una sola query (evita N+1).
app.get("/api/campaigns/:campaignId/chapters-full", async (req, res) => {
	try {
		const { campaignId } = req.params;
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) return res.status(401).json({ error: "No autorizado" });

		const authenticatedSupabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_ANON_KEY,
			{ global: { headers: { Authorization: `Bearer ${token}` } } },
		);

		const { data, error } = await authenticatedSupabase
			.from("chapters")
			.select(`*, scenes:scenes(*, entities:scene_entities(*))`)
			.eq("campaign_id", campaignId)
			.order("order_index", { ascending: true });

		if (error)
			return res
				.status(500)
				.json({ error: error.message, details: error.message });

		res.json({ chapters: data ?? [] });
	} catch (err) {
		res.status(500).json({ error: "Error interno", details: err.message });
	}
});

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
			},
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
			},
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
			},
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
			},
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
			},
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
			},
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
			},
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
			},
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
			},
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
			},
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
			},
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

// ==============================================================================
// GAME SESSIONS (Partidas Online)
// ==============================================================================

// Helper: crea cliente Supabase autenticado con el token del usuario
const makeAuthClient = (token) =>
	createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
		global: { headers: { Authorization: `Bearer ${token}` } },
	});

// ── GET /api/campaigns/sessions/bulk ────────────────────────────────────────
// Devuelve el estado de sesión (activa o pausada) de múltiples campañas en
// una sola query. Recibe ?ids=id1,id2,... y devuelve { sessions: { [campaignId]: session|null } }
app.get("/api/campaigns/sessions/bulk", requireAuth, async (req, res) => {
	try {
		const ids = (req.query.ids || "")
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		if (ids.length === 0) return res.json({ sessions: {} });

		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);
		const { data, error } = await db
			.from("game_sessions")
			.select("*")
			.in("campaign_id", ids)
			.in("status", ["active", "paused"])
			.order("created_at", { ascending: false });

		if (error) return res.status(500).json({ error: error.message });

		// Para cada campaña, tomar solo la sesión más reciente
		const sessionMap = {};
		ids.forEach((id) => {
			sessionMap[id] = null;
		});
		(data || []).forEach((sess) => {
			if (!sessionMap[sess.campaign_id]) {
				sessionMap[sess.campaign_id] = sess;
			}
		});

		res.json({ sessions: sessionMap });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── GET /api/campaigns/:id/session ──────────────────────────────────────────
// Devuelve la sesión activa o pausada más reciente de la campaña.
// Si no existe devuelve null.  Cualquier miembro puede consultarla.
app.get("/api/campaigns/:id/session", requireAuth, async (req, res) => {
	try {
		const { id: campaignId } = req.params;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		const { data, error } = await db
			.from("game_sessions")
			.select("*")
			.eq("campaign_id", campaignId)
			.in("status", ["active", "paused"])
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (error) return res.status(500).json({ error: error.message });
		res.json({ session: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── POST /api/campaigns/:id/session/start ────────────────────────────────────
// El DM inicia o reanuda la sesión.  Si ya hay una 'paused' la reactiva;
// si no, crea una nueva.  Envía email a todos los miembros.
app.post("/api/campaigns/:id/session/start", requireAuth, async (req, res) => {
	try {
		const { id: campaignId } = req.params;
		const dmId = req.user.id;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		// Verificar que el solicitante es DM de la campaña
		const { data: campaign, error: cError } = await db
			.from("campaigns")
			.select("id, title, dm_id")
			.eq("id", campaignId)
			.single();

		if (cError || !campaign)
			return res.status(404).json({ error: "Campaña no encontrada" });
		if (campaign.dm_id !== dmId)
			return res
				.status(403)
				.json({ error: "Solo el DM puede iniciar la sesión" });

		// Buscar sesión pausada existente
		const { data: existingSession } = await db
			.from("game_sessions")
			.select("*")
			.eq("campaign_id", campaignId)
			.eq("status", "paused")
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		let session;
		if (existingSession) {
			// Reanudar la sesión pausada
			const { data: updated, error: uErr } = await db
				.from("game_sessions")
				.update({ status: "active", started_at: new Date().toISOString() })
				.eq("id", existingSession.id)
				.select()
				.single();
			if (uErr) return res.status(500).json({ error: uErr.message });
			session = updated;
		} else {
			// Contar sesiones anteriores para el session_number
			const { count } = await db
				.from("game_sessions")
				.select("*", { count: "exact", head: true })
				.eq("campaign_id", campaignId);

			const { data: created, error: cErr } = await db
				.from("game_sessions")
				.insert({
					campaign_id: campaignId,
					dm_id: dmId,
					status: "active",
					session_number: (count || 0) + 1,
				})
				.select()
				.single();
			if (cErr) return res.status(500).json({ error: cErr.message });

			// Crear combat_state inicial para la sesión
			await db.from("combat_state").insert({ session_id: created.id });

			session = created;
		}

		// Obtener miembros de la campaña para enviar emails
		const { data: members } = await db
			.from("campaign_members")
			.select("user_id")
			.eq("campaign_id", campaignId);

		if (members && members.length > 0) {
			const userIds = members.map((m) => m.user_id);
			const { data: profiles } = await db
				.from("profiles")
				.select("email, display_name, username")
				.in("id", userIds);

			const { data: dmProfile } = await db
				.from("profiles")
				.select("display_name, username")
				.eq("id", dmId)
				.single();
			const dmName = dmProfile?.display_name || dmProfile?.username || "El DM";

			const appUrl = process.env.APP_URL || "https://beyondthedungeon.org";

			if (profiles) {
				for (const profile of profiles) {
					if (profile.email && profile.email !== req.user.email) {
						await sendSessionEmail(
							profile.email,
							campaign.title,
							session.session_number,
							dmName,
							appUrl,
						);
					}
				}
			}
		}

		res.json({ session });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── PUT /api/sessions/:id/state ───────────────────────────────────────────────
// Guarda el estado de la sesión (mapa, escena activa, etc.). Solo DM.
app.put("/api/sessions/:id/state", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const { session_state, current_scene_id, current_map_id } = req.body;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		const updates = {};
		if (session_state !== undefined) updates.session_state = session_state;
		if (current_scene_id !== undefined)
			updates.current_scene_id = current_scene_id;
		if (current_map_id !== undefined) updates.current_map_id = current_map_id;

		const { data, error } = await db
			.from("game_sessions")
			.update(updates)
			.eq("id", sessionId)
			.eq("dm_id", req.user.id)
			.select()
			.single();

		if (error) return res.status(500).json({ error: error.message });
		if (!data)
			return res
				.status(403)
				.json({ error: "No autorizado o sesión no encontrada" });
		res.json({ session: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── GET /api/sessions/:id/map ─────────────────────────────────────────────────
// Devuelve el mapa activo de la sesión a cualquier miembro de la campaña.
// Usa supabaseAdmin para bypasear RLS (el mapa pertenece al DM, no al jugador).
app.get("/api/sessions/:id/map", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const userId = req.user.id;

		// 1. Obtener la sesión usando supabaseAdmin (bypasa RLS)
		const { data: session, error: sessionError } = await supabaseAdmin
			.from("game_sessions")
			.select("id, campaign_id, current_map_id, dm_id")
			.eq("id", sessionId)
			.single();

		if (sessionError || !session) {
			return res.status(404).json({ error: "Sesión no encontrada" });
		}

		if (!session.current_map_id) {
			return res.json({ map: null });
		}

		// 2. Verificar membresía en la campaña (DM o jugador registrado)
		const isDM = session.dm_id === userId;
		if (!isDM) {
			const { data: membership } = await supabaseAdmin
				.from("campaign_members")
				.select("user_id")
				.eq("campaign_id", session.campaign_id)
				.eq("user_id", userId)
				.maybeSingle();

			if (!membership) {
				return res
					.status(403)
					.json({ error: "No eres miembro de esta campaña" });
			}
		}

		// 3. Obtener el mapa con supabaseAdmin (bypasa RLS de battle_maps)
		const { data: map, error: mapError } = await supabaseAdmin
			.from("battle_maps")
			.select("*")
			.eq("id", session.current_map_id)
			.single();

		if (mapError || !map) {
			console.error("[sessions/:id/map] Error:", mapError?.message);
			return res.status(404).json({ error: "Mapa no encontrado" });
		}

		res.json({ map });
	} catch (err) {
		console.error("[sessions/:id/map] Exception:", err.message);
		res.status(500).json({ error: err.message });
	}
});

// ── PUT /api/sessions/:id/end ─────────────────────────────────────────────────

// El DM termina la sesión guardando el estado final.
app.put("/api/sessions/:id/end", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const { session_state, current_scene_id, current_map_id } = req.body;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		const updates = {
			status: "paused", // paused = reanudable en otra sesión
			ended_at: new Date().toISOString(),
		};
		if (session_state !== undefined) updates.session_state = session_state;
		if (current_scene_id !== undefined)
			updates.current_scene_id = current_scene_id;
		if (current_map_id !== undefined) updates.current_map_id = current_map_id;

		const { data, error } = await db
			.from("game_sessions")
			.update(updates)
			.eq("id", sessionId)
			.eq("dm_id", req.user.id)
			.select()
			.single();

		if (error) return res.status(500).json({ error: error.message });
		if (!data)
			return res
				.status(403)
				.json({ error: "No autorizado o sesión no encontrada" });

		// Keep token map positions/state when pausing so resumed sessions restore
		// the battlefield exactly as it was.

		res.json({ session: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── GET /api/sessions/:id/tokens ─────────────────────────────────────────────
app.get("/api/sessions/:id/tokens", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);
		const { data, error } = await db
			.from("session_tokens")
			.select("*")
			.eq("session_id", sessionId)
			.order("created_at", { ascending: true });

		if (error) return res.status(500).json({ error: error.message });
		res.json({ tokens: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── POST /api/sessions/:id/tokens ────────────────────────────────────────────
app.post("/api/sessions/:id/tokens", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const {
			token_type,
			character_id,
			user_id,
			entity_ref_id,
			entity_name,
			entity_image,
			x,
			y,
			current_hp,
			max_hp,
			initiative_value,
			is_on_map,
			token_color,
			token_size,
		} = req.body;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		const { data, error } = await db
			.from("session_tokens")
			.insert({
				session_id: sessionId,
				token_type: token_type || "player",
				character_id: character_id || null,
				user_id: user_id || null,
				entity_ref_id: entity_ref_id || null,
				entity_name,
				entity_image: entity_image || null,
				x: x ?? 0,
				y: y ?? 0,
				current_hp: current_hp ?? 0,
				max_hp: max_hp ?? 0,
				initiative_value: initiative_value ?? 0,
				is_on_map: is_on_map ?? false,
				token_color: token_color || null,
				token_size: token_size || "M",
			})
			.select()
			.single();

		if (error) return res.status(500).json({ error: error.message });
		res.json({ token: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── PUT /api/sessions/:id/tokens/:tokenId ────────────────────────────────────
app.put("/api/sessions/:id/tokens/:tokenId", requireAuth, async (req, res) => {
	try {
		const { tokenId } = req.params;
		const updates = req.body;
		delete updates.id;
		delete updates.session_id;
		delete updates.created_at;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		const { data, error } = await db
			.from("session_tokens")
			.update(updates)
			.eq("id", tokenId)
			.select()
			.single();

		if (error) return res.status(500).json({ error: error.message });
		res.json({ token: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── DELETE /api/sessions/:id/tokens/:tokenId ─────────────────────────────────
app.delete(
	"/api/sessions/:id/tokens/:tokenId",
	requireAuth,
	async (req, res) => {
		try {
			const { tokenId } = req.params;
			const db = makeAuthClient(req.headers.authorization.split(" ")[1]);
			const { error } = await db
				.from("session_tokens")
				.delete()
				.eq("id", tokenId);

			if (error) return res.status(500).json({ error: error.message });
			res.json({ success: true });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	},
);

// ── GET /api/sessions/:id/combat ─────────────────────────────────────────────
app.get("/api/sessions/:id/combat", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);
		const { data, error } = await db
			.from("combat_state")
			.select("*")
			.eq("session_id", sessionId)
			.maybeSingle();

		if (error) return res.status(500).json({ error: error.message });
		res.json({ combat: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── PUT /api/sessions/:id/combat ─────────────────────────────────────────────
// Actualiza el estado del combate (iniciativa, turno, etc.)
app.put("/api/sessions/:id/combat", requireAuth, async (req, res) => {
	try {
		const { id: sessionId } = req.params;
		const updates = req.body;
		delete updates.id;
		delete updates.session_id;
		delete updates.created_at;
		const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

		const { data, error } = await db
			.from("combat_state")
			.update(updates)
			.eq("session_id", sessionId)
			.select()
			.single();

		if (error) return res.status(500).json({ error: error.message });
		res.json({ combat: data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// ── GET /api/campaigns/:id/members-with-characters ───────────────────────────
// Devuelve los miembros de una campaña junto con su personaje en esa campaña.
app.get(
	"/api/campaigns/:id/members-with-characters",
	requireAuth,
	async (req, res) => {
		try {
			const { id: campaignId } = req.params;
			const db = makeAuthClient(req.headers.authorization.split(" ")[1]);

			const { data: memberships } = await db
				.from("campaign_members")
				.select("user_id, role")
				.eq("campaign_id", campaignId);

			const { data: campaign } = await db
				.from("campaigns")
				.select("dm_id")
				.eq("id", campaignId)
				.single();

			const allMembers = memberships || [];
			// Incluir al DM en la lista de miembros si no está ya
			const userIds = allMembers.map((m) => m.user_id);
			if (campaign && !userIds.includes(campaign.dm_id)) {
				allMembers.push({ user_id: campaign.dm_id, role: "dm" });
			}

			const { data: profiles } = await db
				.from("profiles")
				.select("id, display_name, username, avatar_url, email")
				.in(
					"id",
					allMembers.map((m) => m.user_id),
				);

			const { data: characters } = await db
				.from("characters")
				.select(
					"id, user_id, name, avatar_url, stats, classes, race, inventory, spells_known, equipment, notes, experience_points",
				)
				.eq("campaign_id", campaignId)
				.eq("is_npc", false);

			const result = allMembers.map((m) => {
				const profile = (profiles || []).find((p) => p.id === m.user_id);
				const character = (characters || []).find(
					(c) => c.user_id === m.user_id,
				);
				return {
					user_id: m.user_id,
					role: m.role,
					profile: profile || null,
					character: character || null,
				};
			});

			res.json({ members: result });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	},
);

// ==============================================================================
// ADMIN ENDPOINTS
// ==============================================================================

/**
 * Middleware: requiere que el usuario autenticado tenga is_admin = true en la tabla profiles.
 * Debe ir después de requireAuth (es decir, ambos middlewares en cadena).
 */
const requireAdmin = async (req, res, next) => {
	try {
		const { data: profile, error } = await supabaseAdmin
			.from("profiles")
			.select("is_admin")
			.eq("id", req.user.id)
			.single();

		if (error || !profile?.is_admin) {
			return res.status(403).json({
				error: "Acceso denegado",
				details: "Se requieren permisos de administrador",
			});
		}

		next();
	} catch (err) {
		res
			.status(500)
			.json({ error: "Error al verificar permisos", details: err.message });
	}
};

/**
 * GET /api/admin/stats
 * Devuelve estadísticas globales de uso de la plataforma.
 * Solo accesible para usuarios con is_admin = true.
 */
app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
	try {
		const sevenDaysAgo = new Date(
			Date.now() - 7 * 24 * 60 * 60 * 1000,
		).toISOString();

		// Todas las queries independientes en paralelo
		const [
			authResult,
			recentProfilesResult,
			totalCampaignsResult,
			activeCampaignsResult,
			recentCampaignsResult,
			totalCharactersResult,
			totalBattleMapsResult,
			totalSpellsResult,
			totalMonstersResult,
			totalItemsResult,
		] = await Promise.all([
			supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
			supabaseAdmin
				.from("profiles")
				.select("id, email, username, display_name, created_at, is_admin")
				.order("created_at", { ascending: false })
				.limit(10),
			supabaseAdmin
				.from("campaigns")
				.select("id", { count: "exact", head: true }),
			supabaseAdmin
				.from("campaigns")
				.select("id", { count: "exact", head: true })
				.eq("is_active", true),
			supabaseAdmin
				.from("campaigns")
				.select("id, title, created_at, is_active")
				.order("created_at", { ascending: false })
				.limit(10),
			supabaseAdmin
				.from("characters")
				.select("id", { count: "exact", head: true })
				.eq("is_npc", false),
			supabaseAdmin
				.from("battle_maps")
				.select("id", { count: "exact", head: true }),
			supabaseAdmin
				.from("compendium_spells")
				.select("id", { count: "exact", head: true }),
			supabaseAdmin
				.from("compendium_bestiary")
				.select("id", { count: "exact", head: true }),
			supabaseAdmin
				.from("compendium_items")
				.select("id", { count: "exact", head: true }),
		]);

		const { data: authData, error: authError } = authResult;
		const totalUsers = authError ? 0 : (authData?.users?.length ?? 0);
		const activeUsers = authError
			? 0
			: (authData?.users ?? []).filter(
					(u) => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo,
				).length;

		res.json({
			totalUsers,
			activeUsers,
			totalCampaigns: totalCampaignsResult.count ?? 0,
			activeCampaigns: activeCampaignsResult.count ?? 0,
			totalCharacters: totalCharactersResult.count ?? 0,
			totalBattleMaps: totalBattleMapsResult.count ?? 0,
			totalSpells: totalSpellsResult.count ?? 0,
			totalMonsters: totalMonstersResult.count ?? 0,
			totalItems: totalItemsResult.count ?? 0,
			recentUsers: (recentProfilesResult.data ?? []).map((p) => ({
				id: p.id,
				email: p.email,
				username: p.username,
				display_name: p.display_name,
				created_at: p.created_at,
				is_admin: p.is_admin ?? false,
			})),
			recentCampaigns: (recentCampaignsResult.data ?? []).map((c) => ({
				id: c.id,
				title: c.title,
				created_at: c.created_at,
				is_active: c.is_active ?? false,
			})),
		});
	} catch (err) {
		res
			.status(500)
			.json({ error: "Error al obtener estadísticas", details: err.message });
	}
});

/**
 * PATCH /api/admin/users/:id/promote
 * Promueve a un usuario a administrador (is_admin = true).
 * Solo accesible para admins. No se puede actuar sobre uno mismo.
 */
app.patch(
	"/api/admin/users/:id/promote",
	requireAuth,
	requireAdmin,
	async (req, res) => {
		const targetId = req.params.id;

		if (targetId === req.user.id) {
			return res
				.status(400)
				.json({ error: "No puedes modificar tu propio rol" });
		}

		const { data: target, error: fetchError } = await supabaseAdmin
			.from("profiles")
			.select("id, is_admin")
			.eq("id", targetId)
			.single();

		if (fetchError || !target) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		const { error } = await supabaseAdmin
			.from("profiles")
			.update({ is_admin: true })
			.eq("id", targetId);

		if (error) {
			return res
				.status(500)
				.json({ error: "Error al actualizar el rol", details: error.message });
		}

		res.json({ success: true, message: "Usuario promovido a administrador" });
	},
);

/**
 * DELETE /api/admin/users/:id
 * Elimina un usuario (solo si no es admin).
 * Solo accesible para admins. No se puede eliminar a uno mismo.
 */
app.delete(
	"/api/admin/users/:id",
	requireAuth,
	requireAdmin,
	async (req, res) => {
		const targetId = req.params.id;

		if (targetId === req.user.id) {
			return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
		}

		const { data: target, error: fetchError } = await supabaseAdmin
			.from("profiles")
			.select("id, is_admin")
			.eq("id", targetId)
			.single();

		if (fetchError || !target) {
			return res.status(404).json({ error: "Usuario no encontrado" });
		}

		if (target.is_admin) {
			return res
				.status(403)
				.json({ error: "No se puede eliminar a un administrador" });
		}

		// Eliminar del sistema de autenticación (elimina también el perfil por cascade)
		const { error: deleteError } =
			await supabaseAdmin.auth.admin.deleteUser(targetId);

		if (deleteError) {
			return res.status(500).json({
				error: "Error al eliminar el usuario",
				details: deleteError.message,
			});
		}

		res.json({ success: true, message: "Usuario eliminado correctamente" });
	},
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
	console.log(`btd-backend listening on port ${PORT}`);
});
