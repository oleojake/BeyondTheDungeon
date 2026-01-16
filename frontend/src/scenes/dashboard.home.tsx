import React from "react";
import { cn } from "@/lib/utils";

export const DashboardHome: React.FC = () => {
  const campaigns = [
    {
      title: "The Sunless Citadel",
      role: "Dungeon Master",
      color: "from-purple-600/30 to-purple-500/20",
      image:
        "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
      players: ["A", "B", "C", "D"],
      extra: 2,
    },
    {
      title: "Curse of Strahd",
      role: "Player",
      color: "from-orange-500/30 to-red-500/20",
      image:
        "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&w=1200&q=80",
      players: ["E", "F", "G"],
      extra: 0,
    },
    {
      title: "Lost Mine of Phandelver",
      role: "Player",
      color: "from-cyan-500/30 to-emerald-500/20",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      players: ["H", "I", "J", "K"],
      extra: 0,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Mis Campañas
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Gestiona tus campañas y personajes
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">
          <span className="text-lg leading-none">＋</span>
          Crear Campaña
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <article
            key={c.title}
            className="rounded-2xl border border-dark-border/80 bg-gradient-to-b from-[#1b1226] to-[#140d1d] shadow-xl shadow-black/30 overflow-hidden"
          >
            <div
              className={cn("h-48 w-full", `bg-gradient-to-r ${c.color}`)}
            >
              <img
                src={c.image}
                alt={c.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-200">
                <span>{c.role}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {c.title}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {c.players.map((p) => (
                    <span
                      key={p}
                      className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-sm font-semibold inline-flex items-center justify-center border-2 border-[#140d1d] shadow-sm"
                    >
                      {p}
                    </span>
                  ))}
                  {c.extra > 0 && (
                    <span className="h-9 w-9 rounded-full bg-[#1f152b] text-white text-xs font-semibold inline-flex items-center justify-center border-2 border-[#140d1d]">
                      +{c.extra}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button className="rounded-xl bg-purple-700/80 hover:bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-700/30 transition">
                  Entrar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export default DashboardHome;
