import React, { useState } from "react";
import {
  Star,
  Lock,
  Check,
  Gift,
  Trophy,
  Sparkles,
  Coffee,
  Plane,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Play
} from "lucide-react";
import { Unit, LessonNode, LearningDirection, UserStats } from "../types";
import { playSound } from "../utils/audio";

interface LearningPathProps {
  units: Unit[];
  direction: LearningDirection;
  stats: UserStats;
  onSelectNode: (node: LessonNode) => void;
  onOpenUnitGuide: (unit: Unit) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  units,
  direction,
  stats,
  onSelectNode,
  onOpenUnitGuide,
}) => {
  const isFrToEn = direction === "fr-to-en";
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Determine node status dynamically from user stats
  const getNodeStatus = (node: LessonNode, idx: number, unitIdx: number) => {
    if (stats.completedNodes.includes(node.id)) {
      return "completed";
    }
    // Check if it's the first uncompleted node
    const isFirstUncompleted =
      !stats.completedNodes.includes(node.id) &&
      (idx === 0 || stats.completedNodes.includes(units[unitIdx].nodes[idx - 1]?.id));

    return isFirstUncompleted ? "current" : "locked";
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Coffee":
        return <Coffee className="w-6 h-6" />;
      case "Plane":
        return <Plane className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getThemeColorClass = (color: string) => {
    switch (color) {
      case "green":
        return {
          headerBg: "bg-emerald-600",
          headerBorder: "border-emerald-700",
          buttonBg: "bg-emerald-500 hover:bg-emerald-600",
          buttonBorder: "border-emerald-700",
          ringColor: "ring-emerald-400",
        };
      case "blue":
        return {
          headerBg: "bg-sky-600",
          headerBorder: "border-sky-700",
          buttonBg: "bg-sky-500 hover:bg-sky-600",
          buttonBorder: "border-sky-700",
          ringColor: "ring-sky-400",
        };
      case "purple":
        return {
          headerBg: "bg-purple-600",
          headerBorder: "border-purple-700",
          buttonBg: "bg-purple-500 hover:bg-purple-600",
          buttonBorder: "border-purple-700",
          ringColor: "ring-purple-400",
        };
      default:
        return {
          headerBg: "bg-emerald-600",
          headerBorder: "border-emerald-700",
          buttonBg: "bg-emerald-500 hover:bg-emerald-600",
          buttonBorder: "border-emerald-700",
          ringColor: "ring-emerald-400",
        };
    }
  };

  // Horizontal zig-zag offsets for classic Duolingo path layout
  const getNodeOffsetClass = (index: number) => {
    const pattern = [
      "translate-x-0",
      "translate-x-8 sm:translate-x-12",
      "translate-x-12 sm:translate-x-20",
      "translate-x-8 sm:translate-x-12",
      "translate-x-0",
      "-translate-x-8 sm:-translate-x-12",
      "-translate-x-12 sm:-translate-x-20",
      "-translate-x-8 sm:-translate-x-12",
    ];
    return pattern[index % pattern.length];
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-12">
      {units.map((unit, unitIdx) => {
        const theme = getThemeColorClass(unit.themeColor);

        return (
          <div key={unit.id} className="space-y-8">
            {/* Unit Header Banner (Duolingo classic style) */}
            <div
              className={`${theme.headerBg} border-b-4 ${theme.headerBorder} rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden`}
            >
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                      {isFrToEn ? `Unité ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                    </span>
                    <span className="text-white/80 text-xs font-medium">
                      {unit.subtitle}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {unit.title}
                  </h2>
                  <p className="text-white/90 text-sm max-w-md">
                    {unit.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playSound("pop");
                    onOpenUnitGuide(unit);
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer border-b-2 border-white/30"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isFrToEn ? "Guide" : "Guidebook"}
                  </span>
                </button>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
            </div>

            {/* Winding Path Nodes */}
            <div className="flex flex-col items-center gap-10 py-4 relative">
              {unit.nodes.map((node, nodeIdx) => {
                const status = getNodeStatus(node, nodeIdx, unitIdx);
                const offsetClass = getNodeOffsetClass(nodeIdx);
                const isSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    className={`relative flex flex-col items-center ${offsetClass} transition-transform duration-300`}
                  >
                    {/* START Floating Tooltip if this node is active and selected/hovered */}
                    {(status === "current" || isSelected) && (
                      <div className="absolute -top-16 z-20 animate-bounce">
                        <button
                          onClick={() => {
                            playSound("pop");
                            onSelectNode(node);
                          }}
                          className={`${theme.buttonBg} text-white font-extrabold text-sm uppercase px-5 py-2.5 rounded-2xl shadow-lg border-b-4 ${theme.buttonBorder} flex items-center gap-2 cursor-pointer`}
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>{isFrToEn ? "COMMENCER" : "START"}</span>
                          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-lg ml-1">
                            +{node.lessonData.xpReward} XP
                          </span>
                        </button>
                        {/* Tooltip triangle indicator */}
                        <div className="w-4 h-4 bg-emerald-500 rotate-45 mx-auto -mt-2" />
                      </div>
                    )}

                    {/* Mascot Lingo sitting next to active node */}
                    {status === "current" && (
                      <div className="absolute -right-24 top-2 hidden sm:flex items-center gap-2">
                        <div className="bg-white px-3 py-1.5 rounded-xl border-2 border-slate-200 shadow-sm text-xs font-bold text-slate-700 relative">
                          {isFrToEn ? "En route !" : "Let's go!"}
                          <div className="absolute -left-1.5 top-2.5 w-2.5 h-2.5 bg-white border-l-2 border-b-2 border-slate-200 rotate-45" />
                        </div>
                        <span className="text-3xl animate-pulse">🦉</span>
                      </div>
                    )}

                    {/* Node Circle Button */}
                    <button
                      id={`node-${node.id}`}
                      onClick={() => {
                        playSound("pop");
                        if (status === "locked") return;
                        if (status === "current") {
                          onSelectNode(node);
                        } else {
                          // Allow replaying completed lessons!
                          onSelectNode(node);
                        }
                      }}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all cursor-pointer relative shadow-md ${
                        status === "completed"
                          ? "bg-amber-400 hover:bg-amber-500 border-b-8 border-amber-600 text-white"
                          : status === "current"
                          ? `${theme.buttonBg} border-b-8 ${theme.buttonBorder} text-white ring-8 ring-emerald-100 scale-105`
                          : "bg-slate-200 border-b-8 border-slate-300 text-slate-400 cursor-not-allowed"
                      }`}
                      title={
                        status === "locked"
                          ? isFrToEn
                            ? "Leçon verrouillée (Terminez la précédente)"
                            : "Locked lesson"
                          : `${node.title} - ${node.lessonData.title}`
                      }
                    >
                      {/* Node Center Icon */}
                      {status === "completed" ? (
                        <div className="flex flex-col items-center">
                          <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
                        </div>
                      ) : status === "current" ? (
                        <div className="flex flex-col items-center">
                          {node.type === "chest" ? (
                            <Gift className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
                          ) : node.type === "trophy" ? (
                            <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
                          ) : (
                            <Star className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                          )}
                        </div>
                      ) : (
                        <Lock className="w-8 h-8 stroke-[2.5]" />
                      )}

                      {/* Stars Crown for completed lesson */}
                      {status === "completed" && (
                        <div className="absolute -top-3 flex items-center gap-0.5 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        </div>
                      )}
                    </button>

                    {/* Node Title Label */}
                    <span className="mt-2 text-xs sm:text-sm font-extrabold text-slate-700 text-center max-w-[120px]">
                      {node.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
