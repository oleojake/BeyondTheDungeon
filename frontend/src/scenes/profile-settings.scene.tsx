import React, { useEffect, useRef, useState } from "react";
import { Settings, User, Lock, Mail, ImageIcon, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import { ProfileTabs } from "@/components/profile-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/core/auth/useAuth";
import {
getProfile,
updateAvatar,
uploadAvatarFile,
updateUsername,
updateEmail,
updatePassword,
} from "@/core/api/profile.service";
import { PRESET_AVATARS } from "@/constants/avatars";
import { useTranslation } from "@/i18n";

// ── Toast ────────────────────────────────────────────────────────────────────
type ToastItem = { id: number; msg: string; ok: boolean };

const ToastList: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => (
<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
{toasts.map((t) => (
<div
key={t.id}
className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border animate-in slide-in-from-right-4 fade-in duration-200 ${
t.ok
? "bg-green-950 border-green-700/50 text-green-200"
: "bg-red-950 border-red-700/50 text-red-200"
}`}
>
{t.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
{t.msg}
</div>
))}
</div>
);

// ── SettingsCard ─────────────────────────────────────────────────────────────
const SettingsCard: React.FC<{
icon: React.ElementType;
title: string;
description: string;
children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
<div className="rounded-2xl border border-dark-border bg-dark-card p-6">
<div className="flex items-start gap-3 mb-5">
<div className="p-2 rounded-lg bg-amber-950/50 shrink-0">
<Icon className="h-5 w-5 text-amber-400" />
</div>
<div>
<h2 className="text-amber-100 font-semibold text-base">{title}</h2>
<p className="text-stone-400 text-sm mt-0.5">{description}</p>
</div>
</div>
{children}
</div>
);

// ── Scene ────────────────────────────────────────────────────────────────────
export const ProfileSettingsScene: React.FC = () => {
const { user } = useAuth();
const { t } = useTranslation();
const ps = t.profileSettings;

// avatar
const [avatarUrl, setAvatarUrl] = useState("");
const [selectedAvatar, setSelectedAvatar] = useState("");
const [avatarSaving, setAvatarSaving] = useState(false);
const [uploading, setUploading] = useState(false);
const fileRef = useRef<HTMLInputElement>(null);

// nickname
const [username, setUsername] = useState("");
const [nickSaving, setNickSaving] = useState(false);
const [nickError, setNickError] = useState<string | null>(null);

// email
const [newEmail, setNewEmail] = useState("");
const [emailSaving, setEmailSaving] = useState(false);
const [emailSuccess, setEmailSuccess] = useState(false);
const [emailError, setEmailError] = useState<string | null>(null);

// password
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passSaving, setPassSaving] = useState(false);
const [passError, setPassError] = useState<string | null>(null);

// toasts
const [toasts, setToasts] = useState<ToastItem[]>([]);
const toastCounter = useRef(0);
const showToast = (msg: string, ok = true) => {
const id = ++toastCounter.current;
setToasts((prev) => [...prev, { id, msg, ok }]);
setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500);
};

useEffect(() => {
if (!user) return;
getProfile(user.id)
.then((p) => {
setUsername(p.username ?? "");
setAvatarUrl(p.avatar_url ?? "");
setSelectedAvatar(p.avatar_url ?? "");
})
.catch(() => {});
}, [user?.id]);

// ── Handlers ────────────────────────────────────────────────────────────

const handleSaveAvatar = async () => {
if (!user || !selectedAvatar) return;
setAvatarSaving(true);
try {
await updateAvatar(user.id, selectedAvatar);
setAvatarUrl(selectedAvatar);
showToast(ps.avatar.saved);
} catch (e) {
showToast(e instanceof Error ? e.message : ps.saveError, false);
} finally {
setAvatarSaving(false);
}
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (!file || !user) return;
if (!file.type.startsWith("image/")) {
showToast(ps.avatar.invalidType, false);
return;
}
if (file.size > 2 * 1024 * 1024) {
showToast(ps.avatar.tooLarge, false);
return;
}
setUploading(true);
try {
const url = await uploadAvatarFile(user.id, file);
await updateAvatar(user.id, url);
setAvatarUrl(url);
setSelectedAvatar(url);
showToast(ps.avatar.saved);
} catch (e) {
showToast(e instanceof Error ? e.message : ps.saveError, false);
} finally {
setUploading(false);
if (fileRef.current) fileRef.current.value = "";
}
};

const handleSaveNick = async () => {
setNickError(null);
if (!username.trim()) {
setNickError(ps.nickname.empty);
return;
}
if (!user) return;
setNickSaving(true);
try {
await updateUsername(user.id, username.trim());
showToast(ps.nickname.saved);
} catch (e) {
setNickError(e instanceof Error ? e.message : ps.saveError);
} finally {
setNickSaving(false);
}
};

const handleSaveEmail = async () => {
setEmailError(null);
const trimmed = newEmail.trim();
if (!trimmed) return;
if (trimmed === user?.email) {
setEmailError(ps.email.sameEmail);
return;
}
setEmailSaving(true);
try {
await updateEmail(trimmed);
setEmailSuccess(true);
setNewEmail("");
} catch (e) {
setEmailError(e instanceof Error ? e.message : ps.saveError);
} finally {
setEmailSaving(false);
}
};

const handleSavePassword = async () => {
setPassError(null);
if (newPassword.length < 6) {
setPassError(ps.password.minLength);
return;
}
if (newPassword !== confirmPassword) {
setPassError(ps.password.mismatch);
return;
}
setPassSaving(true);
try {
await updatePassword(newPassword);
setNewPassword("");
setConfirmPassword("");
showToast(ps.password.saved);
} catch (e) {
setPassError(e instanceof Error ? e.message : ps.saveError);
} finally {
setPassSaving(false);
}
};

return (
<>
<ToastList toasts={toasts} />
<div className="container mx-auto p-6 max-w-3xl space-y-6">
<ProfileTabs />

{/* Header */}
<section className="rounded-2xl bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 p-6 shadow-xl border border-amber-600/20">
<div className="flex items-center gap-3 mb-2">
<Settings className="h-8 w-8 text-amber-200" />
<h1 className="text-3xl font-bold text-amber-50">{ps.title}</h1>
</div>
<p className="text-sm text-amber-100/90">{ps.subtitle}</p>
</section>

{/* Avatar */}
<SettingsCard icon={ImageIcon} title={ps.avatar.title} description={ps.avatar.description}>
{avatarUrl && (
<div className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-dark-border bg-dark/60">
<img src={avatarUrl} alt="avatar actual" className="size-14 rounded-full bg-stone-800 border border-amber-600/30" />
<span className="text-sm text-stone-400">Avatar actual</span>
</div>
)}
<p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Predefinidos</p>
<div className="grid grid-cols-5 gap-3 mb-5">
{PRESET_AVATARS.map((av) => (
<button
key={av.id}
onClick={() => setSelectedAvatar(av.url)}
className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
selectedAvatar === av.url
? "border-amber-400 ring-2 ring-amber-400/40"
: "border-dark-border hover:border-amber-600/50"
}`}
title={av.name}
>
<img src={av.url} alt={av.name} className="w-full h-full object-cover bg-stone-800" />
{selectedAvatar === av.url && (
<div className="absolute inset-0 bg-amber-400/10 flex items-end justify-end p-1">
<CheckCircle2 className="size-4 text-amber-300 drop-shadow" />
</div>
)}
</button>
))}
</div>
<p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">O sube tu imagen</p>
<div className="flex items-center gap-3 mb-5">
<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
<Button
variant="outline"
onClick={() => fileRef.current?.click()}
disabled={uploading}
className="gap-2 border-dark-border text-stone-300 hover:border-amber-600/50"
>
{uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
{uploading ? ps.avatar.uploading : ps.avatar.upload}
</Button>
<span className="text-xs text-stone-500">JPG, PNG, GIF, WebP · max 2 MB</span>
</div>
<Button
onClick={handleSaveAvatar}
disabled={avatarSaving || selectedAvatar === avatarUrl || !selectedAvatar}
className="bg-amber-600 hover:bg-amber-500 text-white"
>
{avatarSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
{ps.avatar.save}
</Button>
</SettingsCard>

{/* Nickname */}
<SettingsCard icon={User} title={ps.nickname.title} description={ps.nickname.description}>
<div className="flex gap-3">
<div className="flex-1 space-y-1">
<Label htmlFor="settings-username">{ps.nickname.label}</Label>
<Input
id="settings-username"
value={username}
onChange={(e) => { setUsername(e.target.value); setNickError(null); }}
placeholder={ps.nickname.placeholder}
maxLength={30}
onKeyDown={(e) => e.key === "Enter" && handleSaveNick()}
/>
{nickError && <p className="text-xs text-destructive mt-1">{nickError}</p>}
</div>
<div className="flex items-end">
<Button
onClick={handleSaveNick}
disabled={nickSaving}
className="bg-amber-600 hover:bg-amber-500 text-white min-w-[80px]"
>
{nickSaving ? <Loader2 className="size-4 animate-spin" /> : ps.nickname.save}
</Button>
</div>
</div>
</SettingsCard>

{/* Email */}
<SettingsCard icon={Mail} title={ps.email.title} description={ps.email.description}>
{emailSuccess ? (
<div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-700/40">
<CheckCircle2 className="size-5 text-amber-400 shrink-0 mt-0.5" />
<p className="text-sm text-amber-200">{ps.email.saved}</p>
</div>
) : (
<div className="space-y-3">
<div className="text-xs text-stone-500 bg-dark/60 border border-dark-border rounded-lg px-3 py-2">
Email actual: <span className="text-stone-300">{user?.email}</span>
</div>
<div className="flex gap-3">
<div className="flex-1 space-y-1">
<Label htmlFor="settings-email">{ps.email.label}</Label>
<Input
id="settings-email"
type="email"
value={newEmail}
onChange={(e) => { setNewEmail(e.target.value); setEmailError(null); }}
placeholder={ps.email.placeholder}
/>
{emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
</div>
<div className="flex items-end">
<Button
onClick={handleSaveEmail}
disabled={emailSaving || !newEmail.trim()}
className="bg-amber-600 hover:bg-amber-500 text-white"
>
{emailSaving ? <Loader2 className="size-4 animate-spin" /> : ps.email.save}
</Button>
</div>
</div>
</div>
)}
</SettingsCard>

{/* Password */}
<SettingsCard icon={Lock} title={ps.password.title} description={ps.password.description}>
<div className="space-y-3">
<div className="space-y-1">
<Label htmlFor="settings-new-pass">{ps.password.label}</Label>
<Input
id="settings-new-pass"
type="password"
value={newPassword}
onChange={(e) => { setNewPassword(e.target.value); setPassError(null); }}
autoComplete="new-password"
/>
</div>
<div className="space-y-1">
<Label htmlFor="settings-confirm-pass">{ps.password.confirmLabel}</Label>
<Input
id="settings-confirm-pass"
type="password"
value={confirmPassword}
onChange={(e) => { setConfirmPassword(e.target.value); setPassError(null); }}
autoComplete="new-password"
onKeyDown={(e) => e.key === "Enter" && handleSavePassword()}
/>
</div>
{newPassword.length > 0 && (
<div className="flex gap-1">
{[2, 4, 6, 8].map((threshold) => (
<div
key={threshold}
className={`h-1 flex-1 rounded-full transition-colors ${
newPassword.length >= threshold
? newPassword.length >= 8 ? "bg-green-500" : "bg-amber-500"
: "bg-stone-700"
}`}
/>
))}
</div>
)}
{passError && <p className="text-sm text-destructive">{passError}</p>}
<Button
onClick={handleSavePassword}
disabled={passSaving}
className="bg-amber-600 hover:bg-amber-500 text-white"
>
{passSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
{ps.password.save}
</Button>
</div>
</SettingsCard>
</div>
</>
);
};

export default ProfileSettingsScene;
