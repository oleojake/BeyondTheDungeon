import React from "react";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { ProfileTabs } from "@/components/profile-tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/i18n";

export const ProfileSettingsScene: React.FC = () => {
	return <SettingsContent />;
};

const SettingsContent: React.FC = () => {
	const { t } = useTranslation();
	const ps = t.profileSettings;

	const settingsSections = [
		{
			id: 1,
			title: ps.sections.profile.title,
			description: ps.sections.profile.description,
			icon: User,
			available: false,
		},
		{
			id: 2,
			title: ps.sections.notifications.title,
			description: ps.sections.notifications.description,
			icon: Bell,
			available: false,
		},
		{
			id: 3,
			title: ps.sections.privacy.title,
			description: ps.sections.privacy.description,
			icon: Shield,
			available: false,
		},
		{
			id: 4,
			title: ps.sections.appearance.title,
			description: ps.sections.appearance.description,
			icon: Palette,
			available: false,
		},
	];

	return (
		<div className="container mx-auto p-6 max-w-7xl space-y-6">
			<ProfileTabs />
			{/* Header */}
			<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
				<div className="flex items-center gap-3 mb-2">
					<Settings className="h-8 w-8 text-amber-200" />
					<h1 className="text-3xl font-bold text-amber-50">
						{ps.title}
					</h1>
				</div>
				<p className="text-sm text-amber-100/90">
					{ps.subtitle}
				</p>
			</section>

			{/* Development Notice */}
			<Alert className="bg-amber-950/50 border-amber-600/50">
				<AlertDescription className="text-amber-200">
					{ps.wip}
				</AlertDescription>
			</Alert>

			{/* Settings Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{settingsSections.map((section) => {
					const Icon = section.icon;
					return (
						<Card
							key={section.id}
							className="bg-dark-card border-dark-border hover:border-amber-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/10 cursor-not-allowed opacity-75"
						>
							<CardHeader>
								<div className="flex items-start gap-3">
									<div className="p-2 rounded-lg bg-amber-950/50">
										<Icon className="h-5 w-5 text-amber-400" />
									</div>
									<div className="flex-1">
										<CardTitle className="text-amber-100 text-lg">
											{section.title}
										</CardTitle>
										<CardDescription className="text-gray-400 text-sm mt-1">
											{section.description}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-gray-500 italic">
									{ps.comingSoon}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
};

export default ProfileSettingsScene;
