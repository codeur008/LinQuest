import React from "react";
import { UserStats, UserProfile } from "../types";
import { Settings, RefreshCw, Gem, Code } from "lucide-react";
import { playSound } from "../utils/audio";

interface AdminViewProps {
  stats: UserStats;
  profile: UserProfile | null;
  onUpdateStats: (newStats: UserStats) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ stats, profile, onUpdateStats }) => {
  const handleAddGems = () => {
    playSound("complete");
    onUpdateStats({
      ...stats,
      gems: stats.gems + 1000,
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la progression (XP, Série, Gemmes) ?")) {
      playSound("pop");
      onUpdateStats({
        ...stats,
        xp: 0,
        streak: 0,
        gems: 0,
        completedNodes: [],
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Settings className="w-4 h-4" />
            <span>Mode Développeur</span>
          </div>
          <h1 className="text-2xl font-black">Panneau d'Administration</h1>
          <p className="text-red-100 text-sm">
            Outils de test et de triche pour le développement.
          </p>
        </div>
        <div className="text-5xl shrink-0">🛠️</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Gem className="w-5 h-5 text-emerald-500" />
            Actions Rapides
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={handleAddGems}
              className="w-full flex items-center justify-between px-4 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-2xl font-bold transition-colors cursor-pointer"
            >
              <span>Ajouter 1000 Gemmes</span>
              <span className="text-lg">💰</span>
            </button>

            <button
              onClick={handleResetProgress}
              className="w-full flex items-center justify-between px-4 py-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl font-bold transition-colors cursor-pointer"
            >
              <span>Réinitialiser la progression</span>
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Raw Data Viewer */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-4 shadow-sm flex flex-col">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" />
            Données de Profil Actuel
          </h2>
          <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-auto max-h-[300px]">
            <pre className="text-xs text-green-400 font-mono">
              {JSON.stringify(
                {
                  profile: profile || "Non connecté",
                  stats: stats,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
