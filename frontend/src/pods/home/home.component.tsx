export const HomeComponent = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
			{/* Header */}
			<header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
				<nav className="container mx-auto px-6 py-4">
					<h1 className="text-2xl font-bold text-white">Beyond The Dungeon</h1>
				</nav>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-6 py-16">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					{/* Hero Section */}
					<div className="space-y-4">
						<h2 className="text-5xl md:text-6xl font-bold text-white">
							🎲 Bienvenido al Dungeon
						</h2>
						<p className="text-xl text-gray-300">
							Herramientas épicas para tus partidas de rol
						</p>
					</div>

					{/* Tech Stack Badge */}
					<div className="flex flex-wrap justify-center gap-3">
						<span className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 font-mono text-sm">
							React
						</span>
						<span className="px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg text-purple-300 font-mono text-sm">
							TypeScript
						</span>
						<span className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg text-cyan-300 font-mono text-sm">
							Vite
						</span>
						<span className="px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-300 font-mono text-sm">
							Tailwind CSS
						</span>
					</div>

					{/* Card Demo */}
					<div className="grid md:grid-cols-3 gap-6 mt-12">
						<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all hover:scale-105">
							<div className="text-4xl mb-3">🎲</div>
							<h3 className="text-xl font-semibold text-white mb-2">Dados</h3>
							<p className="text-gray-300 text-sm">Sistema de tiradas épico</p>
						</div>

						<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all hover:scale-105">
							<div className="text-4xl mb-3">🧙</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Personajes
							</h3>
							<p className="text-gray-300 text-sm">Gestiona tus fichas</p>
						</div>

						<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all hover:scale-105">
							<div className="text-4xl mb-3">📖</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Campañas
							</h3>
							<p className="text-gray-300 text-sm">Organiza tus aventuras</p>
						</div>
					</div>

					{/* CTA Button */}
					<div className="pt-8">
						<button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-purple-500/50 transition-all hover:scale-105">
							🚀 Comenzar Aventura
						</button>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="absolute bottom-0 w-full py-6 text-center text-gray-400 text-sm">
				<p>Scaffolding inicial - React + Vite + Tailwind ✨</p>
			</footer>
		</div>
	);
};
