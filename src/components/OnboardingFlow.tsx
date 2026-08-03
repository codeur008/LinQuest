import React, { useState } from "react";
import {
  Globe,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Mail,
  Lock,
  LogOut,
  Target,
  Compass,
  Award,
  BookOpen,
  X,
  Smartphone,
  Download,
  CheckCircle2
} from "lucide-react";
import { UserProfile, TargetLanguage, LearningDirection } from "../types";
import { playSound } from "../utils/audio";
import { downloadApk } from "../utils/apk";
import { hashPassword, ADMIN_PASSWORD_HASH } from "../utils/security";

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
  onLoginExisting: (profile: UserProfile) => void;
}


const AVATAR_OPTIONS = [
  { id: "owl", emoji: "🦉", name: "Hibou Lingo", bg: "bg-emerald-100 border-emerald-400 text-emerald-700" },
  { id: "fox", emoji: "🦊", name: "Renard Malin", bg: "bg-orange-100 border-orange-400 text-orange-700" },
  { id: "cat", emoji: "🐱", name: "Chat Curieux", bg: "bg-amber-100 border-amber-400 text-amber-700" },
  { id: "panda", emoji: "🐼", name: "Panda Sage", bg: "bg-slate-100 border-slate-400 text-slate-700" },
  { id: "lion", emoji: "🦁", name: "Lion Vaillant", bg: "bg-yellow-100 border-yellow-400 text-yellow-700" },
  { id: "unicorn", emoji: "🦄", name: "Licorne Magique", bg: "bg-purple-100 border-purple-400 text-purple-700" },
];

const LANGUAGE_OPTIONS = [
  {
    id: "en" as TargetLanguage,
    flag: "🇬🇧",
    name: "Anglais",
    learners: "4,2M apprenants",
    desc: "Pour les francophones souhaitant maîtriser l'anglais",
  },
  {
    id: "fr" as TargetLanguage,
    flag: "🇫🇷",
    name: "Français",
    learners: "3,8M apprenants",
    desc: "For English speakers learning French",
  },
  {
    id: "es" as TargetLanguage,
    flag: "🇪🇸",
    name: "Espagnol",
    learners: "2,1M apprenants",
    desc: "Pour apprendre l'espagnol du quotidien (Nouveau !)",
  },
];

const REASON_OPTIONS = [
  { id: "travel", icon: "✈️", title: "Préparer un voyage", desc: "Commander au restaurant, demander son chemin..." },
  { id: "career", icon: "💼", title: "Booster ma carrière", desc: "Réunions, entretiens et opportunités professionnelles" },
  { id: "brain", icon: "🧠", title: "Entraîner mon cerveau", desc: "Rester vif et apprendre de nouveaux mots" },
  { id: "culture", icon: "🎬", title: "Culture & Divertissement", desc: "Regarder des séries et lire sans sous-titres" },
  { id: "family", icon: "❤️", title: "Amis & Famille", desc: "Échanger avec des proches et des correspondants" },
  { id: "school", icon: "🎓", title: "Études & Scolarité", desc: "Réussir ses examens et certifications de langue" },
];

const GOAL_OPTIONS = [
  { min: 5, label: "Détendu", xp: "50 XP par jour", icon: "☕" },
  { min: 10, label: "Normal", xp: "100 XP par jour", icon: "🚶", default: true },
  { min: 15, label: "Sérieux", xp: "150 XP par jour", icon: "🏃" },
  { min: 20, label: "Intense", xp: "200 XP par jour", icon: "🚀" },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onLoginExisting,
}) => {
  // Mode: "welcome" | "signup" | "login"
  const [mode, setMode] = useState<"welcome" | "signup" | "login">("welcome");

  // Signup Wizard Step (1 to 4)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedLang, setSelectedLang] = useState<TargetLanguage>("en");
  const [selectedReason, setSelectedReason] = useState<string>("travel");
  const [dailyGoal, setDailyGoal] = useState<number>(10);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  // Login Form State
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Step 5 state (APK Download & mobile app installation during onboarding)
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [apkDownloaded, setApkDownloaded] = useState(false);

  const handleStartSignup = () => {
    playSound("pop");
    setMode("signup");
    setStep(1);
  };

  const handleOpenLogin = () => {
    playSound("pop");
    setMode("login");
    setLoginError("");
  };

  const handleNextStep = () => {
    playSound("pop");
    if (step < 5) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    playSound("pop");
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      setMode("welcome");
    }
  };

  const handleDownloadApkStep = () => {
    playSound("pop");
    downloadApk();
    setApkDownloaded(true);
  };

  const handleFinalizeOnboarding = () => {
    playSound("complete");
    if (pendingProfile) {
      onComplete(pendingProfile);
    }
  };

  const handleFinishSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Veuillez entrer un pseudo ou un prénom.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    if (!password || password.length < 4) {
      setFormError("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    setFormError("");
    playSound("complete");

    const newProfile: UserProfile = {
      id: "user-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      avatar: selectedAvatar.emoji,
      avatarLabel: selectedAvatar.name,
      targetLanguage: selectedLang,
      learningReason: REASON_OPTIONS.find((r) => r.id === selectedReason)?.title || "Général",
      dailyGoalMinutes: dailyGoal,
      joinedDate: new Date().toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    };

    setPendingProfile(newProfile);
    setStep(5);
  };

  // Demo account quick login
  const handleQuickLogin = (preset: {
    name: string;
    email: string;
    lang: TargetLanguage;
    avatar: string;
    avatarLabel: string;
  }) => {
    playSound("complete");
    const existingProfile: UserProfile = {
      id: "user-demo-" + preset.lang,
      name: preset.name,
      email: preset.email,
      avatar: preset.avatar,
      avatarLabel: preset.avatarLabel,
      targetLanguage: preset.lang,
      learningReason: "Culture & Divertissement",
      dailyGoalMinutes: 10,
      joinedDate: "mars 2026",
    };
    onLoginExisting(existingProfile);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError("Veuillez entrer votre adresse e-mail ou pseudo.");
      return;
    }

    if (loginEmail.trim() === "admin") {
      const inputHash = await hashPassword(loginPassword);
      if (inputHash === ADMIN_PASSWORD_HASH) {
        playSound("complete");
        onLoginExisting({
          id: "admin-user",
          name: "Administrateur",
          email: "admin",
          avatar: "🛠️",
          avatarLabel: "Admin",
          targetLanguage: "en",
          learningReason: "Général",
          dailyGoalMinutes: 10,
          joinedDate: "aujourd'hui",
          isAdmin: true,
        });
        return;
      } else {
        playSound("pop");
        setLoginError("Identifiants admin incorrects.");
        return;
      }
    }

    playSound("complete");
    const nameFromEmail = loginEmail.split("@")[0] || "Apprenant";
    const formattedName =
      nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const profile: UserProfile = {
      id: "user-existing-" + Date.now(),
      name: formattedName,
      email: loginEmail.trim(),
      avatar: "🦉",
      avatarLabel: "Hibou Lingo",
      targetLanguage: "en",
      learningReason: "Général",
      dailyGoalMinutes: 10,
      joinedDate: "janvier 2026",
    };

    onLoginExisting(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* 1. WELCOME SCREEN (ACCUEIL DUOLINGO STYLE) */}
      {mode === "welcome" && (
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border-4 border-slate-200 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center max-w-md mx-auto space-y-6">
            {/* Mascot Banner */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-100 border-4 border-emerald-400 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-6xl sm:text-7xl" role="img" aria-label="Mascotte">
                  🦉
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md border-2 border-white">
                Gratuit !
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full uppercase tracking-wider">
                LingoQuest • Apprentissage de Langues
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                La façon gratuite, amusante et efficace d'apprendre une langue !
              </h1>
              <p className="text-slate-500 text-sm sm:text-base">
                Rejoignez des millions d'apprenants, pratiquez l'anglais ou le français en seulement 10 minutes par jour.
              </p>
            </div>

            {/* Main Call To Actions */}
            <div className="w-full space-y-3 pt-4">
              <button
                onClick={handleStartSignup}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base sm:text-lg rounded-2xl border-b-4 border-emerald-700 shadow-lg hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>C'EST PARTI !</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleOpenLogin}
                className="w-full py-4 bg-white hover:bg-slate-50 text-emerald-600 font-black text-base rounded-2xl border-2 border-slate-300 border-b-4 hover:border-slate-400 transition-all cursor-pointer"
              >
                J'AI DÉJÀ UN COMPTE
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("pop");
                  setMode("signup");
                  setStep(5);
                }}
                className="w-full py-3.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-extrabold text-sm rounded-2xl border-2 border-slate-300 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>📥 TÉLÉCHARGER L'APPLICATION / APK ANDROID</span>
              </button>
            </div>

            {/* Quick Feature Perks */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 w-full text-center text-xs text-slate-600 font-bold">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-lg block mb-1">🎮</span>
                100% Ludique
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-lg block mb-1">🔥</span>
                Série & Ligues
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-lg block mb-1">🤖</span>
                IA Intégrée
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SIGNUP WIZARD ("C'EST PARTI !") */}
      {mode === "signup" && (
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          {/* Header Progress Bar */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handlePrevStep}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Étape précédente"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-black uppercase text-slate-400 mb-1">
                <span>Étape {step} sur 5</span>
                <span>{Math.round((step / 5) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
            {step < 5 && (
              <button
                type="button"
                onClick={() => {
                  playSound("pop");
                  setStep(5);
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                title="Télécharger l'application / APK mobile"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Télécharger</span>
              </button>
            )}
          </div>

          {/* STEP 1: CHOICE OF LANGUAGE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="text-4xl inline-block mb-1">🌍</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Qu'aimeriez-vous apprendre ?
                </h2>
                <p className="text-slate-500 text-sm">
                  Choisissez la langue cible pour commencer votre aventure.
                </p>
              </div>

              <div className="space-y-3">
                {LANGUAGE_OPTIONS.map((option) => {
                  const isSelected = selectedLang === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        playSound("pop");
                        setSelectedLang(option.id);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 border-b-4 text-emerald-950 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 border-b-4 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl sm:text-4xl shrink-0">{option.flag}</span>
                        <div>
                          <div className="font-black text-base sm:text-lg flex items-center gap-2">
                            <span>{option.name}</span>
                            {option.id === "es" && (
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-bold">
                            {option.desc}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-bold mt-1">
                            {option.learners}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl border-b-4 border-emerald-700 shadow-md transition-all cursor-pointer"
              >
                CONTINUER
              </button>
            </div>
          )}

          {/* STEP 2: WHY ARE YOU LEARNING? */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="text-4xl inline-block mb-1">🎯</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Pourquoi apprenez-vous cette langue ?
                </h2>
                <p className="text-slate-500 text-sm">
                  Nous adapterons vos exercices et exemples de dialogues.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REASON_OPTIONS.map((reason) => {
                  const isSelected = selectedReason === reason.id;
                  return (
                    <button
                      key={reason.id}
                      onClick={() => {
                        playSound("pop");
                        setSelectedReason(reason.id);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 border-b-4 text-emerald-950 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 border-b-4 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{reason.icon}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div>
                        <div className="font-black text-sm">{reason.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {reason.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl border-b-4 border-emerald-700 shadow-md transition-all cursor-pointer"
              >
                CONTINUER
              </button>
            </div>
          )}

          {/* STEP 3: DAILY GOAL */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="text-4xl inline-block mb-1">⏱️</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Quel est votre objectif quotidien ?
                </h2>
                <p className="text-slate-500 text-sm">
                  Vous pourrez modifier votre objectif à tout moment dans les paramètres.
                </p>
              </div>

              <div className="space-y-3">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = dailyGoal === goal.min;
                  return (
                    <button
                      key={goal.min}
                      onClick={() => {
                        playSound("pop");
                        setDailyGoal(goal.min);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-emerald-500 border-b-4 text-emerald-950 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 border-b-4 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl sm:text-3xl">{goal.icon}</span>
                        <div>
                          <div className="font-black text-base sm:text-lg">
                            {goal.label} : {goal.min} minutes / jour
                          </div>
                          <div className="text-xs font-bold text-slate-400">
                            {goal.xp}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl border-b-4 border-emerald-700 shadow-md transition-all cursor-pointer"
              >
                CONTINUER
              </button>
            </div>
          )}

          {/* STEP 4: CREATE PROFILE */}
          {step === 4 && (
            <form onSubmit={handleFinishSignup} className="space-y-6">
              <div className="text-center space-y-1">
                <span className="text-4xl inline-block mb-1">🎉</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Créez votre profil pour sauvegarder !
                </h2>
                <p className="text-slate-500 text-sm">
                  Choisissez votre avatar et vos informations pour conserver votre progression et vos diamants.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                  1. Choisissez votre avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = selectedAvatar.id === av.id;
                    return (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => {
                          playSound("pop");
                          setSelectedAvatar(av);
                        }}
                        className={`p-2 sm:p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-transform cursor-pointer ${
                          isSelected
                            ? `${av.bg} border-b-4 scale-105 shadow-sm`
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={av.name}
                      >
                        <span className="text-2xl sm:text-3xl">{av.emoji}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-center text-xs font-bold text-slate-500 mt-1">
                  Avatar sélectionné :{" "}
                  <span className="text-emerald-600 font-black">
                    {selectedAvatar.name}
                  </span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                    2. Votre Prénom ou Pseudo
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Alex, Sophie, Thomas..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 font-bold outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                    3. Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex : alex@exemple.fr"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 font-bold outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                    4. Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="4 caractères minimum..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 font-bold outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-extrabold text-center">
                  ⚠️ {formError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl border-b-4 border-emerald-700 shadow-lg transition-all cursor-pointer"
                >
                  CRÉER MON COMPTE ET COMMENCER !
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: DOWNLOAD APK / INSTALL ON PHONE (ONLY DURING ONBOARDING) */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-2">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 border-4 border-white mb-2">
                  <Smartphone className="w-10 h-10 text-white animate-bounce" />
                </div>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full uppercase tracking-wider">
                  Étape finale • Pratiquez sur mobile
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Installez LingoQuest sur votre téléphone !
                </h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Votre compte est créé ! Vous pouvez dès maintenant télécharger le fichier APK pour Android ou l'ajouter à votre écran d'accueil.
                </p>
              </div>

              {/* Direct APK Download Button (Android) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xl border-2 border-slate-700 text-left">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Download className="w-8 h-8 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="font-black text-base text-white">
                        Fichier APK Android (LingoQuest.apk)
                      </h3>
                      <p className="text-xs text-slate-300">
                        Téléchargement direct et rapide pour installation sur Android.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadApkStep}
                  className={`w-full py-3.5 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    apkDownloaded
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {apkDownloaded ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>✓ APK Téléchargé avec succès !</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>📥 Télécharger le fichier APK Android</span>
                    </>
                  )}
                </button>
              </div>

              {/* PWA 1-Click Install Note */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
                <div className="flex items-center gap-2 font-black text-xs uppercase text-emerald-800">
                  <span className="text-base">💡</span>
                  <span>Option : Installation instantanée iOS / Android</span>
                </div>
                <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                  Sur iPhone (Safari) ou Android (Chrome), appuyez sur le menu <span className="font-extrabold bg-white px-1.5 py-0.5 rounded shadow-2xs">Partager / ⋮</span> de votre navigateur et sélectionnez <span className="font-extrabold bg-white px-1.5 py-0.5 rounded shadow-2xs">« Ajouter à l'écran d'accueil »</span>.
                </p>
              </div>

              {/* Continue button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinalizeOnboarding}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl border-b-4 border-emerald-700 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🚀 ACCÉDER À MES COURS MAINTENANT</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. LOGIN MODAL ("J'AI DÉJÀ UN COMPTE") */}
      {mode === "login" && (
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🦉</span>
              <span>Connexion</span>
            </h2>
            <button
              onClick={() => {
                playSound("pop");
                setMode("welcome");
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Adresse e-mail ou pseudo
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="alex@exemple.fr ou Alex"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 font-bold outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 font-bold outline-hidden transition-all"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-extrabold text-center">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-wider rounded-2xl border-b-4 border-emerald-700 shadow-md transition-all cursor-pointer"
            >
              SE CONNECTER
            </button>
          </form>

          {/* QUICK DEMO ACCOUNTS */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <span className="block text-center text-xs font-black uppercase tracking-wider text-slate-400">
              Ou connexion rapide (Comptes de démonstration) :
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin({
                    name: "Sophie L.",
                    email: "sophie.l@lingoquest.fr",
                    lang: "en",
                    avatar: "🦉",
                    avatarLabel: "Hibou Lingo",
                  })
                }
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-400 text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🦉</span>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">
                      Sophie L. • Anglais 🇬🇧
                    </div>
                    <div className="text-xs text-slate-500 font-bold">
                      Ligue Or • 1420 XP • Objectif 10 min
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Tester
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin({
                    name: "Alex W.",
                    email: "alex.w@lingoquest.en",
                    lang: "fr",
                    avatar: "🦊",
                    avatarLabel: "Renard Malin",
                  })
                }
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🦊</span>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">
                      Alex W. • Français 🇫🇷
                    </div>
                    <div className="text-xs text-slate-500 font-bold">
                      English Speaker • 1100 XP • Objectif 15 min
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                  Tester
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin({
                    name: "Lucas M.",
                    email: "lucas.m@lingoquest.fr",
                    lang: "es",
                    avatar: "🦁",
                    avatarLabel: "Lion Vaillant",
                  })
                }
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🦁</span>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">
                      Lucas M. • Espagnol 🇪🇸
                    </div>
                    <div className="text-xs text-slate-500 font-bold">
                      Débutant • 850 XP • Objectif 5 min
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                  Tester
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
