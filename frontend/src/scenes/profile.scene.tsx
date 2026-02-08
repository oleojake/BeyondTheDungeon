import React from "react";
import { ProfileLayout } from "@/layout/profile.layout";
import { Users, Plus, ArrowRight } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const ProfileScene: React.FC = () => {
	return (
		<ProfileLayout>
			<ProfileContent />
		</ProfileLayout>
	);
};

const ProfileContent: React.FC = () => {
	const campaigns = [
		{
			id: 1,
			title: "The Sunless Citadel",
			role: "Dungeon Master",
			image:
				"https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=400&q=80",
			players: ["Ana", "Bob", "Carlos", "Diana"],
			sessions: 12,
			lastPlayed: "Hace 2 días",
		},
		{
			id: 2,
			title: "Curse of Strahd",
			role: "Jugador",
			image:
				"https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=400&q=80",
			players: ["Emma", "Frank", "Grace"],
			sessions: 8,
			lastPlayed: "Hace 5 días",
		},
		{
			id: 3,
			title: "Lost Mine of Phandelver",
			role: "Jugador",
			image:
				"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
			players: ["Henry", "Iris", "Jack", "Kate"],
			sessions: 15,
			lastPlayed: "Hace 1 semana",
		},
	];

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Users className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-extrabold text-amber-50">
						Mis Campañas
					</h1>
				</div>
				<p className="mt-2 text-sm text-amber-100/90">
					Gestiona tus aventuras, personajes y progreso en tus campañas activas.
				</p>
			</section>

			{/* Create Campaign Button */}
			<div className="flex justify-end">
				<Button className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition">
					<Plus className="h-5 w-5" />
					Crear Campaña
				</Button>
			</div>

			{/* Results count */}
			{campaigns.length > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-400">
						{campaigns.length}{" "}
						{campaigns.length === 1 ? "campaña activa" : "campañas activas"}
					</p>
				</div>
			)}

			{/* Campaigns Grid */}
			{campaigns.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{campaigns.map((campaign) => (
						<Card
							key={campaign.id}
							className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-pointer group h-full"
						>
							<CardHeader>
								{campaign.image && (
									<div className="w-full flex justify-center mb-2">
										<img
											src={campaign.image}
											alt={campaign.title}
											className="h-32 w-full object-cover rounded-md shadow-md"
											loading="lazy"
										/>
									</div>
								)}
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<CardTitle className="text-amber-100 group-hover:text-amber-300 transition-colors truncate">
											{campaign.title}
										</CardTitle>
										<CardDescription className="text-gray-400 text-xs mt-1">
											{campaign.role}
										</CardDescription>
									</div>
									<Badge
										variant="outline"
										className="bg-amber-950/50 border-amber-600/50 text-amber-300 shrink-0"
									>
										{campaign.sessions} sesiones
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-400">Jugadores:</span>
									<span className="text-gray-200">
										{campaign.players.length}
									</span>
								</div>

								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-400">Última sesión:</span>
									<span className="text-gray-200 font-semibold">
										{campaign.lastPlayed}
									</span>
								</div>

								<div className="pt-2">
									<Button
										className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition group-hover:shadow-lg"
										size="sm"
									>
										<span>Ver Campaña</span>
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Empty State */}
			{campaigns.length === 0 && (
				<Card className="bg-dark-card border-dark-border">
					<CardContent className="py-12">
						<div className="flex flex-col items-center gap-4 text-center">
							<Users className="h-16 w-16 text-gray-500" />
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">
									No tienes campañas activas
								</h3>
								<p className="text-sm text-gray-400">
									Crea tu primera campaña para comenzar tu aventura.
								</p>
							</div>
							<Button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">
								<Plus className="mr-2 h-4 w-4" />
								Crear Primera Campaña
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default ProfileScene;
