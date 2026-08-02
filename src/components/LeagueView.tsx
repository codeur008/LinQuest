import React from "react";
import { Trophy, Shield, Flame, Award, ChevronUp } from "lucide-react";
import { LeagueLearner, LearningDirection } from "../types";
import { playSound } from "../utils/audio";

interface LeagueViewProps {
  learners: LeagueLearner[];
  direction: LearningDirection;
}

export const LeagueView: React.FC<LeagueViewProps> = ({
  learners,
  direction,
}) => {
  const isFrToEn = direction === "fr-to-en";
  const sortedLearners = [...learners].sort((a, b) => b.xp - a.xp);

  // Find user's rank after sort
  const userRank = sortedLearners.findIndex((l) => l.isUser) + 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* League Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            {isFrToEn ? "Semaine en cours" : "Current Week"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isFrToEn ? "Ligue d'Or" : "Gold League"}
          </h1>
          <p className="text-white/90 text-sm max-w-md">
            {isFrToEn
              ? "Terminez dans le top 3 pour remporter une médaille et un badge de ligue !"
              : "Finish in the top 3 to win a medal and advance to the next league!"}
          </p>
        </div>

        <div className="text-6xl shrink-0">🏆</div>
      </div>

      {/* User Status Card */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-lg">
            #{userRank}
          </div>
          <div>
            <div className="font-black text-amber-900 text-sm">
              {isFrToEn
                ? "Votre position actuelle"
                : "Your current standing"}
            </div>
            <div className="text-xs font-bold text-amber-700">
              {userRank <= 3
                ? isFrToEn
                  ? "🔥 Bravo ! Vous êtes sur le podium !"
                  : "🔥 Amazing! You are on the podium!"
                : isFrToEn
                ? "Encore quelques leçons pour atteindre le top 3 !"
                : "Just a few lessons away from the top 3!"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-100 text-amber-800 font-black px-3 py-1.5 rounded-xl text-sm">
          <ChevronUp className="w-4 h-4 text-emerald-600" />
          <span>Zone de promotion</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold uppercase text-slate-500">
          <span>{isFrToEn ? "Rang & Apprenant" : "Rank & Learner"}</span>
          <span>XP</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedLearners.map((learner, idx) => {
            const rank = idx + 1;
            const isUser = Boolean(learner.isUser);

            const getMedal = () => {
              if (rank === 1) return "🥇";
              if (rank === 2) return "🥈";
              if (rank === 3) return "🥉";
              return null;
            };

            return (
              <div
                key={learner.name}
                onClick={() => playSound("pop")}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isUser
                    ? "bg-amber-50/70 border-l-4 border-amber-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center font-black text-slate-500 text-sm">
                    {getMedal() || rank}
                  </span>

                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                    {learner.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 text-sm sm:text-base">
                        {learner.name}
                      </span>
                      <span>{learner.countryFlag}</span>
                    </div>
                    {isUser && (
                      <span className="text-xs font-bold text-amber-700">
                        {isFrToEn ? "(C'est vous !)" : "(You!)"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-black text-slate-700 text-sm sm:text-base">
                  <span>{learner.xp}</span>
                  <span className="text-xs text-slate-400 font-bold">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
