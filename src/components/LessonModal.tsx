import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Volume2,
  Volume1,
  Mic,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bot,
  Award,
  Flame,
  HelpCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  Lesson,
  Exercise,
  LearningDirection,
  AIExplanationResponse,
} from "../types";
import { speakText, playSound } from "../utils/audio";

interface LessonModalProps {
  lesson: Lesson;
  direction: LearningDirection;
  hearts: number;
  onLoseHeart: () => void;
  onCompleteLesson: (xpEarned: number, accuracy: number) => void;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  direction,
  hearts,
  onLoseHeart,
  onCompleteLesson,
  onClose,
}) => {
  const isFrToEn = direction === "fr-to-en";
  const targetLang = isFrToEn ? "en" : "fr";
  const nativeLang = isFrToEn ? "fr" : "en";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState<string>("");
  const [speechError, setSpeechError] = useState<string>("");

  // Validation state: "idle" | "correct" | "wrong"
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [isLessonFinished, setIsLessonFinished] = useState(false);

  // AI Explanation state
  const [aiExplanation, setAiExplanation] =
    useState<AIExplanationResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [speechScore, setSpeechScore] = useState<number | null>(null);

  const currentEx = lesson.exercises[currentIndex];

  // Initialize word bank or options when exercise changes
  useEffect(() => {
    if (!currentEx) return;
    setStatus("idle");
    setSelectedWords([]);
    setSelectedOption(null);
    setRecognizedSpeech("");
    setSpeechError("");
    setIsSpeakingActive(false);
    setSpeechScore(null);
    setAiExplanation(null);
    setShowAiModal(false);

    if (currentEx.words) {
      // Shuffle words slightly so order isn't trivial
      const shuffled = [...currentEx.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    } else {
      setAvailableWords([]);
    }

    // Auto-play TTS on listening exercises
    if (currentEx.type === "listening") {
      setTimeout(() => {
        speakText(currentEx.sourceText, targetLang);
      }, 400);
    }
  }, [currentIndex, currentEx, targetLang]);

  // Compute Jaccard word-level similarity between two strings (for pronunciation scoring)
  const getSimilarityScore = (a: string, b: string): number => {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[.,?!;:'"]/g, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const wordsA = normalize(a);
    const wordsB = normalize(b);
    if (wordsA.length === 0 || wordsB.length === 0) return 0;
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  };

  // Handle clicking a word from the bank into the answer box
  const handleSelectWord = (word: string, index: number) => {
    if (status !== "idle") return;
    playSound("pop");
    setSelectedWords([...selectedWords, word]);
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
  };

  // Handle clicking a word in the answer box back into the bank
  const handleRemoveWord = (word: string, index: number) => {
    if (status !== "idle") return;
    playSound("pop");
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  // Handle speaking pronunciation practice (REAL Web Speech Recognition)
  const handleStartSpeaking = () => {
    if (status !== "idle") return;
    playSound("pop");
    setSpeechError("");
    setRecognizedSpeech("");

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError(
        isFrToEn
          ? "Reconnaissance vocale non prise en charge par ce navigateur. Vous pouvez valider directement avec le bouton ci-dessous."
          : "Speech recognition is not supported in this browser. You can manually validate below."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = targetLang === "en" ? "en-US" : "fr-FR";
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.continuous = false;

      setIsSpeakingActive(true);

      recognition.onresult = (event: any) => {
        // Pick the best-matching alternative among all recognition results
        let bestTranscript = "";
        let bestScore = -1;
        const target = currentEx.correctAnswer || currentEx.sourceText;
        for (let i = 0; i < event.results.length; i++) {
          for (let j = 0; j < event.results[i].length; j++) {
            const t = (event.results[i][j].transcript || "").trim();
            const s = getSimilarityScore(t, target);
            if (s > bestScore) {
              bestScore = s;
              bestTranscript = t;
            }
          }
        }
        setRecognizedSpeech(bestTranscript);
        if (event.results[0]?.isFinal && bestTranscript) {
          setSelectedOption(bestTranscript);
          setSpeechScore(Math.round(bestScore * 100));
        }
      };

      recognition.onerror = (event: any) => {
        setIsSpeakingActive(false);
        if (
          event.error === "not-allowed" ||
          event.error === "permission-denied" ||
          event.error === "service-not-allowed"
        ) {
          setSpeechError(
            isFrToEn
              ? "Accès au micro refusé. Veuillez autoriser le micro ou valider manuellement ci-dessous."
              : "Microphone access denied. Please allow microphone or skip speaking below."
          );
        } else {
          setSpeechError(
            isFrToEn
              ? "Nous n'avons pas bien entendu. Réessayez ou validez directement."
              : "Could not hear clearly. Try again or validate below."
          );
        }
      };

      recognition.onend = () => {
        setIsSpeakingActive(false);
      };

      recognition.start();
    } catch (err) {
      setIsSpeakingActive(false);
      setSpeechError(
        isFrToEn
          ? "Erreur d'initialisation du micro. Vous pouvez valider directement ci-dessous."
          : "Microphone error. You can manually validate below."
      );
    }
  };

  // Check the answer!
  const handleCheckAnswer = () => {
    if (status !== "idle") {
      // If already checked, move to next
      handleNextExercise();
      return;
    }

    let userAnswer = "";
    if (currentEx.type === "word_bank" || currentEx.type === "listening") {
      userAnswer = selectedWords.join(" ");
    } else if (currentEx.type === "multiple_choice" || currentEx.type === "fill_blank") {
      userAnswer = selectedOption || "";
    } else if (currentEx.type === "speaking") {
      userAnswer = selectedOption || "";
    }

    // Compare case-insensitive & trim punctuation/spaces
    const cleanUser = userAnswer
      .trim()
      .toLowerCase()
      .replace(/[.,?!]/g, "");
    const cleanCorrect = currentEx.correctAnswer
      .trim()
      .toLowerCase()
      .replace(/[.,?!]/g, "");

    // Speaking: require ≥60% Jaccard word-overlap similarity (real pronunciation check)
    const SPEAKING_PASS_THRESHOLD = 0.6;
    const isCorrect =
      cleanUser === cleanCorrect ||
      (currentEx.type === "speaking" &&
        userAnswer.length > 0 &&
        getSimilarityScore(cleanUser, cleanCorrect) >= SPEAKING_PASS_THRESHOLD);

    if (isCorrect) {
      setStatus("correct");
      setCorrectCount((prev) => prev + 1);
      playSound("correct");
      // Read correct answer out loud!
      speakText(currentEx.correctAnswer, targetLang);
    } else {
      setStatus("wrong");
      playSound("wrong");
      onLoseHeart();
    }
  };

  const handleNextExercise = () => {
    playSound("pop");
    if (currentIndex + 1 < lesson.exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Lesson finished! Celebrate!
      setIsLessonFinished(true);
      playSound("complete");
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if confetti blocked
      }
    }
  };

  // Ask AI DuoCoach why the answer was wrong!
  const handleAskAI = async () => {
    playSound("pop");
    setShowAiModal(true);
    if (aiExplanation) return; // already fetched

    setIsAiLoading(true);
    try {
      let userAnswer = "";
      if (currentEx.type === "word_bank" || currentEx.type === "listening") {
        userAnswer = selectedWords.join(" ");
      } else {
        userAnswer = selectedOption || "(aucune réponse)";
      }

      const res = await fetch("/api/ai/explain-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentEx.sourceText,
          userAnswer: userAnswer,
          correctAnswer: currentEx.correctAnswer,
          learningLanguage: targetLang,
          nativeLanguage: nativeLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data);
      } else {
        setAiExplanation({
          explanation:
            isFrToEn
              ? "Astuce : vérifiez bien l'ordre des mots en anglais et l'accord du verbe."
              : "Tip: Check the French word order and verb endings carefully.",
        });
      }
    } catch (err) {
      setAiExplanation({
        explanation:
          isFrToEn
            ? "Erreur de connexion IA, mais gardez en tête : en anglais, l'adjectif se place toujours AVANT le nom !"
            : "Connection error, but remember: in French, adjectives often come AFTER the noun!",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const isCheckDisabled = () => {
    if (status !== "idle") return false;
    if (currentEx.type === "word_bank" || currentEx.type === "listening") {
      return selectedWords.length === 0;
    }
    if (currentEx.type === "multiple_choice" || currentEx.type === "fill_blank") {
      return !selectedOption;
    }
    if (currentEx.type === "speaking") {
      return !selectedOption;
    }
    return false;
  };

  const totalEx = lesson.exercises.length;
  const progressPercent = Math.round((currentIndex / totalEx) * 100);
  const accuracyPercent =
    totalEx > 0 ? Math.round((correctCount / totalEx) * 100) : 100;
  const earnedXp = lesson.xpReward + (accuracyPercent === 100 ? 5 : 0);

  // ----------------------------------------------------------------------
  // REWARD / FINISHED SCREEN
  // ----------------------------------------------------------------------
  if (isLessonFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-8 text-center space-y-8 shadow-2xl border-4 border-emerald-500 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-emerald-300">
              🦉
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {isFrToEn ? "Leçon terminée !" : "Lesson Completed!"}
            </h2>
            <p className="text-slate-600 font-medium">
              {isFrToEn
                ? "Excellent travail ! Vous progressez vers le bilinguisme."
                : "Great job! You're making progress every day."}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold uppercase text-amber-600">
                XP TOTAL
              </span>
              <div className="text-2xl font-black text-amber-700 flex items-center justify-center gap-1 mt-1">
                <Award className="w-6 h-6 fill-amber-500 text-amber-500" />
                <span>+{earnedXp}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold uppercase text-emerald-600">
                {isFrToEn ? "PRÉCISION" : "ACCURACY"}
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {accuracyPercent}%
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold uppercase text-orange-600">
                {isFrToEn ? "SÉRIE" : "STREAK"}
              </span>
              <div className="text-2xl font-black text-orange-700 flex items-center justify-center gap-1 mt-1">
                <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
                <span>+1</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playSound("pop");
              onCompleteLesson(earnedXp, accuracyPercent);
            }}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 text-white font-black text-lg uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            {isFrToEn ? "CONTINUER LE PARCOURS" : "CONTINUE"}
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // MAIN LESSON VIEW
  // ----------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* 1. Header Bar: X Close, Progress Bar, Hearts */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-4 flex items-center gap-4">
        <button
          onClick={() => {
            playSound("pop");
            onClose();
          }}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title={isFrToEn ? "Quitter la leçon" : "Quit lesson"}
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-slate-200 h-4 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1.5 font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
          <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
          <span className="text-lg">{hearts}</span>
        </div>
      </div>

      {/* 2. Exercise Area */}
      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-center space-y-8">
        {/* Instruction Header + Mascot */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-4xl shrink-0 shadow-sm">
            🦉
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              {currentEx.questionPrompt}
            </h2>
            {currentEx.hint && (
              <p className="text-xs font-semibold text-slate-500">
                💡 {currentEx.hint}
              </p>
            )}
          </div>
        </div>

        {/* --- EXERCISE TYPE: word_bank --- */}
        {currentEx.type === "word_bank" && (
          <div className="space-y-6">
            {/* Source text with TTS speaker */}
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
              <button
                onClick={() => speakText(currentEx.sourceText, isFrToEn ? "fr" : "en")}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Écouter la phrase"
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <span className="text-xl font-bold text-slate-800">
                {currentEx.sourceText}
              </span>
            </div>

            {/* Answer drop area */}
            <div className="min-h-[72px] p-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-slate-400 text-sm italic ml-2">
                  {isFrToEn
                    ? "Appuyez sur les mots ci-dessous pour former la traduction"
                    : "Tap words below to build translation"}
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handleRemoveWord(word, idx)}
                    className="px-4 py-2 bg-white hover:bg-rose-50 border-b-4 border-slate-300 hover:border-rose-300 rounded-xl font-extrabold text-slate-700 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word bank pool */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {availableWords.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  onClick={() => handleSelectWord(word, idx)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-b-4 border-slate-300 rounded-xl font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs text-base"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- EXERCISE TYPE: multiple_choice --- */}
        {currentEx.type === "multiple_choice" && (
          <div className="space-y-6">
            <div className="text-2xl font-black text-slate-800 text-center bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
              « {currentEx.sourceText} »
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentEx.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (status !== "idle") return;
                      playSound("pop");
                      setSelectedOption(opt);
                    }}
                    className={`p-5 rounded-2xl border-2 border-b-4 text-left font-extrabold text-lg transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- EXERCISE TYPE: listening --- */}
        {currentEx.type === "listening" && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={() => {
                  playSound("pop");
                  speakText(currentEx.sourceText, targetLang, false);
                }}
                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg border-b-4 border-emerald-700 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                title="Écouter à vitesse normale"
              >
                <Volume2 className="w-10 h-10" />
              </button>

              <button
                onClick={() => {
                  playSound("pop");
                  speakText(currentEx.sourceText, targetLang, true);
                }}
                className="w-14 h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md border-b-4 border-sky-700 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                title="Écouter en mode lent (Tortue)"
              >
                <span className="text-2xl" role="img" aria-label="Tortue">
                  🐢
                </span>
              </button>
            </div>

            {/* Answer drop area */}
            <div className="min-h-[72px] p-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-slate-400 text-sm italic ml-2">
                  {isFrToEn
                    ? "Appuyez sur les mots ci-dessous dans l'ordre entendu"
                    : "Tap words in the order you hear them"}
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => handleRemoveWord(word, idx)}
                    className="px-4 py-2 bg-white hover:bg-rose-50 border-b-4 border-slate-300 rounded-xl font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word bank pool */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {availableWords.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  onClick={() => handleSelectWord(word, idx)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-b-4 border-slate-300 rounded-xl font-extrabold text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- EXERCISE TYPE: speaking --- */}
        {currentEx.type === "speaking" && (
          <div className="space-y-6 text-center">
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                {isFrToEn ? "À lire à haute voix :" : "Speak this sentence aloud:"}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-800">
                {currentEx.sourceText}
              </div>
              <button
                onClick={() => speakText(currentEx.sourceText, targetLang)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isFrToEn ? "Écouter l'exemple" : "Listen to example"}</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleStartSpeaking}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-lg ${
                  isSpeakingActive
                    ? "bg-rose-500 animate-pulse scale-110 ring-8 ring-rose-200"
                    : "bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700"
                }`}
                title="Parler dans le micro"
              >
                <Mic className="w-10 h-10" />
              </button>

              <span className="text-sm font-bold text-slate-600">
                {isSpeakingActive
                  ? isFrToEn
                    ? "En écoute... Parlez maintenant !"
                    : "Listening... Speak now!"
                  : selectedOption
                  ? isFrToEn
                    ? "✨ Prononciation enregistrée !"
                    : "✨ Pronunciation recorded!"
                  : isFrToEn
                  ? "Appuyez sur le micro et prononcez la phrase"
                  : "Tap the mic and speak"}
              </span>

              {/* Display live speech transcript */}
              {recognizedSpeech && (
                <div className="mt-2 px-4 py-2.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-emerald-900 font-extrabold text-sm flex items-center gap-2 shadow-xs">
                  <span className="text-emerald-600">🎤️</span>
                  <span>« {recognizedSpeech} »</span>
                </div>
              )}

              {/* Pronunciation similarity score badge */}
              {speechScore !== null && (
                <div
                  className={`mt-1 px-4 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2 border-2 ${
                    speechScore >= 80
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : speechScore >= 60
                      ? "bg-amber-50 border-amber-400 text-amber-800"
                      : "bg-rose-50 border-rose-400 text-rose-800"
                  }`}
                >
                  <span>
                    {speechScore >= 80 ? "🎯" : speechScore >= 60 ? "⚠️" : "❌"}
                  </span>
                  <span>
                    {speechScore}% —{" "}
                    {speechScore >= 80
                      ? isFrToEn
                        ? "Excellent ! Cliquez VÉRIFIER"
                        : "Excellent! Tap CHECK"
                      : speechScore >= 60
                      ? isFrToEn
                        ? "Bien ! Cliquez VÉRIFIER ou réessayez pour mieux"
                        : "Good! Tap CHECK or retry for better"
                      : isFrToEn
                      ? "Non reconnu — Réessayez !"
                      : "Not recognized — Try again!"}
                  </span>
                </div>
              )}

              {/* Display speech recognition error / permissions message */}
              {speechError && (
                <div className="mt-2 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-900 text-xs font-bold max-w-sm text-center">
                  <p>{speechError}</p>
                </div>
              )}

              {/* Retry button: only before validation, when score < 80% */}
              {status === "idle" &&
                selectedOption &&
                speechScore !== null &&
                speechScore < 80 && (
                  <button
                    onClick={() => {
                      playSound("pop");
                      setSelectedOption(null);
                      setSpeechScore(null);
                      setRecognizedSpeech("");
                      setSpeechError("");
                    }}
                    className="text-xs font-black text-amber-600 underline hover:text-amber-800 mt-1 cursor-pointer"
                  >
                    {isFrToEn
                      ? "🔁 Réessayer la prononciation"
                      : "🔁 Retry pronunciation"}
                  </button>
                )}

              {/* Skip speaking: no penalty, not counted as correct or incorrect */}
              <button
                onClick={() => {
                  playSound("pop");
                  handleNextExercise();
                }}
                className="text-xs font-bold text-slate-400 underline hover:text-slate-600 mt-2 cursor-pointer"
              >
                {isFrToEn
                  ? "Pas de micro ? Passer cet exercice"
                  : "No microphone? Skip this exercise"}
              </button>
            </div>
          </div>
        )}

        {/* --- EXERCISE TYPE: fill_blank --- */}
        {currentEx.type === "fill_blank" && (
          <div className="space-y-6">
            <div className="text-2xl font-black text-slate-800 text-center bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
              {currentEx.sourceText.split("___").map((part, idx, arr) => (
                <React.Fragment key={idx}>
                  <span>{part}</span>
                  {idx < arr.length - 1 && (
                    <span className="inline-block px-4 py-1 mx-2 bg-amber-100 border-b-4 border-amber-400 text-amber-800 rounded-xl font-black">
                      {selectedOption || "___"}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {currentEx.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (status !== "idle") return;
                      playSound("pop");
                      setSelectedOption(opt);
                    }}
                    className={`px-6 py-3 rounded-2xl border-2 border-b-4 font-extrabold text-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-100 border-amber-500 text-amber-800 scale-105"
                        : "bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Check / Validation Bar */}
      <div
        className={`border-t-2 py-4 px-4 sm:px-6 transition-colors duration-300 ${
          status === "correct"
            ? "bg-emerald-100 border-emerald-300"
            : status === "wrong"
            ? "bg-rose-100 border-rose-300"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Message */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {status === "correct" && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-800">
                    {isFrToEn ? "Excellent !" : "Correct!"}
                  </h3>
                  <p className="text-xs font-bold text-emerald-700">
                    +10 XP • {isFrToEn ? "Belle maîtrise" : "Great job!"}
                  </p>
                </div>
              </div>
            )}

            {status === "wrong" && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-rose-800">
                    {isFrToEn ? "Réponse correcte :" : "Correct solution:"}
                  </h3>
                  <p className="text-sm font-bold text-rose-900">
                    {currentEx.correctAnswer}
                  </p>
                  <button
                    onClick={handleAskAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 hover:bg-white rounded-lg text-xs font-black text-purple-700 border border-purple-300 shadow-xs cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>
                      {isFrToEn
                        ? "🤖 Pourquoi ? (DuoCoach IA)"
                        : "🤖 Why? (AI Coach)"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {status === "idle" && (
              <div className="hidden sm:block text-xs font-bold text-slate-400">
                {isFrToEn
                  ? "Astuce : vérifiez avant de valider"
                  : "Tip: double-check before submitting"}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleCheckAnswer}
            disabled={isCheckDisabled()}
            className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all cursor-pointer shadow-md ${
              isCheckDisabled()
                ? "bg-slate-200 border-b-4 border-slate-300 text-slate-400 cursor-not-allowed"
                : status === "correct"
                ? "bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 text-white"
                : status === "wrong"
                ? "bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 text-white"
            }`}
          >
            {status === "idle"
              ? isFrToEn
                ? "VÉRIFIER"
                : "CHECK"
              : isFrToEn
              ? "CONTINUER"
              : "CONTINUE"}
          </button>
        </div>
      </div>

      {/* 4. AI DuoCoach Explanation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🤖🦉</span>
                <h3 className="text-xl font-black text-purple-900">
                  {isFrToEn ? "DuoCoach IA" : "AI DuoCoach"}
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAiLoading ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-600">
                  {isFrToEn
                    ? "Lingo analyse votre réponse..."
                    : "Lingo is analyzing your answer..."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-2">
                  <p className="text-slate-800 text-sm font-medium leading-relaxed">
                    {aiExplanation?.explanation}
                  </p>
                  {aiExplanation?.tip && (
                    <div className="text-xs font-bold text-purple-700 bg-purple-100/60 p-2.5 rounded-xl">
                      💡 {aiExplanation.tip}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowAiModal(false)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl border-b-4 border-purple-800 cursor-pointer transition-colors"
                >
                  {isFrToEn ? "COMPRIS, MERCI !" : "GOT IT, THANKS!"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
