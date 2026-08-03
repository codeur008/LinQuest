import React, { useState, useEffect } from "react";
import {
  LearningDirection,
  UserStats,
  Unit,
  LessonNode,
  Lesson,
  LeagueLearner,
  DailyQuest,
  UserProfile,
} from "./types";
import {
  FR_TO_EN_UNITS,
  EN_TO_FR_UNITS,
  INITIAL_LEAGUE_LEARNERS,
  INITIAL_DAILY_QUESTS,
} from "./data/courses";
import { Header } from "./components/Header";
import { LearningPath } from "./components/LearningPath";
import { LessonModal } from "./components/LessonModal";
import { AIPracticeView } from "./components/AIPracticeView";
import { LeagueView } from "./components/LeagueView";
import { QuestsView } from "./components/QuestsView";
import { ShopView } from "./components/ShopView";
import { AdminView } from "./components/AdminView";
import {
  UnitGuideModal,
  HeartsModal,
  StreakModal,
} from "./components/Modals";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { ProfileModal } from "./components/ProfileModal";
import { InstallAppModal } from "./components/InstallAppModal";
import { playSound } from "./utils/audio";
import { encryptData, decryptData } from "./utils/security";
import { syncUserProfile } from "./utils/api";

const DEFAULT_STATS: UserStats = {
  xp: 350,
  streak: 7,
  hearts: 5,
  maxHearts: 5,
  gems: 120,
  league: "Or",
  completedNodes: [],
  lastPlayedDate: new Date().toISOString().split("T")[0],
  activeCostume: "default",
  unlockedCostumes: ["default"],
};

export default function App() {
  // Learning direction: "fr-to-en" (default) or "en-to-fr"
  const [direction, setDirection] = useState<LearningDirection>(() => {
    const saved = localStorage.getItem("lingoquest_direction");
    return (saved as LearningDirection) || "fr-to-en";
  });

  // User Stats
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem("lingoquest_stats");
    if (saved) {
      const parsed = decryptData(saved);
      if (parsed) return parsed;
    }
    return DEFAULT_STATS;
  });

  const saveStats = (statsOrUpdater: UserStats | ((prev: UserStats) => UserStats)) => {
    const newStats = typeof statsOrUpdater === "function" ? statsOrUpdater(stats) : statsOrUpdater;
    setStats(newStats);
    
    // Save locally
    const statsStr = encryptData(newStats);
    localStorage.setItem("lingoquest_stats", statsStr);
    
    // Sync to backend (if profile exists)
    if (userProfile) {
      syncUserProfile(userProfile, newStats);
    }
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "path" | "league" | "quests" | "ai" | "shop" | "admin"
  >("path");

  // League Learners & Quests
  const [learners, setLearners] = useState<LeagueLearner[]>(() => {
    return INITIAL_LEAGUE_LEARNERS;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    return INITIAL_DAILY_QUESTS;
  });

  // Active Lesson modal state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Modals state
  const [guideUnit, setGuideUnit] = useState<Unit | null>(null);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any | null>(null);

  // Capture browser PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === "accepted") {
        setInstallPromptEvent(null);
        setShowInstallModal(false);
      }
    }
  };

  // User profile & Duolingo onboarding state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("lingoquest_profile");
    if (saved) {
      const parsed = decryptData(saved);
      if (parsed) return parsed;
    }
    return null;
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding if no valid decrypted profile exists
    const saved = localStorage.getItem("lingoquest_profile");
    if (saved) {
      const parsed = decryptData(saved);
      if (parsed) return false;
    }
    return true;
  });

  // Handle profile creation or login
  const handleCompleteOnboarding = (newProfile: UserProfile, token: string) => {
    setUserProfile(newProfile);
    setShowOnboarding(false);
    localStorage.setItem("lingoquest_profile", encryptData(newProfile));
    
    // Sync initially with stats
    syncUserProfile(newProfile, stats);
    
    if (newProfile.isAdmin) {
      setActiveTab("admin");
    } else {
      setActiveTab("path");
    }

    if (newProfile.targetLanguage === "fr") {
      setDirection("en-to-fr");
    } else {
      setDirection("fr-to-en");
    }
  };

  const handleLoginExisting = (existingProfile: UserProfile, token: string) => {
    setUserProfile(existingProfile);
    setShowOnboarding(false);
    localStorage.setItem("lingoquest_profile", encryptData(existingProfile));
    
    if (existingProfile.isAdmin) {
      setActiveTab("admin");
    } else {
      setActiveTab("path");
    }

    if (existingProfile.targetLanguage === "fr") {
      setDirection("en-to-fr");
    } else {
      setDirection("fr-to-en");
    }
  };

  const handleLogout = () => {
    import("./utils/api").then((api) => api.removeToken());
    localStorage.removeItem("lingoquest_profile");
    localStorage.removeItem("lingoquest_stats");
    setUserProfile(null);
    setShowOnboarding(true);
    setActiveTab("path");
  };

  // Lock direction to user profile's target language
  useEffect(() => {
    if (userProfile) {
      if (userProfile.targetLanguage === "fr") {
        setDirection("en-to-fr");
      } else {
        setDirection("fr-to-en");
      }
    }
  }, [userProfile]);

  // Sync direction to storage
  useEffect(() => {
    localStorage.setItem("lingoquest_direction", direction);
  }, [direction]);

  // Sync stats to storage & update user in leaderboard
  useEffect(() => {
    localStorage.setItem("lingoquest_stats", encryptData(stats));

    setLearners((prev) =>
      prev.map((l) =>
        l.isUser ? { ...l, xp: stats.xp, name: userProfile?.name || l.name } : l
      )
    );
  }, [stats, userProfile]);

  // Current units depending on learning direction
  const units: Unit[] = direction === "fr-to-en" ? FR_TO_EN_UNITS : EN_TO_FR_UNITS;

  // Handle selecting a node from the winding path
  const handleSelectNode = (node: LessonNode) => {
    if (node.type === "chest") {
      // Bonus chest node: give instant gems and mark completed!
      if (!stats.completedNodes.includes(node.id)) {
        playSound("complete");
        setStats((prev) => ({
          ...prev,
          gems: prev.gems + 30,
          xp: prev.xp + node.lessonData.xpReward,
          completedNodes: [...prev.completedNodes, node.id],
        }));
      }
      return;
    }

    setActiveNodeId(node.id);
    setActiveLesson(node.lessonData);
  };

  // Handle completing a lesson
  const handleCompleteLesson = (xpEarned: number, accuracy: number) => {
    playSound("complete");

    // Check if we need to update daily streak
    const today = new Date().toISOString().split("T")[0];
    const isNewDay = stats.lastPlayedDate !== today;
    const newStreak = isNewDay ? stats.streak + 1 : stats.streak;

    const newCompletedNodes =
      activeNodeId && !stats.completedNodes.includes(activeNodeId)
        ? [...stats.completedNodes, activeNodeId]
        : stats.completedNodes;

    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      streak: newStreak,
      lastPlayedDate: today,
      completedNodes: newCompletedNodes,
      gems: prev.gems + (accuracy === 100 ? 10 : 5),
    }));

    // Update Daily Quests progress
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === "quest-1") {
          return {
            ...q,
            current: Math.min(q.current + xpEarned, q.target),
          };
        }
        if (q.id === "quest-2" && accuracy === 100) {
          return {
            ...q,
            current: 1,
          };
        }
        return q;
      })
    );

    setActiveLesson(null);
    setActiveNodeId(null);
  };

  // Handle losing a heart during a lesson
  const handleLoseHeart = () => {
    setStats((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  };

  // Handle refilling hearts
  const handleRefillHearts = () => {
    setStats((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
    }));
  };

  // Handle buying a costume
  const handleBuyCostume = (costumeId: string, price: number) => {
    if (stats.gems < price) return;
    setStats((prev) => ({
      ...prev,
      gems: prev.gems - price,
      unlockedCostumes: [...prev.unlockedCostumes, costumeId],
      activeCostume: costumeId,
    }));
  };

  // Handle equipping a costume
  const handleEquipCostume = (costumeId: string) => {
    setStats((prev) => ({
      ...prev,
      activeCostume: costumeId,
    }));
  };

  // Handle claiming quest rewards
  const handleClaimQuestReward = (questId: string, gems: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
    );
    setStats((prev) => ({
      ...prev,
      gems: prev.gems + gems,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation Header */}
      <Header
        direction={direction}
        onDirectionChange={(dir) => setDirection(dir)}
        stats={stats}
        profile={userProfile}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenHeartsModal={() => setShowHeartsModal(true)}
        onOpenStreakModal={() => setShowStreakModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
      />

      {/* Main Body */}
      <main className="flex-1 pb-24 lg:pb-12">
        {activeTab === "path" && (
          <LearningPath
            units={units}
            direction={direction}
            stats={stats}
            onSelectNode={handleSelectNode}
            onOpenUnitGuide={(unit) => setGuideUnit(unit)}
          />
        )}

        {activeTab === "league" && (
          <LeagueView learners={learners} direction={direction} />
        )}

        {activeTab === "quests" && (
          <QuestsView
            quests={quests}
            direction={direction}
            onClaimQuestReward={handleClaimQuestReward}
          />
        )}

        {activeTab === "ai" && (
          <AIPracticeView
            direction={direction}
            onStartLesson={(lesson) => {
              setActiveNodeId(null);
              setActiveLesson(lesson);
            }}
          />
        )}

        {activeTab === "shop" && (
          <ShopView
            stats={stats}
            direction={direction}
            onRefillHearts={handleRefillHearts}
            onBuyCostume={handleBuyCostume}
            onEquipCostume={handleEquipCostume}
          />
        )}

        {activeTab === "admin" && (
          userProfile?.isAdmin ? (
            <AdminView
              stats={stats}
              profile={userProfile}
              onUpdateStats={setStats}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 font-bold">
              Accès refusé. Réservé aux administrateurs.
            </div>
          )
        )}
      </main>

      {/* 1. Active Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          direction={direction}
          hearts={stats.hearts}
          onLoseHeart={handleLoseHeart}
          onCompleteLesson={handleCompleteLesson}
          onClose={() => {
            setActiveLesson(null);
            setActiveNodeId(null);
          }}
        />
      )}

      {/* 2. Unit Guidebook Modal */}
      <UnitGuideModal
        unit={guideUnit}
        direction={direction}
        onClose={() => setGuideUnit(null)}
      />

      {/* 3. Hearts Refill Modal */}
      <HeartsModal
        isOpen={showHeartsModal}
        hearts={stats.hearts}
        maxHearts={stats.maxHearts}
        direction={direction}
        onRefill={handleRefillHearts}
        onClose={() => setShowHeartsModal(false)}
      />

      {/* 4. Streak Calendar Modal */}
      <StreakModal
        isOpen={showStreakModal}
        streak={stats.streak}
        direction={direction}
        onClose={() => setShowStreakModal(false)}
      />

      {/* 5. Duolingo Onboarding & Authentication Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleCompleteOnboarding}
          onLoginExisting={handleLoginExisting}
        />
      )}

      {/* 6. Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        profile={userProfile}
        stats={stats}
        direction={direction}
        onClose={() => setShowProfileModal(false)}
        onLogout={handleLogout}
        onChangeDirection={(dir) => setDirection(dir)}
        onGoToAdmin={() => {
          setShowProfileModal(false);
          setActiveTab("admin");
        }}
      />

      {/* 7. Install PWA on Phone Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isFrToEn={direction === "fr-to-en"}
        installPromptEvent={installPromptEvent}
        onTriggerInstall={handleTriggerInstall}
      />
    </div>
  );
}
