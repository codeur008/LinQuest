import React from "react";
import { Target, Gift, CheckCircle2, Award, Sparkles } from "lucide-react";
import { DailyQuest, LearningDirection } from "../types";
import { playSound } from "../utils/audio";

interface QuestsViewProps {
  quests: DailyQuest[];
  direction: LearningDirection;
  onClaimQuestReward: (questId: string, gems: number) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  quests,
  direction,
  onClaimQuestReward,
}) => {
  const isFrToEn = direction === "fr-to-en";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            {isFrToEn ? "Objectifs Quotidiens" : "Daily Goals"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isFrToEn ? "Quêtes du Jour" : "Daily Quests"}
          </h1>
          <p className="text-white/90 text-sm max-w-md">
            {isFrToEn
              ? "Complétez vos missions pour débloquer des coffres de gemmes 💎 !"
              : "Complete your missions to unlock gem chests 💎!"}
          </p>
        </div>
        <div className="text-6xl shrink-0">🎯</div>
      </div>

      {/* Quests List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800">
          {isFrToEn ? "Missions actives" : "Active Quests"}
        </h2>

        <div className="space-y-3">
          {quests.map((quest) => {
            const progress = Math.min(
              Math.round((quest.current / quest.target) * 100),
              100
            );
            const isReady = quest.current >= quest.target && !quest.completed;

            return (
              <div
                key={quest.id}
                className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${
                      quest.completed
                        ? "bg-emerald-100 text-emerald-600 border border-emerald-300"
                        : "bg-sky-100 text-sky-600 border border-sky-300"
                    }`}
                  >
                    {quest.completed ? "✓" : "🎁"}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-base">
                        {isFrToEn ? quest.titleFr : quest.titleEn}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {quest.current} / {quest.target}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          quest.completed
                            ? "bg-emerald-500"
                            : "bg-sky-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {quest.completed ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-extrabold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isFrToEn ? "Récupéré" : "Claimed"}</span>
                    </span>
                  ) : isReady ? (
                    <button
                      onClick={() => {
                        playSound("complete");
                        onClaimQuestReward(quest.id, quest.rewardGems);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer animate-bounce"
                    >
                      +{quest.rewardGems} 💎 {isFrToEn ? "OUVRIR" : "CLAIM"}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl text-xs font-extrabold">
                      +{quest.rewardGems} 💎
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges / Succès Showcase */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-slate-800">
          {isFrToEn ? "Succès & Badges" : "Achievements & Badges"}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              titleFr: "Légende du Matin",
              titleEn: "Early Bird",
              descFr: "Compléter une leçon avant 9h",
              descEn: "Complete a lesson before 9am",
              icon: "🌅",
              unlocked: true,
            },
            {
              titleFr: "Série de 7 jours",
              titleEn: "7-Day Streak",
              descFr: "Tenir une série pendant 7 jours",
              descEn: "Maintain a streak for 7 days",
              icon: "🔥",
              unlocked: true,
            },
            {
              titleFr: "Polyglotte",
              titleEn: "Polyglot",
              descFr: "Essayer l'Anglais et le Français",
              descEn: "Practice both English and French",
              icon: "🌍",
              unlocked: true,
            },
            {
              titleFr: "Maître de la Prononciation",
              titleEn: "Voice Master",
              descFr: "Réussir 10 exercices oraux",
              descEn: "Succeed in 10 speaking exercises",
              icon: "🎙️",
              unlocked: true,
            },
            {
              titleFr: "Sage de la Grammaire",
              titleEn: "Grammar Sage",
              descFr: "Utiliser DuoCoach IA 5 fois",
              descEn: "Use AI DuoCoach 5 times",
              icon: "🦉",
              unlocked: true,
            },
            {
              titleFr: "Champion d'Or",
              titleEn: "Gold Champion",
              descFr: "Finir #1 de la ligue",
              descEn: "Finish #1 in the league",
              icon: "👑",
              unlocked: false,
            },
          ].map((badge) => (
            <div
              key={badge.titleEn}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center space-y-2 transition-transform hover:scale-105 ${
                badge.unlocked
                  ? "bg-white border-slate-200 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                {badge.icon}
              </div>
              <div>
                <div className="font-extrabold text-slate-800 text-sm">
                  {isFrToEn ? badge.titleFr : badge.titleEn}
                </div>
                <div className="text-xs text-slate-500">
                  {isFrToEn ? badge.descFr : badge.descEn}
                </div>
              </div>
              {badge.unlocked && (
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {isFrToEn ? "Débloqué" : "Unlocked"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
