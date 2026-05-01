import {
	Compass,
	User,
	Sparkles,
	Skull,
	Package,
	Backpack,
	Dices,
	Map,
	Crown,
	Swords,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface GuideSection {
	title: string;
	content: React.ReactNode;
}

export interface Guide {
	slug: string;
	title: string;
	tagline: string;
	Icon: LucideIcon;
	cardDescription: string;
	category: string;
	categoryColor: string;
	accentClass: string;
	sections: GuideSection[];
}

const Tip = ({ children }: { children: React.ReactNode }) => (
	<div className="my-4 flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
		<span className="text-lg">🎲</span>
		<p className="text-sm text-amber-200/90 leading-relaxed">{children}</p>
	</div>
);

const Note = ({ children }: { children: React.ReactNode }) => (
	<div className="my-4 flex gap-3 rounded-lg border border-sky-500/30 bg-sky-500/10 p-4">
		<span className="text-lg">📜</span>
		<p className="text-sm text-sky-200/90 leading-relaxed">{children}</p>
	</div>
);

const Warning = ({ children }: { children: React.ReactNode }) => (
	<div className="my-4 flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
		<span className="text-lg">⚠️</span>
		<p className="text-sm text-red-300/90 leading-relaxed">{children}</p>
	</div>
);

const StepList = ({
	steps,
}: {
	steps: { num: number; title: string; desc: string }[];
}) => (
	<ol className="my-4 space-y-3">
		{steps.map((s) => (
			<li key={s.num} className="flex gap-4">
				<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
					{s.num}
				</span>
				<div>
					<p className="font-semibold text-amber-100">{s.title}</p>
					<p className="text-sm text-stone-400 mt-0.5">{s.desc}</p>
				</div>
			</li>
		))}
	</ol>
);

const FeatureGrid = ({
	items,
}: {
	items: { icon: string; title: string; desc: string }[];
}) => (
	<div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
		{items.map((item) => (
			<div
				key={item.title}
				className="rounded-lg border border-dark-border bg-dark-card/60 p-4"
			>
				<div className="flex items-center gap-2 mb-1.5">
					<span className="text-xl">{item.icon}</span>
					<span className="font-semibold text-amber-100 text-sm">{item.title}</span>
				</div>
				<p className="text-xs text-stone-400 leading-relaxed">{item.desc}</p>
			</div>
		))}
	</div>
);

// ─── GUÍAS ────────────────────────────────────────────────────────────────────

export const GUIDES: Guide[] = [
	// ── 1. PRIMEROS PASOS ────────────────────────────────────────────────────
	{
		slug: "primeros-pasos",
		title: "Primeros Pasos",
		tagline: "Tu aventura comienza aquí",
		Icon: Compass,
		cardDescription:
			"Descubre Beyond the Dungeon, crea tu cuenta y aprende a moverte por todas sus herramientas. El mapa de la mazmorra está en tus manos.",
		category: "General",
		categoryColor: "text-emerald-400",
		accentClass: "from-emerald-900/60 to-teal-900/40 border-emerald-700/40",
		sections: [
			{
				title: "Bienvenido, Aventurero",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Beyond the Dungeon es tu mesa de juego virtual para Dungeons &
							Dragons 5ª Edición. Tanto si eres el Dungeon Master que diseña
							mundos como el jugador que forja héroes, aquí encontrarás todo lo
							que necesitas para vivir aventuras épicas, ya sea en solitario o con
							tu grupo.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							La aplicación está dividida en tres grandes pilares: el{" "}
							<strong className="text-amber-300">Compendio</strong> (todo el
							conocimiento del mundo),{" "}
							<strong className="text-amber-300">Herramientas</strong> (lo que
							necesitas en la mesa) y las{" "}
							<strong className="text-amber-300">Campañas</strong> (donde la
							historia cobra vida).
						</p>
					</>
				),
			},
			{
				title: "Crear una Cuenta",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Muchas funciones están disponibles sin cuenta: puedes explorar el
							Compendio, lanzar dados, gestionar un inventario temporal y crear
							fichas de personaje. Sin embargo, para{" "}
							<strong className="text-amber-300">guardar tu progreso</strong>,
							unirte o crear campañas, y sincronizar tus mapas, necesitarás
							registrarte.
						</p>
						<StepList
							steps={[
								{
									num: 1,
									title: 'Haz clic en "Crear Cuenta"',
									desc: "Está en la barra superior derecha, en color dorado.",
								},
								{
									num: 2,
									title: "Introduce tu nombre de usuario, correo y contraseña",
									desc: "El nombre de usuario es cómo te verán otros aventureros.",
								},
								{
									num: 3,
									title: "Confirma tu correo electrónico",
									desc: "Revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
								},
								{
									num: 4,
									title: "¡Listo! Inicia sesión",
									desc: 'Usa "Iniciar Sesión" con tus credenciales para acceder a tu panel.',
								},
							]}
						/>
						<Tip>
							Si no recibes el correo de verificación en unos minutos, revisa la
							carpeta de spam. Las mazmorras digitales también tienen sus
							trampas.
						</Tip>
					</>
				),
			},
			{
				title: "Navegar la Aplicación",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La barra de navegación superior es tu brújula. Desde ella accedes
							a todo:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "📚",
									title: "Compendio",
									desc: "Hechizos, Bestiario y Objetos. La enciclopedia del aventurero.",
								},
								{
									icon: "🛠️",
									title: "Herramientas",
									desc: "Fichas de personaje, dados, mapa de batalla e inventario.",
								},
								{
									icon: "👤",
									title: "Mi Panel",
									desc: "Aparece al iniciar sesión. Acceso a tus campañas, mapas y ajustes.",
								},
								{
									icon: "🌙",
									title: "Modo Oscuro",
									desc: "El botón de luna/sol alterna entre el modo claro y oscuro.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Sin Cuenta, También Juegas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							No todo requiere registro. Como aventurero libre (sin cuenta)
							puedes:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								Explorar el Compendio completo de hechizos, monstruos y objetos.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								Usar el lanzador de dados con historial de sesión.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								Crear fichas de personaje (se pierden al cerrar el navegador si
								no guardas).
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								Gestionar un inventario guardado en tu navegador.
							</li>
						</ul>
						<Warning>
							Los datos guardados localmente (sin cuenta) se pierden si limpias
							el caché del navegador. ¡Regístrate para no perder a tu héroe!
						</Warning>
					</>
				),
			},
		],
	},

	// ── 2. FICHAS DE PERSONAJE ────────────────────────────────────────────────
	{
		slug: "fichas-de-personaje",
		title: "Fichas de Personaje",
		tagline: "Forja a tu héroe",
		Icon: User,
		cardDescription:
			"Crea personajes completos de D&D 5e con razas, clases, características, habilidades, inventario y mucho más. Tu leyenda, en un solo lugar.",
		category: "Herramienta",
		categoryColor: "text-sky-400",
		accentClass: "from-sky-900/60 to-indigo-900/40 border-sky-700/40",
		sections: [
			{
				title: "Por Qué una Buena Ficha lo Cambia Todo",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Una ficha de personaje no es solo papel y números: es la identidad
							de tu héroe, su historia y sus capacidades condensadas en una sola
							hoja. Beyond the Dungeon te ofrece una ficha digital completa y
							siempre accesible, pensada para D&D 5ª Edición.
						</p>
						<Note>
							Puedes tener múltiples fichas guardadas: un paladín para la
							campaña del martes y un pícaro para la del sábado, sin
							interferencias.
						</Note>
					</>
				),
			},
			{
				title: "Crear una Ficha Nueva",
				content: (
					<>
						<StepList
							steps={[
								{
									num: 1,
									title: 'Ve a "Herramientas → Fichas de Personaje"',
									desc: "O directamente a /fichas desde la barra de navegación.",
								},
								{
									num: 2,
									title: '"Nueva Ficha"',
									desc: "El botón dorado en la esquina superior derecha abre el editor.",
								},
								{
									num: 3,
									title: "Rellena la información básica",
									desc: "Nombre, raza, clase, trasfondo y puntos de experiencia.",
								},
								{
									num: 4,
									title: "Asigna las Características",
									desc: "Las 6 puntuaciones fundamentales. El sistema calcula los modificadores automáticamente.",
								},
								{
									num: 5,
									title: "Guarda",
									desc: "Se requiere cuenta para guardar en la nube. Sin cuenta, se guarda localmente.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Raza, Clase y Trasfondo",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El editor incluye listas desplegables con todas las opciones de D&D
							5e del Manual del Jugador:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "🧝",
									title: "Razas",
									desc: "Humano, Elfo, Enano, Mediano, Gnomo, Semiorco, Tiefling, Dracónido y más.",
								},
								{
									icon: "⚔️",
									title: "Clases",
									desc: "Las 12 clases base: Bárbaro, Bardo, Clérigo, Druida, Guerrero, Mago, Monje, Paladín, Explorador, Pícaro, Hechicero y Brujo.",
								},
								{
									icon: "📖",
									title: "Trasfondos",
									desc: "Acólito, Artesano, Charlatán, Criminal, Erudito, Forastero, Héroe del Pueblo y más.",
								},
								{
									icon: "🎯",
									title: "Habilidades",
									desc: "Las 18 habilidades de D&D con sus características asociadas, para una referencia rápida.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Las Seis Características y Sus Derivados",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Introduce los valores de tus seis características (de 1 a 30) y el
							sistema calculará automáticamente los modificadores y los derivados:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-red-400 font-bold">FUE</span>— Capacidad
								de carga, ataques cuerpo a cuerpo sin arma.
							</li>
							<li className="flex gap-2">
								<span className="text-green-400 font-bold">DES</span>— Clase de
								Armadura (si no usas armadura pesada), Iniciativa.
							</li>
							<li className="flex gap-2">
								<span className="text-orange-400 font-bold">CON</span>— Puntos
								de Golpe por nivel.
							</li>
							<li className="flex gap-2">
								<span className="text-blue-400 font-bold">INT</span>— Hechizos
								de Mago, Arcano y conocimiento.
							</li>
							<li className="flex gap-2">
								<span className="text-purple-400 font-bold">SAB</span>— Hechizos
								de Clérigo y Druida, Percepción.
							</li>
							<li className="flex gap-2">
								<span className="text-pink-400 font-bold">CAR</span>— Hechizos
								de Brujo, Hechicero y Bardo. Persuasión.
							</li>
						</ul>
						<Tip>
							El modificador de una característica es (valor − 10) / 2,
							redondeado hacia abajo. Una FUE de 16 da +3; una INT de 8 da −1.
						</Tip>
					</>
				),
			},
			{
				title: "Multiclase",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Beyond the Dungeon soporta <strong className="text-amber-300">multiclase</strong>: puedes
							añadir varias clases a tu personaje con distintos niveles en cada
							una. Perfecto para el Guerrero/Mago que siempre quisiste jugar o el
							mítico Bardo/Pícaro.
						</p>
						<Note>
							El nivel total del personaje es la suma de niveles en todas sus
							clases. Un Paladín 5 / Hechicero 3 es un personaje de nivel 8.
						</Note>
					</>
				),
			},
			{
				title: "Inventario en la Ficha",
				content: (
					<p className="text-stone-300 leading-relaxed">
						Cada ficha incluye el gestor visual de inventario completo: el maniquí
						de equipo con sus 12 ranuras, consumibles, mochila y monedas. Todo
						vinculado al Compendio de Objetos para que puedas consultar las
						propiedades de cualquier pieza de equipo sin salir de la ficha.
					</p>
				),
			},
		],
	},

	// ── 3. COMPENDIO DE HECHIZOS ──────────────────────────────────────────────
	{
		slug: "compendio-hechizos",
		title: "Compendio de Hechizos",
		tagline: "El grimorio arcano",
		Icon: Sparkles,
		cardDescription:
			"Explora cientos de conjuros de D&D 5e filtrados por nivel y escuela. Desde el humilde truquillo hasta las magias más devastadoras del multiverso.",
		category: "Compendio",
		categoryColor: "text-violet-400",
		accentClass: "from-violet-900/60 to-purple-900/40 border-violet-700/40",
		sections: [
			{
				title: "El Grimorio",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El Compendio de Hechizos es la enciclopedia mágica de Beyond the
							Dungeon. Contiene todos los conjuros del Sistema de Referencia de
							D&D 5e (SRD), listos para consultar en cualquier momento, sin
							necesidad de tener el libro delante.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							Cada hechizo incluye su ficha completa: componentes, tiempo de
							lanzamiento, alcance, duración, concentración, rituales y
							descripción detallada con todos los escalados de nivel.
						</p>
					</>
				),
			},
			{
				title: "Buscar y Filtrar",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La barra de búsqueda filtra hechizos por nombre en tiempo real.
							Además, puedes filtrar por nivel:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "✨",
									title: "Trucos (Nivel 0)",
									desc: "Hechizos menores que se lanzan sin gastar espacios de conjuro.",
								},
								{
									icon: "🔮",
									title: "Niveles 1–9",
									desc: "Filtra exactamente el nivel que buscas. Los niveles más altos son los más poderosos.",
								},
								{
									icon: "🔍",
									title: "Paginación",
									desc: "Elige cuántos hechizos ver por página: 10, 25 ó 50.",
								},
								{
									icon: "🏫",
									title: "Escuelas de Magia",
									desc: "Cada hechizo muestra su escuela con un color identificativo en la tarjeta.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Colores del Conjuro",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Las tarjetas de hechizo usan código de colores para identificar de
							un vistazo el nivel y la escuela:
						</p>
						<ul className="mt-3 space-y-1.5 text-sm">
							<li className="flex items-center gap-2">
								<span className="px-2 py-0.5 rounded bg-gray-700 text-gray-200 text-xs font-bold">
									Truco
								</span>
								<span className="text-stone-400">Gris — cantrips</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="px-2 py-0.5 rounded bg-green-800 text-green-200 text-xs font-bold">
									Nv 1
								</span>
								<span className="text-stone-400">Verde — hechizos de nivel 1</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="px-2 py-0.5 rounded bg-blue-800 text-blue-200 text-xs font-bold">
									Nv 3–4
								</span>
								<span className="text-stone-400">Azul — nivel medio</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="px-2 py-0.5 rounded bg-violet-800 text-violet-200 text-xs font-bold">
									Nv 9
								</span>
								<span className="text-stone-400">Violeta — el pináculo de la magia</span>
							</li>
						</ul>
						<Tip>
							Las escuelas de magia también tienen colores propios: Evocación en
							rojo sangre, Nigromancia en gris ceniza, Ilusión en azul zafiro...
						</Tip>
					</>
				),
			},
			{
				title: "La Ficha del Hechizo",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Haz clic en cualquier hechizo para ver su ficha completa. Encontrarás:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Tiempo de lanzamiento</strong>: acción, acción adicional,
								reacción, minutos u horas.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Alcance y área de efecto</strong>: si golpea a uno o a
								toda una sala.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Componentes</strong>: V (verbal), S (somático) y M
								(material, con descripción del componente).
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Concentración y Ritual</strong>: marcados con badges
								destacados.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Escalado por nivel</strong>: qué mejora al lanzarlo en
								un espacio superior.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Clases</strong>: qué clases pueden aprenderlo.
							</li>
						</ul>
					</>
				),
			},
			{
				title: "Modo Selección",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Cuando el editor de campaña te envía al Compendio para elegir un
							hechizo como entidad de escena, el compendio entra en{" "}
							<strong className="text-amber-300">Modo Selección</strong>. Verás
							un banner informativo en la parte superior y al hacer clic en un
							hechizo, este se añade directamente a tu escena sin necesidad de
							copiar IDs manualmente.
						</p>
						<Note>
							El modo selección también funciona para monstruos y objetos. Es el
							sistema que conecta el Compendio con el editor de campañas.
						</Note>
					</>
				),
			},
		],
	},

	// ── 4. BESTIARIO ─────────────────────────────────────────────────────────
	{
		slug: "bestiario",
		title: "Compendio del Bestiario",
		tagline: "El libro de las bestias",
		Icon: Skull,
		cardDescription:
			"Cientos de criaturas con sus bloques de estadísticas completos. Dragones, no-muertos, demonios y más. Conoce a tus enemigos antes de enfrentarlos.",
		category: "Compendio",
		categoryColor: "text-red-400",
		accentClass: "from-red-900/60 to-rose-900/40 border-red-700/40",
		sections: [
			{
				title: "La Galería de los Horrores",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El Bestiario de Beyond the Dungeon recoge todas las criaturas del
							SRD de D&D 5e con sus bloques de estadísticas completos. Es la
							herramienta perfecta para el Dungeon Master que prepara un
							encuentro o el jugador que quiere saber a qué se enfrenta (aunque,
							en el espíritu del juego, a veces es mejor no saber).
						</p>
					</>
				),
			},
			{
				title: "Buscar Criaturas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Usa la barra de búsqueda para filtrar criaturas por nombre. Las
							tarjetas muestran de un vistazo:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "⭐",
									title: "Nivel de Desafío (CR)",
									desc: "De 0 a 30. Indica la dificultad del encuentro para un grupo de cuatro aventureros.",
								},
								{
									icon: "🛡️",
									title: "Clase de Armadura",
									desc: "La dificultad para golpear a esta criatura. Puede incluir el tipo de armadura.",
								},
								{
									icon: "❤️",
									title: "Puntos de Golpe",
									desc: "La cantidad de daño que puede absorber antes de caer.",
								},
								{
									icon: "📐",
									title: "Tamaño y Tipo",
									desc: "Diminuto, Pequeño, Mediano, Grande, Enorme, Gargantuesco. Y la categoría: bestia, humanoide, no-muerto...",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Entender un Bloque de Estadísticas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La ficha completa de una criatura es todo lo que necesitas para
							dirigirla en combate. Está dividida en secciones claras:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Características</strong>: las 6 puntuaciones (FUE, DES,
								CON, INT, SAB, CAR) con sus modificadores.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Competencias</strong>: habilidades en las que la criatura
								tiene bono de competencia.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Sentidos</strong>: visión en la oscuridad, percepción
								pasiva, tremorsense...
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Idiomas</strong>: qué lenguas habla o entiende.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Habilidades Especiales</strong>: rasgos únicos que
								definen a la criatura.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Acciones</strong>: qué puede hacer en su turno.
							</li>
						</ul>
					</>
				),
			},
			{
				title: "Resistencias, Vulnerabilidades e Inmunidades",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Uno de los datos más tácticos del bloque de estadísticas. Saber
							que un zombie es inmune al veneno puede salvar vidas. O que un
							vampiro tiene resistencia al daño no mágico.
						</p>
						<FeatureGrid
							items={[
								{
									icon: "💀",
									title: "Vulnerabilidad",
									desc: "Recibe el doble de daño de ese tipo. Clava el martillo contra el esqueleto.",
								},
								{
									icon: "🔰",
									title: "Resistencia",
									desc: "Solo recibe la mitad del daño. Muchos demonios resisten fuego, frío y rayo.",
								},
								{
									icon: "🚫",
									title: "Inmunidad",
									desc: "Daño nulo de ese tipo. Los no-muertos ignoran el veneno y el daño psíquico.",
								},
							]}
						/>
						<Tip>
							Los magos tienen sus libros de hechizos. Los buenos DMs leen el
							Bestiario. Conocer las resistencias de tus enemigos antes de la
							partida puede hacer la diferencia entre una batalla épica y un
							baño de sangre (del lado equivocado).
						</Tip>
					</>
				),
			},
			{
				title: "Acciones Legendarias y Especiales",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Las criaturas legendarias, como dragones, liches o dioses menores,
							tienen un apartado especial de{" "}
							<strong className="text-amber-300">Acciones Legendarias</strong>{" "}
							que pueden usar fuera de su turno, y{" "}
							<strong className="text-amber-300">Resistencias Legendarias</strong>{" "}
							para superar tiradas de salvación catastróficas.
						</p>
						<Warning>
							Si encuentras una criatura con Acciones Legendarias, prepárate.
							Estas bestias están diseñadas para ser el clímax de una campaña, no
							para una tarde cualquiera de juego.
						</Warning>
					</>
				),
			},
		],
	},

	// ── 5. OBJETOS ───────────────────────────────────────────────────────────
	{
		slug: "compendio-objetos",
		title: "Compendio de Objetos",
		tagline: "La tienda del aventurero",
		Icon: Package,
		cardDescription:
			"Todo el equipo de D&D 5e en un catálogo filtrable: armas, armaduras, pociones, artefactos mágicos y más. Equipa a tu héroe con lo mejor.",
		category: "Compendio",
		categoryColor: "text-amber-400",
		accentClass: "from-amber-900/60 to-yellow-900/40 border-amber-700/40",
		sections: [
			{
				title: "El Catálogo del Mercader",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El Compendio de Objetos es tu escaparate de aventurero: desde una
							humilde antorcha hasta la espada larga más legendaria, pasando por
							pociones de curación, pergaminos mágicos y artefactos que cambian
							el destino del mundo. Todo el equipo del SRD de D&D 5e, organizado
							y listo para usar.
						</p>
					</>
				),
			},
			{
				title: "Categorías de Equipo",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Filtra los objetos por categoría para encontrar exactamente lo que
							buscas:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "⚔️",
									title: "Armas",
									desc: "Espadas, mazas, arcos, dagas. Con dados de daño y propiedades.",
								},
								{
									icon: "🛡️",
									title: "Armaduras",
									desc: "Cuero, cota de malla, plate. Con CA y requisitos de fuerza.",
								},
								{
									icon: "🧪",
									title: "Pociones",
									desc: "De curación, de velocidad, de invisibilidad... el alquimista te espera.",
								},
								{
									icon: "📜",
									title: "Pergaminos",
									desc: "Hechizos capturados en papel. Úsalos una vez, con sabiduría.",
								},
								{
									icon: "💍",
									title: "Anillos y Varitas",
									desc: "Objetos mágicos de alta rareza. Cada uno con poderes únicos.",
								},
								{
									icon: "🎒",
									title: "Equipo de Aventura",
									desc: "Cuerdas, escalas, antorchas, tiendas de campaña. Lo que todo héroe lleva.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "La Ficha del Objeto",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Haz clic en cualquier objeto para ver su ficha completa con:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Coste</strong>: en piezas de oro, plata o cobre.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Peso</strong>: en libras, para el cálculo de carga.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Dados de daño</strong>: para armas. P. ej., 1d8 para
								espada larga.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Propiedades</strong>: Versátil, Sutil, Alcance, Arrojadiza...
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Rareza</strong>: Común, Infrecuente, Raro, Muy Raro,
								Legendario.
							</li>
						</ul>
						<Tip>
							Los objetos del Compendio están vinculados al sistema de
							Inventario. Al equipar un objeto desde tu inventario, puedes
							consultar su ficha completa con un solo clic.
						</Tip>
					</>
				),
			},
		],
	},

	// ── 6. INVENTARIO ────────────────────────────────────────────────────────
	{
		slug: "inventario",
		title: "Inventario",
		tagline: "La mochila del aventurero",
		Icon: Backpack,
		cardDescription:
			"Un inventario visual con maniquí de equipo de 12 ranuras, sistema de monedas, consumibles y cálculo de carga. Tu equipo, siempre a mano.",
		category: "Herramienta",
		categoryColor: "text-orange-400",
		accentClass: "from-orange-900/60 to-amber-900/40 border-orange-700/40",
		sections: [
			{
				title: "Tu Arsenal de Aventurero",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El gestor de inventario de Beyond the Dungeon va más allá de una
							lista de objetos. Es un sistema completo con{" "}
							<strong className="text-amber-300">maniquí de equipo visual</strong>
							, control de consumibles, monedas y cálculo de capacidad de carga.
							Perfecto tanto para consulta rápida en partida como para planificar
							el equipo de tu personaje.
						</p>
					</>
				),
			},
			{
				title: "El Maniquí de Equipo",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La imagen central del inventario muestra un maniquí con{" "}
							<strong className="text-amber-300">12 ranuras de equipo</strong>{" "}
							posicionadas sobre la silueta del cuerpo:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "⛑️",
									title: "Casco",
									desc: "Parte superior de la cabeza.",
								},
								{
									icon: "📿",
									title: "Amuleto",
									desc: "Al cuello. Artefactos mágicos y protecciones.",
								},
								{
									icon: "🥋",
									title: "Armadura",
									desc: "El torso. Determina la CA base.",
								},
								{
									icon: "🧥",
									title: "Capa",
									desc: "Espalda. A menudo tiene propiedades mágicas.",
								},
								{
									icon: "🗡️",
									title: "Mano Principal / Secundaria",
									desc: "Arma, escudo o segundo arma para combate dual.",
								},
								{
									icon: "🧤",
									title: "Guantes",
									desc: "Manos. Pueden mejorar la CA o dar ventaja en habilidades.",
								},
								{
									icon: "💍",
									title: "Anillos (×2)",
									desc: "Dos ranuras para anillos mágicos.",
								},
								{
									icon: "👢",
									title: "Botas",
									desc: "Pies. Velocidad, sigilo o protecciones elementales.",
								},
								{
									icon: "🐴",
									title: "Montura",
									desc: "Tu caballo, hipogrifo o lo que viajes encima.",
								},
							]}
						/>
						<Tip>
							Haz clic en cualquier ranura vacía para abrir el Compendio de
							Objetos filtrado por el tipo adecuado. ¡Nada de equipar un casco
							en la ranura de botas!
						</Tip>
					</>
				),
			},
			{
				title: "Consumibles",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Debajo del maniquí encontrarás tres secciones de consumibles:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">🧪</span>
								<div>
									<strong>Pociones</strong>: añade pociones de cualquier tipo
									con su cantidad. El botón −/+ gestiona el stock en tiempo real.
								</div>
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">📜</span>
								<div>
									<strong>Pergaminos</strong>: registra los pergaminos de
									hechizos que llevas.
								</div>
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🏹</span>
								<div>
									<strong>Munición</strong>: flechas, virotes, bolas de honda.
									Lleva la cuenta de cada tipo.
								</div>
							</li>
						</ul>
					</>
				),
			},
			{
				title: "La Mochila y las Monedas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La sección de{" "}
							<strong className="text-amber-300">Mochila</strong> es para objetos
							que no se equipan pero se llevan encima: cuerdas, antorchas, kits
							de sanación... Cada objeto añadido suma a tu peso total.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							Las{" "}
							<strong className="text-amber-300">monedas</strong> siguen el
							sistema estándar de D&D 5e:
						</p>
						<ul className="mt-2 space-y-1 text-sm text-stone-400">
							<li>
								<strong className="text-yellow-300">PP</strong> — Piezas de
								Platino (1 PP = 10 PO)
							</li>
							<li>
								<strong className="text-yellow-500">PO</strong> — Piezas de Oro
								(moneda estándar)
							</li>
							<li>
								<strong className="text-amber-600">PE</strong> — Piezas de
								Electrum (1 PE = 5 PA)
							</li>
							<li>
								<strong className="text-gray-400">PA</strong> — Piezas de Plata
								(10 PA = 1 PO)
							</li>
							<li>
								<strong className="text-orange-700">PC</strong> — Piezas de
								Cobre (10 PC = 1 PA)
							</li>
						</ul>
					</>
				),
			},
			{
				title: "Capacidad de Carga",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Introduce tu puntuación de{" "}
							<strong className="text-amber-300">Fuerza</strong> y el sistema
							calculará automáticamente tu capacidad de carga máxima (FUE × 15
							libras en D&D 5e estándar). Una barra de progreso visual te muestra
							cuánto puedes cargar todavía antes de sufrir penalizaciones por
							sobrecarga.
						</p>
						<Warning>
							Superar la capacidad de carga hace que tu velocidad se reduzca a 5
							pies y aplica desventaja en tiradas de FUE, DES y CON. ¡Un
							aventurero lento es un aventurero muerto!
						</Warning>
					</>
				),
			},
			{
				title: "Guardar el Inventario",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El inventario tiene dos modos de persistencia:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-stone-400">🖥️</span>
								<div>
									<strong>Sin cuenta</strong>: guardado en el
									<em>localStorage</em> del navegador. Persiste entre sesiones
									pero se pierde al limpiar el caché o cambiar de dispositivo.
								</div>
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">☁️</span>
								<div>
									<strong>Con cuenta</strong>: sincronizado con la nube
									(Supabase). Accede a tu inventario desde cualquier dispositivo.
								</div>
							</li>
						</ul>
					</>
				),
			},
		],
	},

	// ── 7. DADOS ─────────────────────────────────────────────────────────────
	{
		slug: "tirada-de-dados",
		title: "Tirada de Dados",
		tagline: "El destino en tus manos",
		Icon: Dices,
		cardDescription:
			"Lanza d4, d6, d8, d10, d12 y d20 con ventaja, desventaja y modificadores. El azar justo y transparente, siempre que lo necesites.",
		category: "Herramienta",
		categoryColor: "text-yellow-400",
		accentClass: "from-yellow-900/60 to-amber-900/40 border-yellow-700/40",
		sections: [
			{
				title: "Los Dados del Destino",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							En D&D, los dados son la voz de los dioses, el filo del azar que
							decide si el héroe triunfa o fracasa. Beyond the Dungeon incluye un
							lanzador de dados completo, ideal tanto para partidas presenciales
							(si prefieres tirar digitalmente) como para el juego en remoto.
						</p>
					</>
				),
			},
			{
				title: "Los Tipos de Dado",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Tienes a tu disposición los seis dados de D&D 5e:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "🎲",
									title: "d4",
									desc: "El más pequeño. Daño de daga, bastón. También para magia menor.",
								},
								{
									icon: "🎲",
									title: "d6",
									desc: "Dados de vida de Pícaro y Hechicero. Daño de espada corta o hacha de mano.",
								},
								{
									icon: "🎲",
									title: "d8",
									desc: "Dado de vida de Clérigo y Paladín. Daño de espada larga a una mano.",
								},
								{
									icon: "🎲",
									title: "d10",
									desc: "Dado de vida de Guerrero. Daño de alabarda o espada larga a dos manos.",
								},
								{
									icon: "🎲",
									title: "d12",
									desc: "El dado del Bárbaro. Daño de hacha grande.",
								},
								{
									icon: "🎲",
									title: "d20",
									desc: "El rey. Para ataques, tiradas de salvación y verificaciones de habilidad.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Ventaja y Desventaja",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Uno de los mecánismos más elegantes de D&D 5e. Cuando tienes{" "}
							<strong className="text-emerald-400">Ventaja</strong>, lanzas dos
							dados y te quedas con el resultado más alto. Con{" "}
							<strong className="text-red-400">Desventaja</strong>, te quedas con
							el más bajo.
						</p>
						<FeatureGrid
							items={[
								{
									icon: "⬆️",
									title: "Ventaja",
									desc: "Tiras 2d20, usas el mayor. Se activa cuando estás en una posición favorable.",
								},
								{
									icon: "⬇️",
									title: "Desventaja",
									desc: "Tiras 2d20, usas el menor. Se aplica en condiciones desfavorables.",
								},
								{
									icon: "⚖️",
									title: "Normal",
									desc: "Sin modificadores de ventaja. Una tirada limpia.",
								},
							]}
						/>
						<Tip>
							Si tienes ventaja y desventaja a la vez en la misma tirada, se
							anulan mutuamente y tiras normal, independientemente de cuántas
							fuentes de ventaja o desventaja tengas.
						</Tip>
					</>
				),
			},
			{
				title: "Modificadores Numéricos",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Además de ventaja/desventaja, puedes añadir un{" "}
							<strong className="text-amber-300">modificador numérico</strong> a
							la tirada. Introduce un número positivo (bono) o negativo
							(penalización). El resultado final mostrará el valor del dado más el
							modificador.
						</p>
						<p className="mt-3 text-stone-300 text-sm leading-relaxed">
							Ejemplo: tiradas de ataque con espada larga para un Guerrero de
							nivel 5 con FUE 18 serían <em>d20 + 7</em> (+4 por FUE, +3 por bono
							de competencia).
						</p>
					</>
				),
			},
			{
				title: "Historial de Tiradas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El lanzador guarda las últimas{" "}
							<strong className="text-amber-300">50 tiradas</strong> de la
							sesión actual. El historial persiste mientras no recargues la
							página. Cada entrada muestra el tipo de dado, modificadores y el
							resultado final.
						</p>
						<Note>
							El historial se almacena en la sesión del navegador (sessionStorage)
							y se borra al cerrar la pestaña. Es perfecto para revisar tiradas
							recientes durante una partida sin perder el contexto de lo que
							pasó.
						</Note>
					</>
				),
			},
			{
				title: "Dados Durante la Partida",
				content: (
					<p className="text-stone-300 leading-relaxed">
						Cuando estás en una partida activa (
						<strong className="text-amber-300">VTT</strong>), los dados están
						disponibles como un overlay en la barra inferior de la pantalla de
						partida. No necesitas salir de la sesión para lanzar: haz clic en el
						icono de dados de la barra inferior y el panel de dados se superpone
						sobre el mapa sin interrumpir la partida.
					</p>
				),
			},
		],
	},

	// ── 8. MAPA DE BATALLA ───────────────────────────────────────────────────
	{
		slug: "mapa-de-batalla",
		title: "Mapa de Batalla",
		tagline: "El campo de batalla",
		Icon: Map,
		cardDescription:
			"Editor de mapas tácticos con cuadrícula configurable, zoom, pan y guardado en la nube. Sube cualquier imagen y conviértela en tu escenario de combate.",
		category: "Herramienta",
		categoryColor: "text-teal-400",
		accentClass: "from-teal-900/60 to-cyan-900/40 border-teal-700/40",
		sections: [
			{
				title: "El Campo de Batalla",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El editor de Mapa de Batalla es una herramienta de tablero táctico
							que te permite subir cualquier imagen como fondo y superponerle una
							cuadrícula configurable. Perfecto para preparar encuentros de
							combate, diseñar mazmorras o reproducir escenas de la campaña.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							Los mapas guardados se pueden vincular directamente a las{" "}
							<strong className="text-amber-300">escenas de tus campañas</strong>
							, de forma que en la partida en vivo el DM pueda cargar el mapa del
							encuentro con un solo clic.
						</p>
					</>
				),
			},
			{
				title: "Subir un Mapa",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El editor acepta cualquier imagen en formato PNG, JPG, WebP o GIF
							como fondo del mapa. Simplemente arrastra el archivo sobre el
							editor o usa el botón de carga.
						</p>
						<StepList
							steps={[
								{
									num: 1,
									title: "Ve a Herramientas → Mapa de Batalla",
									desc: "O directamente a /mapa-batalla.",
								},
								{
									num: 2,
									title: "Sube tu imagen de fondo",
									desc: "Cualquier ilustración de mazmorra, bosque, taberna o campo abierto sirve.",
								},
								{
									num: 3,
									title: "Configura la cuadrícula",
									desc: "Ajusta el tamaño de celda y el color de la línea de cuadrícula.",
								},
								{
									num: 4,
									title: "Guarda el mapa",
									desc: "Requiere cuenta. El mapa se guarda en Mis Mapas para usar en campañas.",
								},
							]}
						/>
						<Tip>
							¿No tienes imágenes de mapas? Busca «D&D battle map» en sitios
							como Dungeon Masters Guild o Reddit (r/battlemaps). Hay miles de
							mapas gratuitos para todos los entornos imaginables.
						</Tip>
					</>
				),
			},
			{
				title: "La Cuadrícula",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La cuadrícula táctica es el alma del combate posicional en D&D. El
							editor te permite configurar:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "📏",
									title: "Tamaño de celda",
									desc: "En píxeles. Ajústalo para que coincida con la escala del mapa (1 celda = 5 pies).",
								},
								{
									icon: "🎨",
									title: "Color de línea",
									desc: "Selector RGBA completo con control de opacidad. Elige el contraste ideal con tu mapa.",
								},
								{
									icon: "👁️",
									title: "Previsualización en tiempo real",
									desc: "Cada cambio se aplica al instante en el canvas.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Navegar el Mapa",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Para mapas grandes, el editor incluye herramientas de navegación:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">🖱️</span>
								<div>
									<strong>Arrastrar</strong>: haz clic sostenido y arrastra para
									desplazarte por el mapa (pan).
								</div>
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🖱️</span>
								<div>
									<strong>Rueda del ratón</strong>: zoom in/out (rango 0.1× –
									5×).
								</div>
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🔍</span>
								<div>
									<strong>Botones +/−</strong>: en la barra inferior del editor.
								</div>
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🔄</span>
								<div>
									<strong>Reset View</strong>: vuelve a la vista inicial
									centrada.
								</div>
							</li>
						</ul>
					</>
				),
			},
			{
				title: "Guardar y Gestionar Mapas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Los mapas guardados aparecen en{" "}
							<strong className="text-amber-300">Mi Panel → Mis Mapas</strong>.
							Desde allí puedes abrirlos, editarlos o eliminarlos. Cada mapa
							guardado tiene nombre, tamaño de cuadrícula y fecha de creación.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							Al crear escenas en el editor de campaña, puedes{" "}
							<strong className="text-amber-300">vincular un mapa guardado</strong>{" "}
							a cada escena. Así, durante la partida, el DM puede cargar el mapa
							del encuentro directamente desde el panel de escenas.
						</p>
						<Warning>
							Guardar mapas requiere una cuenta activa. Los mapas no guardados
							se pierden al cerrar el navegador.
						</Warning>
					</>
				),
			},
		],
	},

	// ── 9. CAMPAÑAS ──────────────────────────────────────────────────────────
	{
		slug: "gestion-de-campanas",
		title: "Gestión de Campañas",
		tagline: "Lidera la aventura",
		Icon: Crown,
		cardDescription:
			"Crea campañas, invita jugadores, organiza capítulos y escenas, asigna entidades de monstruos e ítems. Todo lo que el Dungeon Master necesita para preparar la historia.",
		category: "Campaña",
		categoryColor: "text-purple-400",
		accentClass: "from-purple-900/60 to-indigo-900/40 border-purple-700/40",
		sections: [
			{
				title: "El Señor del Calabozo",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Las campañas son el corazón de Beyond the Dungeon. Como Dungeon
							Master, tienes a tu disposición un sistema completo para organizar
							la narrativa de tu aventura: capítulos, escenas, encuentros, mapas
							vinculados y gestión de jugadores. Todo desde un solo panel.
						</p>
						<Note>
							Para usar campañas necesitas una cuenta activa. Las campañas son
							privadas por defecto: solo tú (el DM) y los jugadores invitados
							tienen acceso.
						</Note>
					</>
				),
			},
			{
				title: "Crear una Campaña",
				content: (
					<>
						<StepList
							steps={[
								{
									num: 1,
									title: 'Ve a "Mi Panel → Mis Campañas"',
									desc: 'O directamente a /profile/campanas.',
								},
								{
									num: 2,
									title: '"Nueva Campaña"',
									desc: "El botón de la esquina abre un diálogo de creación.",
								},
								{
									num: 3,
									title: "Introduce título, descripción y notas",
									desc: "El título es público para tus jugadores. Las notas son solo para ti (DM).",
								},
								{
									num: 4,
									title: "¡La campaña se crea y el editor se abre automáticamente!",
									desc: "Ya puedes comenzar a estructurar tu aventura.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Invitar Jugadores",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Desde el editor de campaña, en la pestaña{" "}
							<strong className="text-amber-300">Miembros</strong>, puedes invitar
							jugadores mediante su{" "}
							<strong className="text-amber-300">nombre de usuario</strong>. Al
							enviar la invitación:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">📧</span>
								El jugador recibe un correo electrónico con la invitación.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🔔</span>
								En la parte superior de la pantalla del jugador aparece un banner
								de invitaciones pendientes.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✅</span>
								El jugador puede aceptar o rechazar la invitación desde el
								banner o desde "Mis Campañas → Invitaciones".
							</li>
						</ul>
						<Tip>
							El jugador debe tener una cuenta en Beyond the Dungeon para recibir
							invitaciones. Asegúrate de que tu grupo esté registrado antes de
							empezar.
						</Tip>
					</>
				),
			},
			{
				title: "Capítulos y Escenas",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La campaña se estructura en{" "}
							<strong className="text-amber-300">Capítulos</strong>, cada uno con
							sus <strong className="text-amber-300">Escenas</strong>. Es la
							forma de organizar la narrativa: un capítulo puede ser «El Bosque
							Sombrío» y sus escenas, «Emboscada en el camino», «La Cabaña
							Abandonada» y «La Guarida del Brujo».
						</p>
						<FeatureGrid
							items={[
								{
									icon: "📚",
									title: "Capítulos",
									desc: "Ordenados con drag-and-drop. Cada uno con título y descripción.",
								},
								{
									icon: "🎬",
									title: "Escenas",
									desc: "Dentro de cada capítulo. Con texto de narración, notas del DM y mapa vinculado.",
								},
								{
									icon: "✒️",
									title: "Editor de Texto Enriquecido",
									desc: "Las descripciones de escena usan un editor WYSIWYG con formato.",
								},
								{
									icon: "🗺️",
									title: "Mapa de Escena",
									desc: "Vincula un mapa de batalla guardado a la escena para cargarlo durante la partida.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "Entidades de Escena",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Cada escena puede tener{" "}
							<strong className="text-amber-300">Entidades</strong> asociadas:
							monstruos, objetos, hechizos o NPCs extraídos directamente del
							Compendio. Son los actores del encuentro.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							Al añadir una entidad, puedes darle un{" "}
							<strong className="text-amber-300">alias</strong> («El Goblin
							Jefe») y notas de DM («Este goblin sabe dónde está el tesoro»).
							Durante la partida, las entidades de la escena activa aparecen en
							el panel del DM listas para ser desplegadas como tokens en el mapa.
						</p>
					</>
				),
			},
			{
				title: "El Rol del Jugador",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Como jugador, en{" "}
							<strong className="text-amber-300">Mis Campañas</strong> ves las
							campañas en las que participas. Puedes:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Asignar tu personaje</strong>: elige qué ficha de
								personaje usas en esta campaña.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Ver el estado de la sesión</strong>: si el DM ha
								iniciado o pausado la sesión.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">✦</span>
								<strong>Entrar a la partida</strong>: cuando la sesión está
								activa, el botón «Entrar a la Partida» está disponible.
							</li>
						</ul>
					</>
				),
			},
		],
	},

	// ── 10. LA PARTIDA (VTT) ─────────────────────────────────────────────────
	{
		slug: "la-partida",
		title: "La Partida en Vivo",
		tagline: "La mesa virtual",
		Icon: Swords,
		cardDescription:
			"El tablero de juego virtual completo: tokens en el mapa, combate con orden de iniciativa, fichas de personaje en tiempo real y dados integrados. Todo en una sola pantalla.",
		category: "Campaña",
		categoryColor: "text-rose-400",
		accentClass: "from-rose-900/60 to-red-900/40 border-rose-700/40",
		sections: [
			{
				title: "La Mesa Virtual (VTT)",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La Partida es el modo de juego en vivo de Beyond the Dungeon: una
							pantalla completa donde el DM dirige el combate, gestiona el mapa
							táctico con tokens y los jugadores ven sus fichas, lanzan dados y
							participan en los encuentros. Todo sincronizado en tiempo real entre
							todos los participantes.
						</p>
						<p className="mt-3 text-stone-300 leading-relaxed">
							La pantalla se divide en cuatro zonas principales: panel de
							jugadores (izquierda), mapa central, panel del DM (derecha) y barra
							de combate (parte superior cuando el combate está activo).
						</p>
					</>
				),
			},
			{
				title: "Iniciar la Sesión (DM)",
				content: (
					<>
						<StepList
							steps={[
								{
									num: 1,
									title: 'Ve a "Mis Campañas" o al editor de campaña',
									desc: "El botón de iniciar sesión está disponible en ambos lugares.",
								},
								{
									num: 2,
									title: '"Iniciar Sesión" o "Reanudar Sesión"',
									desc: "Si la sesión estaba pausada, se reanuda en el estado en que la dejaste.",
								},
								{
									num: 3,
									title: "La partida se abre en pantalla completa",
									desc: "El DM tiene acceso al panel de DM, mapa y controles de combate.",
								},
								{
									num: 4,
									title: "Los jugadores reciben una notificación por correo",
									desc: "Cuando inicias la sesión, todos los jugadores de la campaña reciben un email.",
								},
							]}
						/>
						<Tip>
							Antes de iniciar la sesión, prepara tus escenas en el editor de
							campaña: vincula los mapas, añade las entidades y escribe las
							descripciones. La preparación es el 80% del buen juego de rol.
						</Tip>
					</>
				),
			},
			{
				title: "Unirse a la Sesión (Jugador)",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Cuando el DM inicia la sesión, el estado en{" "}
							<strong className="text-amber-300">Mis Campañas</strong> cambia a
							«Sesión activa» y el botón{" "}
							<strong className="text-amber-300">«Entrar a la Partida»</strong>{" "}
							se activa. Al hacer clic, entras a la sala de juego en tiempo real.
						</p>
						<Note>
							Asegúrate de haber asignado tu personaje a la campaña antes de
							entrar. Si no tienes personaje asignado, podrás ver el juego pero
							no participar completamente.
						</Note>
					</>
				),
			},
			{
				title: "El Mapa y los Tokens",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El mapa central es el campo de batalla. El DM puede cargar el mapa
							vinculado a la escena activa y desplegar{" "}
							<strong className="text-amber-300">tokens</strong> (fichas
							virtuales) representando jugadores, enemigos y NPCs.
						</p>
						<FeatureGrid
							items={[
								{
									icon: "👤",
									title: "Tokens de Jugador",
									desc: "Cada jugador tiene su token con su color e inicial de nombre.",
								},
								{
									icon: "💀",
									title: "Tokens de Enemigo",
									desc: "Desplegados desde las entidades de la escena activa.",
								},
								{
									icon: "❤️",
									title: "Barra de HP",
									desc: "Visible sobre cada token. El DM actualiza los PG en tiempo real.",
								},
								{
									icon: "🖱️",
									title: "Arrastrar",
									desc: "El DM puede mover cualquier token. Los jugadores solo mueven el suyo.",
								},
							]}
						/>
					</>
				),
			},
			{
				title: "El Panel del DM",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							El panel derecho (solo visible para el DM) es el centro de control:
						</p>
						<ul className="mt-3 space-y-2 text-stone-300 text-sm">
							<li className="flex gap-2">
								<span className="text-amber-400">📚</span>
								<strong>Navegador de Escenas</strong>: cambia entre capítulos y
								escenas activas. La descripción de la escena se muestra en la
								pantalla del DM.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">👾</span>
								<strong>Entidades de la Escena</strong>: lista de monstruos,
								NPCs e ítems preparados. Haz clic en «Desplegar» para añadirlos
								al mapa como tokens.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🗺️</span>
								<strong>Gestión del Mapa</strong>: carga el mapa vinculado a la
								escena o sube uno nuevo.
							</li>
							<li className="flex gap-2">
								<span className="text-amber-400">🎨</span>
								<strong>Editor de Token</strong>: cambia color y tamaño de
								cualquier token.
							</li>
						</ul>
					</>
				),
			},
			{
				title: "El Combate",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							Cuando llega el momento de cruzar el acero, el DM puede iniciar el
							modo de combate con el botón{" "}
							<strong className="text-amber-300">«Iniciar Combate»</strong>.
						</p>
						<StepList
							steps={[
								{
									num: 1,
									title: "Selecciona los participantes",
									desc: "Elige qué tokens entran en el combate (jugadores y enemigos).",
								},
								{
									num: 2,
									title: "¿Ronda de sorpresa?",
									desc: "Opción para marcar si algún bando sorprende al otro.",
								},
								{
									num: 3,
									title: "Asigna la iniciativa",
									desc: "Cada participante tiene su valor de iniciativa. Reordena arrastrando.",
								},
								{
									num: 4,
									title: "¡Que rueden los dados!",
									desc: "La barra superior muestra el orden de turno. Haz clic en «Siguiente Turno» para avanzar.",
								},
							]}
						/>
						<Tip>
							La barra de combate muestra los PG de cada combatiente en tiempo
							real. El DM puede actualizar los PG haciendo clic en el HP de
							cualquier token en el mapa.
						</Tip>
					</>
				),
			},
			{
				title: "Fichas, Dados y Compendio en Partida",
				content: (
					<>
						<p className="text-stone-300 leading-relaxed">
							La barra inferior de la pantalla de partida incluye accesos rápidos
							para no interrumpir el flujo del juego:
						</p>
						<FeatureGrid
							items={[
								{
									icon: "🎲",
									title: "Dados",
									desc: "Overlay de tirada de dados superpuesto sobre el mapa, sin salir de la partida.",
								},
								{
									icon: "📜",
									title: "Hechizos",
									desc: "Abre el Compendio de Hechizos en una nueva pestaña.",
								},
								{
									icon: "💀",
									title: "Bestiario",
									desc: "Abre el Bestiario en una nueva pestaña para consultar criaturas.",
								},
								{
									icon: "📦",
									title: "Objetos",
									desc: "Abre el Compendio de Objetos en una nueva pestaña.",
								},
							]}
						/>
						<p className="mt-3 text-stone-300 text-sm">
							El panel izquierdo muestra todos los jugadores de la sesión con sus
							personajes y HP. El DM puede abrir la ficha completa de cualquier
							personaje haciendo clic en él desde el panel de jugadores.
						</p>
					</>
				),
			},
		],
	},
];

export const getGuideBySlug = (slug: string): Guide | undefined =>
	GUIDES.find((g) => g.slug === slug);
