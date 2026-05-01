import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getGuideBySlug, GUIDES } from "@/pods/guias/guias-data";

export const GuiaDetalleScene = () => {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const guide = slug ? getGuideBySlug(slug) : undefined;

	if (!guide) {
		return (
			<div className="min-h-screen bg-dark flex items-center justify-center">
				<div className="text-center">
					<p className="text-5xl mb-4">🗺️</p>
					<h2 className="text-2xl font-bold text-amber-100 mb-2">
						Guía no encontrada
					</h2>
					<p className="text-stone-400 mb-6">
						Este pergamino no existe en el grimorio.
					</p>
					<Link
						to="/guias"
						className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Volver a las Guías
					</Link>
				</div>
			</div>
		);
	}

	const Icon = guide.Icon;

	// Sibling navigation
	const currentIdx = GUIDES.findIndex((g) => g.slug === slug);
	const prevGuide = currentIdx > 0 ? GUIDES[currentIdx - 1] : null;
	const nextGuide = currentIdx < GUIDES.length - 1 ? GUIDES[currentIdx + 1] : null;

	return (
		<div className="min-h-screen bg-dark pb-16">
			{/* ── Hero ─────────────────────────────────────────────── */}
			<div
				className={`relative overflow-hidden bg-gradient-to-br border-b border-dark-border ${guide.accentClass}`}
			>
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[160px] bg-amber-600/10 blur-3xl rounded-full" />
				</div>

				<div className="relative container mx-auto max-w-3xl px-6 py-10">
					{/* Back button */}
					<button
						onClick={() => navigate("/guias")}
						className="mb-6 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-300 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Todas las guías
					</button>

					<div className="flex items-start gap-5">
						{/* Icon */}
						<div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-xl bg-dark/50 border border-dark-border/60">
							<Icon className="w-7 h-7 text-amber-400" />
						</div>

						{/* Titles */}
						<div>
							<span className={`text-xs font-semibold uppercase tracking-wider ${guide.categoryColor}`}>
								{guide.category}
							</span>
							<h1 className="mt-1 text-3xl font-bold text-amber-100 leading-tight">
								{guide.title}
							</h1>
							<p className="mt-1 text-stone-400 italic text-sm">{guide.tagline}</p>
						</div>
					</div>
				</div>
			</div>

			{/* ── Content ──────────────────────────────────────────── */}
			<div className="container mx-auto max-w-3xl px-6 mt-10">
				{/* Table of contents */}
				<nav className="mb-10 rounded-xl border border-dark-border bg-dark-card/50 p-5">
					<div className="flex items-center gap-2 mb-3">
						<BookOpen className="w-4 h-4 text-amber-500" />
						<span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
							En esta guía
						</span>
					</div>
					<ol className="space-y-1.5">
						{guide.sections.map((section, i) => (
							<li key={i}>
								<a
									href={`#section-${i}`}
									className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-300 transition-colors group"
								>
									<span className="text-amber-700 font-mono text-xs w-5 shrink-0">
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="group-hover:underline underline-offset-2">
										{section.title}
									</span>
								</a>
							</li>
						))}
					</ol>
				</nav>

				{/* Sections */}
				<div className="space-y-10">
					{guide.sections.map((section, i) => (
						<section key={i} id={`section-${i}`} className="scroll-mt-24">
							<div className="flex items-center gap-3 mb-5">
								<span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/20 border border-amber-600/30 text-amber-400 text-xs font-bold shrink-0">
									{i + 1}
								</span>
								<h2 className="text-xl font-bold text-amber-100">{section.title}</h2>
							</div>
							<div className="pl-10">{section.content}</div>
						</section>
					))}
				</div>

				{/* ── Sibling navigation ───────────────────────────── */}
				<div className="mt-14 grid grid-cols-2 gap-4 border-t border-dark-border pt-8">
					{prevGuide ? (
						<Link
							to={`/guias/${prevGuide.slug}`}
							className="group flex flex-col gap-1 rounded-xl border border-dark-border bg-dark-card/50 p-4 hover:border-amber-700/60 transition-all"
						>
							<span className="text-xs text-stone-500 flex items-center gap-1">
								<ArrowLeft className="w-3 h-3" />
								Guía anterior
							</span>
							<span className="text-sm font-semibold text-amber-200 group-hover:text-amber-100">
								{prevGuide.title}
							</span>
						</Link>
					) : (
						<div />
					)}

					{nextGuide ? (
						<Link
							to={`/guias/${nextGuide.slug}`}
							className="group flex flex-col gap-1 items-end rounded-xl border border-dark-border bg-dark-card/50 p-4 hover:border-amber-700/60 transition-all text-right"
						>
							<span className="text-xs text-stone-500 flex items-center gap-1">
								Guía siguiente
								<ArrowLeft className="w-3 h-3 rotate-180" />
							</span>
							<span className="text-sm font-semibold text-amber-200 group-hover:text-amber-100">
								{nextGuide.title}
							</span>
						</Link>
					) : (
						<div />
					)}
				</div>

				{/* Back to hub */}
				<div className="mt-6 text-center">
					<Link
						to="/guias"
						className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-300 transition-colors"
					>
						<BookOpen className="w-4 h-4" />
						Ver todas las guías
					</Link>
				</div>
			</div>
		</div>
	);
};

export default GuiaDetalleScene;
