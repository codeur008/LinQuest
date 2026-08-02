import React from "react";
import { X, Heart, Flame, BookOpen, Volume2, Sparkles, PlusCircle } from "lucide-react";
import { Unit, LearningDirection, UserStats } from "../types";
import { speakText, playSound } from "../utils/audio";

// 1. Unit Guidebook Modal
interface UnitGuideModalProps {
  unit: Unit | null;
  direction: LearningDirection;
  onClose: () => void;
}

export const UnitGuideModal: React.FC<UnitGuideModalProps> = ({
  unit,
  direction,
  onClose,
}) => {
  if (!unit) return null;
  const isFrToEn = direction === "fr-to-en";
  const targetLang = isFrToEn ? "en" : "fr";

  // Collect sample phrases from the unit's nodes
  const samplePhrases = unit.nodes
    .flatMap((n) => n.lessonData.exercises)
    .filter((ex) => Boolean(ex.sourceText && ex.correctAnswer))
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isFrToEn ? `Unité ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
              </span>
              <h2 className="text-xl font-black text-slate-800">
                {unit.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playSound("pop");
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black text-slate-700 uppercase">
            {isFrToEn ? "Astuce de l'unité" : "Unit Grammar Note"}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            {unit.description}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-700 uppercase">
            {isFrToEn
              ? "Phrases clés à prononcer"
              : "Key phrases to practice"}
          </h3>

          <div className="space-y-2">
            {samplePhrases.map((ex, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-extrabold text-slate-800 text-sm">
                    {ex.sourceText}
                  </div>
                  <div className="text-xs text-slate-500">
                    {ex.correctAnswer}
                  </div>
                </div>

                <button
                  onClick={() =>
                    speakText(
                      ex.sourceText,
                      isFrToEn ? "fr" : "en"
                    )
                  }
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors shrink-0"
                  title="Écouter"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            playSound("pop");
            onClose();
          }}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl border-b-4 border-emerald-700 uppercase tracking-wider transition-all cursor-pointer"
        >
          {isFrToEn ? "COMPRIS !" : "GOT IT!"}
        </button>
      </div>
    </div>
  );
};

// 2. Hearts Refill Modal
interface HeartsModalProps {
  isOpen: boolean;
  hearts: number;
  maxHearts: number;
  direction: LearningDirection;
  onRefill: () => void;
  onClose: () => void;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({
  isOpen,
  hearts,
  maxHearts,
  direction,
  onRefill,
  onClose,
}) => {
  if (!isOpen) return null;
  const isFrToEn = direction === "fr-to-en";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl border-4 border-rose-300 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Heart className="w-10 h-10 fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800">
            {isFrToEn
              ? `Vies : ${hearts} / ${maxHearts}`
              : `Hearts: ${hearts} / ${maxHearts}`}
          </h3>
          <p className="text-slate-600 text-sm">
            {hearts >= maxHearts
              ? isFrToEn
                ? "Vos vies sont pleines ! Prêt pour continuer à progresser."
                : "Your hearts are full! You are ready for your next lesson."
              : isFrToEn
              ? "Rechargez vos vies gratuitement pour continuer sans interruption !"
              : "Refill your hearts for free to keep learning!"}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              playSound("heart");
              onRefill();
              onClose();
            }}
            disabled={hearts >= maxHearts}
            className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all cursor-pointer shadow-md ${
              hearts >= maxHearts
                ? "bg-slate-200 border-b-4 border-slate-300 text-slate-400 cursor-not-allowed"
                : "bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700 text-white"
            }`}
          >
            {hearts >= maxHearts
              ? isFrToEn
                ? "VIES PLEINES (5/5)"
                : "HEARTS FULL (5/5)"
              : isFrToEn
              ? "RECHARGER GRATUITEMENT (+ ❤️)"
              : "REFILL HEARTS FREE (+ ❤️)"}
          </button>

          <button
            onClick={() => {
              playSound("pop");
              onClose();
            }}
            className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-sm"
          >
            {isFrToEn ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Streak Calendar Modal
interface StreakModalProps {
  isOpen: boolean;
  streak: number;
  direction: LearningDirection;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  streak,
  direction,
  onClose,
}) => {
  if (!isOpen) return null;
  const isFrToEn = direction === "fr-to-en";

  const daysFr = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const daysEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const days = isFrToEn ? daysFr : daysEn;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl border-4 border-orange-300 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-500">
          <Flame className="w-10 h-10 fill-orange-500 text-orange-500 animate-bounce" />
        </div>

        <div className="space-y-1">
          <div className="text-4xl font-black text-orange-600">
            {streak} {isFrToEn ? "jours" : "days"}
          </div>
          <h3 className="text-xl font-black text-slate-800">
            {isFrToEn ? "Série en cours !" : "Daily Streak Active!"}
          </h3>
          <p className="text-slate-500 text-xs">
            {isFrToEn
              ? "Chaque jour pratiqué renforce votre mémoire."
              : "Every daily lesson builds lasting polyglot habits."}
          </p>
        </div>

        {/* 7 Day Calendar Circles */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {days.map((dayName, idx) => {
            const isCompleted = idx <= Math.min(streak - 1, 6);
            return (
              <div key={dayName} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">
                  {dayName}
                </span>
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm transition-transform ${
                    isCompleted
                      ? "bg-orange-500 text-white shadow-sm scale-105"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? "🔥" : "•"}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            playSound("pop");
            onClose();
          }}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl border-b-4 border-orange-700 uppercase tracking-wider transition-all cursor-pointer"
        >
          {isFrToEn ? "CONTINUER" : "CONTINUE"}
        </button>
      </div>
    </div>
  );
};
