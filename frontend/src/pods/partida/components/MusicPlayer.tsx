// ================================================
// MusicPlayer – Local ambient music panel
// ================================================
// Each user controls their own audio independently.
// No sync or broadcast needed.
// ================================================

import { useRef, useEffect, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const MUSIC_TRACKS = [
	{ id: "the-power", label: "The Power", src: "/music/the-power.mp3" },
	{ id: "twisted-force", label: "Twisted Force", src: "/music/twisted-force.mp3" },
];

export function MusicPlayer() {
	const [open, setOpen] = useState(false);
	const [selectedTrackId, setSelectedTrackId] = useState(MUSIC_TRACKS[0].id);
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(0.7);
	const [muted, setMuted] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Init audio element once, safely
	useEffect(() => {
		const audio = new Audio();
		audio.loop = true;
		audio.volume = 0.7;
		audioRef.current = audio;
		return () => {
			audio.pause();
			audioRef.current = null;
		};
	}, []);

	// Sync volume/mute to audio element
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = muted ? 0 : volume;
		}
	}, [volume, muted]);

	// Close popover on outside click
	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest("[data-music-player]")) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	const handlePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;
		const track = MUSIC_TRACKS.find((t) => t.id === selectedTrackId)!;
		audio.src = track.src;
		audio.volume = muted ? 0 : volume;
		audio.load();
		audio.play()
			.then(() => setIsPlaying(true))
			.catch((err) => console.error("[MusicPlayer] play failed:", err));
	};

	const handleStop = () => {
		const audio = audioRef.current!;
		audio.pause();
		audio.currentTime = 0;
		setIsPlaying(false);
	};

	const currentLabel = MUSIC_TRACKS.find((t) => t.id === selectedTrackId)?.label ?? "";

	return (
		<div className="relative" data-music-player>
			{/* Trigger button */}
			<Button
				size="sm"
				variant="ghost"
				className={`text-amber-300 hover:text-amber-100 hover:bg-amber-900/30 ${
					isPlaying ? "bg-amber-900/20" : ""
				}`}
				onClick={() => setOpen((prev) => !prev)}
			>
				<Music className="w-4 h-4 mr-1" />
				Música
				{isPlaying && (
					<span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
				)}
			</Button>

			{/* Popover */}
			{open && (
				<div className="absolute bottom-full mb-2 right-0 w-64 bg-[#1a0e06] border border-amber-800/60 rounded-xl shadow-2xl z-50 p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="text-amber-300 text-sm font-semibold flex items-center gap-1.5">
							<Music className="w-3.5 h-3.5" />
							Música de ambiente
						</span>
						<button
							onClick={() => setOpen(false)}
							className="text-amber-600 hover:text-amber-300 text-sm leading-none"
						>
							✕
						</button>
					</div>

					{/* Track selector */}
					<div className="mb-3">
						<label className="text-amber-600 text-xs mb-1 block">Pista</label>
						<select
							value={selectedTrackId}
							onChange={(e) => {
								setSelectedTrackId(e.target.value);
								if (isPlaying) handleStop();
							}}
							className="w-full bg-[#0d0608] border border-amber-800/50 text-amber-200 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-amber-600"
						>
							{MUSIC_TRACKS.map((t) => (
								<option key={t.id} value={t.id}>{t.label}</option>
							))}
						</select>
					</div>

					{/* Play / Stop */}
					<div className="flex gap-2 mb-4">
						<Button
							size="sm"
							className="flex-1 bg-amber-700 hover:bg-amber-600 text-white text-xs disabled:opacity-40"
							onClick={handlePlay}
							disabled={isPlaying}
						>
							▶ Reproducir
						</Button>
						<Button
							size="sm"
							variant="outline"
							className="flex-1 border-amber-800 text-amber-400 hover:bg-amber-900/30 text-xs disabled:opacity-40"
							onClick={handleStop}
							disabled={!isPlaying}
						>
							⏹ Detener
						</Button>
					</div>

					{/* Now playing */}
					{isPlaying && (
						<p className="text-amber-500 text-xs mb-3 truncate">♪ {currentLabel}</p>
					)}

					<div className="border-t border-amber-900/50 mb-3" />

					{/* Volume */}
					<div>
						<label className="text-amber-600 text-xs mb-2 block">Volumen</label>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setMuted((prev) => !prev)}
								className="text-amber-400 hover:text-amber-200 shrink-0"
							>
								{muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
							</button>
							<input
								type="range"
								min={0}
								max={1}
								step={0.05}
								value={muted ? 0 : volume}
								onChange={(e) => {
									const v = parseFloat(e.target.value);
									setVolume(v);
									if (v > 0 && muted) setMuted(false);
									if (v === 0) setMuted(true);
								}}
								className="flex-1 accent-amber-500"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
