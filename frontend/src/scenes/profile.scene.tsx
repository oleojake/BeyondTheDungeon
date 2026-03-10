import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import { listCampaigns, type Campaign } from "@/core/api/campaign.service";
import { supabase } from "@/lib/supabase";

export const ProfileScene: React.FC = () => {
	return (
		<ProfileLayout>
			<ProfileContent />
		</ProfileLayout>
	);
};

const ProfileContent: React.FC = () => {
	const navigate = useNavigate();
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string>("");

	useEffect(() => {
		loadCampaigns();
	}, []);

	const loadCampaigns = async () => {
		setLoading(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}

			const campaignsData = await listCampaigns();
			setCampaigns(campaignsData);
		} catch (error) {
			console.error("Error al cargar campañas:", error);
			setCampaigns([]);
		} finally {
			setLoading(false);
		}
	};

	const isDM = (campaign: Campaign) => campaign.dm_id === userId;

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
				<Button 
					onClick={() => navigate("/mis-campanas")}
					className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition"
				>
					<Plus className="h-5 w-5" />
					Crear Campaña
				</Button>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="bg-dark-card border-dark-border">
							<CardHeader>
								<Skeleton className="h-32 w-full mb-4" />
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-10 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Results count */}
			{!loading && campaigns.length > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-400">
						{campaigns.length}{" "}
						{campaigns.length === 1 ? "campaña activa" : "campañas activas"}
					</p>
				</div>
			)}

			{/* Campaigns Grid */}
			{!loading && campaigns.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{campaigns.map((campaign) => (
						<Card
							key={campaign.id}
							onClick={() => navigate(`/editar-campana/${campaign.id}`)}
							className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-pointer group h-full"
						>
							<CardHeader>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<CardTitle className="text-amber-100 group-hover:text-amber-300 transition-colors truncate">
											{campaign.title}
										</CardTitle>
										{campaign.description && (
											<CardDescription className="text-gray-400 text-sm mt-1 line-clamp-2">
												{campaign.description}
											</CardDescription>
										)}
									</div>
									<Badge
										variant="outline"
										className="bg-amber-950/50 border-amber-600/50 text-amber-300 shrink-0"
									>
										{isDM(campaign) ? "DM" : "Jugador"}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="pt-2">
									<Button
										className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition group-hover:shadow-lg"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											navigate(`/editar-campana/${campaign.id}`);
										}}
									>
										<span>{isDM(campaign) ? "Editar Campaña" : "Ver Campaña"}</span>
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Empty State */}
			{!loading && campaigns.length === 0 && (
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
							<Button 
								onClick={() => navigate("/mis-campanas")}
								className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
							>
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
