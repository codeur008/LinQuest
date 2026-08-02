import React from "react";
import { Heart, ShieldAlert, Sparkles, Check, Gem, Zap } from "lucide-react";
import { UserStats, LearningDirection } from "../types";
import { MASCOT_COSTUMES } from "../data/courses";
import { playSound } from "../utils/audio";

interface ShopViewProps {
  stats: UserStats;
  direction: LearningDirection;
  onRefillHearts: () => void;
  onBuyCostume: (costumeId: string, price: number) => void;
  onEquipCostume: (costumeId: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  stats,
  direction,
  onRefillHearts,
  onBuyCostume,
  onEquipCostume,
}) => {
  const isFrToEn = direction === "fr-to-en";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Shop Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            {isFrToEn ? "Magasin & Costumes" : "Shop & Costumes"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isFrToEn ? "Boutique de Lingo" : "Lingo's Shop"}
          </h1>
          <p className="text-white/90 text-sm max-w-md">
            {isFrToEn
              ? "Dépensez vos gemmes 💎 pour des vies, des gels de série et des tenues stylées pour votre hibou !"
              : "Spend your gems 💎 on heart refills, streak freezes, and fun costumes for your owl!"}
          </p>
        </div>
        <div className="text-6xl shrink-0">🛍️</div>
      </div>

      {/* Hearts & Streak Freeze Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800">
          {isFrToEn ? "Bonus & Vies" : "Power-ups & Hearts"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Refill Hearts Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <div className="font-extrabold text-slate-800">
                  {isFrToEn ? "Recharger toutes les vies" : "Refill All Hearts"}
                </div>
                <div className="text-xs text-slate-500">
                  {isFrToEn
                    ? "Remontez à 5/5 cœurs immédiatement"
                    : "Restore to 5/5 hearts instantly"}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playSound("heart");
                onRefillHearts();
              }}
              disabled={stats.hearts >= stats.maxHearts}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                stats.hearts >= stats.maxHearts
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-700"
              }`}
            >
              {stats.hearts >= stats.maxHearts
                ? isFrToEn
                  ? "COMPLET"
                  : "FULL"
                : "GRATUIT / FREE"}
            </button>
          </div>

          {/* Streak Freeze Card */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0 text-2xl">
                🧊
              </div>
              <div>
                <div className="font-extrabold text-slate-800">
                  {isFrToEn ? "Gel de Série" : "Streak Freeze"}
                </div>
                <div className="text-xs text-slate-500">
                  {isFrToEn
                    ? "Protège votre série si vous manquez un jour"
                    : "Protects your streak if you miss a day"}
                </div>
              </div>
            </div>

            <button
              onClick={() => playSound("pop")}
              className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 font-black text-xs uppercase tracking-wider border border-sky-200"
            >
              {isFrToEn ? "ÉQUIPÉ" : "EQUIPPED"}
            </button>
          </div>
        </div>
      </div>

      {/* Mascot Costumes Showcase */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-slate-800">
          {isFrToEn ? "Tenues pour Lingo le Hibou" : "Costumes for Lingo"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MASCOT_COSTUMES.map((item) => {
            const isUnlocked = stats.unlockedCostumes.includes(item.id);
            const isEquipped = stats.activeCostume === item.id;
            const canAfford = stats.gems >= item.price;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                  isEquipped
                    ? "bg-purple-50/70 border-purple-400 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shrink-0">
                    {item.emoji}
                  </div>
                  <div className="space-y-1">
                    <div className="font-extrabold text-slate-800 text-sm sm:text-base">
                      {isFrToEn ? item.nameFr : item.nameEn}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isFrToEn ? item.descriptionFr : item.descriptionEn}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isEquipped ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-black">
                      <Check className="w-4 h-4" />
                      <span>{isFrToEn ? "Équipé" : "Equipped"}</span>
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        playSound("pop");
                        onEquipCostume(item.id);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-extrabold text-xs uppercase cursor-pointer"
                    >
                      {isFrToEn ? "ÉQUIPER" : "EQUIP"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playSound("complete");
                        onBuyCostume(item.id, item.price);
                      }}
                      disabled={!canAfford}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        canAfford
                          ? "bg-pink-500 hover:bg-pink-600 text-white border-b-4 border-pink-700"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span>{item.price}</span>
                      <span>💎</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
