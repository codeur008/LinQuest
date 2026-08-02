import React from "react";
import {
  Flame,
  Gem,
  Heart,
  BookOpen,
  Trophy,
  Target,
  Sparkles,
  ShoppingBag,
  Globe,
  PlusCircle,
  HelpCircle,
  User
} from "lucide-react";
import { LearningDirection, UserStats, UserProfile } from "../types";
import { playSound } from "../utils/audio";

interface HeaderProps {
  direction: LearningDirection;
  onDirectionChange: (dir: LearningDirection) => void;
  stats: UserStats;
  profile?: UserProfile | null;
  activeTab: "path" | "league" | "quests" | "ai" | "shop";
  onTabChange: (tab: "path" | "league" | "quests" | "ai" | "shop") => void;
  onOpenHeartsModal: () => void;
  onOpenStreakModal: () => void;
  onOpenProfileModal?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  direction,
  onDirectionChange,
  stats,
  profile,
  activeTab,
  onTabChange,
  onOpenHeartsModal,
  onOpenStreakModal,
  onOpenProfileModal,
  onOpenInstallModal,
}) => {
  const isFrToEn = direction === "fr-to-en";

  const handleTabClick = (tab: "path" | "league" | "quests" | "ai" | "shop") => {
    playSound("pop");
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Mascot Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabClick("path")}
            className="flex items-center gap-2 text-2xl font-black tracking-tight text-emerald-600 hover:opacity-90 transition-opacity cursor-pointer"
            title="LingoQuest"
          >
            <span className="text-3xl" role="img" aria-label="Mascotte">
              {stats.activeCostume === "beret"
                ? "🎨🦉"
                : stats.activeCostume === "sherlock"
                ? "🎩🦉"
                : stats.activeCostume === "superlingo"
                ? "🦸‍♂️🦉"
                : stats.activeCostume === "wizard"
                ? "🧙‍♂️🦉"
                : "🦉"}
            </span>
            <span className="hidden sm:inline">LingoQuest</span>
          </button>

          {/* Language Direction Switcher - hidden completely when user is logged in */}
          {!profile && (
            <button
              onClick={() => {
                playSound("pop");
                onDirectionChange(isFrToEn ? "en-to-fr" : "fr-to-en");
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
              title={
                isFrToEn
                  ? "Cliquer pour apprendre le Français depuis l'Anglais"
                  : "Click to learn English from French"
              }
            >
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              {isFrToEn ? (
                <span className="flex items-center gap-1">
                  <span className="text-base">🇫🇷</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-base">🇬🇧</span>
                  <span className="hidden md:inline text-emerald-700 font-extrabold">Anglais</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="text-base">🇬🇧</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-base">🇫🇷</span>
                  <span className="hidden md:inline text-emerald-700 font-extrabold">Français</span>
                </span>
              )}
            </button>
          )}
        </div>

        {/* Center / Desktop Navigation Tabs (visible only on large screens >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => handleTabClick("path")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === "path"
                ? "bg-emerald-100 text-emerald-700 border-b-2 border-emerald-500"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isFrToEn ? "Parcours" : "Path"}
          </button>

          <button
            onClick={() => handleTabClick("league")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === "league"
                ? "bg-amber-100 text-amber-700 border-b-2 border-amber-500"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Trophy className="w-4 h-4" />
            {isFrToEn ? "Ligue" : "League"}
          </button>

          <button
            onClick={() => handleTabClick("quests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === "quests"
                ? "bg-sky-100 text-sky-700 border-b-2 border-sky-500"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Target className="w-4 h-4" />
            {isFrToEn ? "Quêtes" : "Quests"}
          </button>

          <button
            onClick={() => handleTabClick("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === "ai"
                ? "bg-purple-100 text-purple-700 border-b-2 border-purple-500"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            {isFrToEn ? "DuoCoach IA" : "AI Coach"}
          </button>

          <button
            onClick={() => handleTabClick("shop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${
              activeTab === "shop"
                ? "bg-pink-100 text-pink-700 border-b-2 border-pink-500"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isFrToEn ? "Magasin" : "Shop"}
          </button>
        </nav>

        {/* Right Stats (Streak, Gems, Hearts) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak button */}
          <button
            onClick={() => {
              playSound("pop");
              onOpenStreakModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 font-extrabold text-sm transition-colors cursor-pointer"
            title={isFrToEn ? "Série de jours consécutifs" : "Daily Streak"}
          >
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500 animate-bounce" />
            <span>{stats.streak}</span>
          </button>

          {/* Gems counter */}
          <div
            onClick={() => handleTabClick("shop")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 font-extrabold text-sm transition-colors cursor-pointer"
            title={isFrToEn ? "Gemmes accumulées" : "Gems earned"}
          >
            <Gem className="w-5 h-5 fill-sky-500 text-sky-500" />
            <span>{stats.gems}</span>
          </div>

          {/* Hearts counter */}
          <button
            onClick={() => {
              playSound("heart");
              onOpenHeartsModal();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-sm transition-colors cursor-pointer"
            title={
              isFrToEn
                ? "Vies disponibles (Cliquer pour recharger)"
                : "Hearts available (Click to refill)"
            }
          >
            <Heart
              className={`w-5 h-5 ${
                stats.hearts > 0
                  ? "fill-rose-500 text-rose-500"
                  : "text-slate-400 fill-slate-300"
              }`}
            />
            <span>
              {stats.hearts}/{stats.maxHearts}
            </span>
            {stats.hearts < stats.maxHearts && (
              <PlusCircle className="w-3.5 h-3.5 text-rose-500 ml-0.5" />
            )}
          </button>

          {/* Profile / Auth Button */}
          {onOpenProfileModal && (
            <button
              onClick={() => {
                playSound("pop");
                onOpenProfileModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
              title="Mon Profil / Compte"
            >
              <span className="text-base">
                {profile ? profile.avatar : "🦉"}
              </span>
              <span className="hidden sm:inline">
                {profile ? profile.name : isFrToEn ? "S'inscrire" : "Sign in"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Bottom Navigation Bar (Fixed bottom for authentic Duolingo touch feel on screens < 1024px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t-2 border-slate-200 bg-white/95 backdrop-blur-md px-2 sm:px-12 md:px-24 py-2.5 shadow-lg">
        <button
          onClick={() => handleTabClick("path")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === "path"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs">{isFrToEn ? "Parcours" : "Path"}</span>
        </button>

        <button
          onClick={() => handleTabClick("league")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === "league"
              ? "text-amber-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs">{isFrToEn ? "Ligue" : "League"}</span>
        </button>

        <button
          onClick={() => handleTabClick("quests")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === "quests"
              ? "text-sky-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs">{isFrToEn ? "Quêtes" : "Quests"}</span>
        </button>

        <button
          onClick={() => handleTabClick("ai")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === "ai"
              ? "text-purple-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs">{isFrToEn ? "DuoCoach" : "AI Coach"}</span>
        </button>

        <button
          onClick={() => handleTabClick("shop")}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            activeTab === "shop"
              ? "text-pink-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] sm:text-xs">{isFrToEn ? "Boutique" : "Shop"}</span>
        </button>
      </div>
    </header>
  );
};
