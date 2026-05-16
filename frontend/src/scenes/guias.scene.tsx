import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, MessageSquare } from "lucide-react";
import { GUIDES } from "@/pods/guias/guias-data";
import { switchRoutes } from "@/router/routes";

export const GuiasScene = () => {
	return (
		<div className="min-h-screen bg-dark pb-16">
			{/* ── Hero Banner ─────────────────────────────────────────── */}
			<div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-dark to-stone-900 border-b border-dark-border">
				{/* Decorative glow */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-600/10 blur-3xl rounded-full" />
				</div>

				<div className="relative container mx-auto max-w-5xl px-6 py-14 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-600/30 mb-5">
						<BookOpen className="w-8 h-8 text-amber-400" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-amber-100 mb-4 tracking-tight">
						Guías del Aventurero
					</h1>
					<p className="text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed">
						Bienvenido, osado viajero. Aquí encontrarás todo el conocimiento que
						necesitas para dominar las artes de Beyond the Dungeon. Desde las runas
						más básicas hasta los secretos del Dungeon Master.
					</p>
					<p className="mt-3 text-sm text-stone-500 italic">
						"El aventurero preparado sobrevive. El aventurero informado, triunfa."
					</p>
				</div>
			</div>

			{/* ── Guide Cards Grid ────────────────────────────────────── */}
			<div className="container mx-auto max-w-5xl px-6 mt-12">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{GUIDES.map((guide) => {
						const Icon = guide.Icon;
						return (
							<Link
								key={guide.slug}
								to={`/guias/${guide.slug}`}
								className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-900/30 ${guide.accentClass}`}
							>
								{/* Category badge */}
								<span
									className={`mb-4 self-start text-xs font-semibold uppercase tracking-wider ${guide.categoryColor}`}
								>
									{guide.category}
								</span>

								{/* Icon */}
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-dark/40 border border-dark-border/60">
									<Icon className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
								</div>

								{/* Content */}
								<h2 className="text-lg font-bold text-amber-100 mb-1 group-hover:text-amber-50 transition-colors">
									{guide.title}
								</h2>
								<p className="text-xs text-stone-500 italic mb-3">{guide.tagline}</p>
								<p className="text-sm text-stone-400 leading-relaxed flex-1">
									{guide.cardDescription}
								</p>

								{/* CTA */}
								<div className="mt-5 flex items-center gap-1.5 text-amber-500 text-sm font-medium group-hover:text-amber-400 transition-colors">
									Leer guía
									<ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
								</div>
							</Link>
						);
					})}
				</div>

				{/* ── Bottom note ─────────────────────────────────────── */}
				<div className="mt-12 text-center">
					<p className="text-stone-600 text-sm">
						¿Echas en falta alguna guía?{" "}
						<span className="text-stone-500">
							Las guías se actualizan conforme la aplicación crece. Vuelve
							pronto, aventurero.
						</span>
					</p>
				</div>

				{/* ── Foro CTA ─────────────────────────────────────── */}
				<div className="mt-10 rounded-2xl border border-amber-800/30 bg-amber-900/10 p-8 flex flex-col sm:flex-row items-center gap-6">
					<div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-600/30 shrink-0">
						<MessageSquare className="w-7 h-7 text-amber-400" />
					</div>
					<div className="text-center sm:text-left flex-1">
						<h3 className="text-lg font-bold text-amber-100 mb-1">
							¿Tienes dudas o quieres compartir tu experiencia?
						</h3>
						<p className="text-stone-400 text-sm">
							Visita el foro de la comunidad: pregunta, debate y conecta con otros aventureros.
						</p>
					</div>
					<Link
						to={switchRoutes.foro}
						className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors text-sm"
					>
						Ir al foro
						<ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default GuiasScene;
