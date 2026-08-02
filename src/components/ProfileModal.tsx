import React from "react";
import {
  X,
  User,
  Mail,
  Target,
  Globe,
  Award,
  Calendar,
  LogOut,
  Flame,
  Gem,
  Heart,
  Sparkles,
} from "lucide-react";
import { UserProfile, UserStats, LearningDirection } from "../types";
import { playSound } from "../utils/audio";

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile | null;
  stats: UserStats;
  direction: LearningDirection;
  onClose: () => void;
  onLogout: () => void;
  onChangeDirection: (dir: LearningDirection) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  stats,
  direction,
  onClose,
  onLogout,
  onChangeDirection,
}) => {
  if (!isOpen) return null;

  const isFrToEn = direction === "fr-to-en";

  // Default display if no profile yet
  const displayProfile: UserProfile = profile || {
    id: "guest",
    name: "Invité(e)",
    email: "pas-encore-inscrit@lingoquest.fr",
    avatar: "🦉",
    avatarLabel: "Hibou Lingo",
    targetLanguage: isFrToEn ? "en" : "fr",
    learningReason: "Culture & Divertissement",
    dailyGoalMinutes: 10,
    joinedDate: "aujourd'hui",
    isGuest: true,
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case "en":
        return "Anglais 🇬🇧";
      case "fr":
        return "Français 🇫🇷";
      case "es":
        return "Espagnol 🇪🇸";
      default:
        return isFrToEn ? "Anglais 🇬🇧" : "Français 🇫🇷";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-3xl">
              {displayProfile.avatar}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {displayProfile.name}
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {displayProfile.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              playSound("pop");
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            title="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Stats Overview Pills */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-2xl">
            <div className="text-lg font-black text-orange-600 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span>{stats.streak}</span>
            </div>
            <div className="text-[11px] font-extrabold uppercase text-orange-700/80 mt-0.5">
              Jours Série
            </div>
          </div>

          <div className="p-3 bg-sky-50 border-2 border-sky-200 rounded-2xl">
            <div className="text-lg font-black text-sky-600 flex items-center justify-center gap-1">
              <Gem className="w-5 h-5 fill-sky-500 text-sky-500" />
              <span>{stats.gems}</span>
            </div>
            <div className="text-[11px] font-extrabold uppercase text-sky-700/80 mt-0.5">
              Diamants
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
            <div className="text-lg font-black text-emerald-600 flex items-center justify-center gap-1">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>{stats.xp}</span>
            </div>
            <div className="text-[11px] font-extrabold uppercase text-emerald-700/80 mt-0.5">
              Total XP
            </div>
          </div>
        </div>

        {/* Profile Info details */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Langue apprise :
            </span>
            <span className="font-black text-slate-800">
              {getLanguageName(displayProfile.targetLanguage)}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 font-bold flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Objectif quotidien :
            </span>
            <span className="font-black text-slate-800">
              {displayProfile.dailyGoalMinutes} min / jour
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Motivation :
            </span>
            <span className="font-black text-slate-800">
              {displayProfile.learningReason}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Inscrit(e) en :
            </span>
            <span className="font-black text-slate-800">
              {displayProfile.joinedDate}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              playSound("pop");
              onLogout();
              onClose();
            }}
            className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-rose-200 border-b-4 hover:border-rose-300 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter / Changer d'utilisateur</span>
          </button>

          <button
            onClick={() => {
              playSound("pop");
              onClose();
            }}
            className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-sm cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
