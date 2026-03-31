// ================================================
// Partida Scene
// ================================================
// Entry point for the online VTT game session.
// URL: /partida/:campaignId
// Accessible only after login.
// ================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getCampaign } from "@/core/api/campaign.service";
import { PartidaContainer } from "@/pods/partida";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PartidaScene() {
	const { t } = useTranslation();
	const { id: campaignId } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [userId, setUserId] = useState("");
	const [isDM, setIsDM] = useState(false);
	const [campaignTitle, setCampaignTitle] = useState(t("session.title"));
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!campaignId) {
			navigate("/mis-campanas");
			return;
		}

		const init = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					navigate("/login");
					return;
				}
				setUserId(user.id);

				const campaign = await getCampaign(campaignId);
				if (!campaign) {
					setError(t("campaigns.errors.notFound"));
					return;
				}
				setCampaignTitle(campaign.title);
				setIsDM(campaign.dm_id === user.id);
			} catch (err) {
				console.error("[PartidaScene] init error", err);
				setError(t("campaigns.errors.loadFailed"));
			} finally {
				setLoading(false);
			}
		};

		init();
	}, [campaignId, navigate]);

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[#080408]">
				<Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
			</div>
		);
	}

	if (error || !campaignId) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-[#080408]">
				<div className="text-center">
					<p className="text-red-400 mb-4">{error ?? t("campaigns.errors.notFound")}</p>
					<button
						onClick={() => navigate("/mis-campanas")}
						className="text-amber-400 underline"
					>
						{t("campaigns.actions.backToList")}
					</button>
				</div>
			</div>
		);
	}

	return (
		<PartidaContainer
			campaignId={campaignId}
			campaignTitle={campaignTitle}
			isDM={isDM}
		/>
	);
}
