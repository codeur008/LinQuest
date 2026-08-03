import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Wand2,
  MessageSquare,
  Volume2,
  Send,
  Loader2,
  Coffee,
  Plane,
  Briefcase,
  Users,
  Play,
  HelpCircle,
  Mic,
  MicOff,
} from "lucide-react";
import { LearningDirection, Lesson, RoleplayMessage } from "../types";
import { speakText, playSound } from "../utils/audio";

interface AIPracticeViewProps {
  direction: LearningDirection;
  onStartLesson: (lesson: Lesson) => void;
}

export const AIPracticeView: React.FC<AIPracticeViewProps> = ({
  direction,
  onStartLesson,
}) => {
  const isFrToEn = direction === "fr-to-en";
  const targetLang = isFrToEn ? "en" : "fr";
  const nativeLang = isFrToEn ? "fr" : "en";

  const [activeTab, setActiveTab] = useState<"generator" | "roleplay">("generator");

  // Custom Lesson Generator State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"débutant" | "intermédiaire" | "avancé">("débutant");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Roleplay Chat State
  const [scenario, setScenario] = useState("Au café parisien");
  const [messages, setMessages] = useState<RoleplayMessage[]>([
    {
      id: "init-1",
      sender: "model",
      text: isFrToEn
        ? "Hello! Welcome to the café. What would you like to order today?"
        : "Bonjour ! Bienvenue au café. Qu'est-ce qui vous ferait plaisir aujourd'hui ?",
      translation: isFrToEn
        ? "Bonjour ! Bienvenue au café. Que souhaitez-vous commander aujourd'hui ?"
        : "Hello! Welcome to the café. What would you like to order today?",
      suggestion: isFrToEn
        ? "I would like a coffee with milk, please."
        : "Je voudrais un café au lait, s'il vous plaît.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice input handler for roleplay chat
  const handleVoiceInput = () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = targetLang === "en" ? "en-US" : "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsVoiceInput(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setInputMessage(transcript);
      setIsVoiceInput(false);
    };

    recognition.onerror = () => setIsVoiceInput(false);
    recognition.onend = () => setIsVoiceInput(false);

    recognition.start();
  };

  // Handle generating a custom Duolingo lesson via Gemini
  const handleGenerateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    playSound("pop");
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/ai/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          learningLanguage: targetLang,
          nativeLanguage: nativeLang,
          difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await res.json();
      if (data && data.exercises && data.exercises.length > 0) {
        const customLesson: Lesson = {
          id: `custom-${Date.now()}`,
          title: data.title || topic,
          description: data.description || `Leçon sur : ${topic}`,
          xpReward: 30,
          exercises: data.exercises,
        };
        onStartLesson(customLesson);
      } else {
        setGenerateError(
          isFrToEn
            ? "Impossible de générer la leçon pour ce sujet. Essayez un autre mot !"
            : "Could not generate lesson for this topic. Try another keyword!"
        );
      }
    } catch (err) {
      setGenerateError(
        isFrToEn
          ? "Erreur de connexion. Veuillez réessayer !"
          : "Connection error. Please try again!"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle sending a message in Roleplay Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;
    playSound("pop");

    const userMsg: RoleplayMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputMessage.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/roleplay-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          scenario,
          learningLanguage: targetLang,
          nativeLanguage: nativeLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: RoleplayMessage = {
          id: `model-${Date.now()}`,
          sender: "model",
          text: data.reply || "Super !",
          translation: data.translation,
          suggestion: data.suggestion,
        };
        setMessages((prev) => [...prev, modelMsg]);
        speakText(modelMsg.text, targetLang);
      }
    } catch (err) {
      // fallback
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* AI Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFrToEn ? "DuoCoach IA" : "AI DuoCoach"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {isFrToEn
              ? "Leçons & Conversations IA"
              : "AI Lessons & Roleplay Chat"}
          </h1>
          <p className="text-purple-100 text-sm max-w-lg">
            {isFrToEn
              ? "Générez des leçons sur mesure sur N'IMPORTE QUEL sujet ou pratiquez des conversations réelles avec Lingo le Hibou !"
              : "Generate custom lessons on ANY topic or practice real-life conversations with Lingo the Owl!"}
          </p>
        </div>
        <div className="text-6xl shrink-0">🤖🦉</div>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b-2 border-slate-200">
        <button
          onClick={() => {
            playSound("pop");
            setActiveTab("generator");
          }}
          className={`flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-wide border-b-4 -mb-[2px] transition-all cursor-pointer ${
            activeTab === "generator"
              ? "border-purple-600 text-purple-700 bg-purple-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>{isFrToEn ? "Générateur de Leçon" : "Lesson Generator"}</span>
        </button>

        <button
          onClick={() => {
            playSound("pop");
            setActiveTab("roleplay");
          }}
          className={`flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-wide border-b-4 -mb-[2px] transition-all cursor-pointer ${
            activeTab === "roleplay"
              ? "border-purple-600 text-purple-700 bg-purple-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>
            {isFrToEn ? "Conversation avec Lingo" : "Roleplay Chat"}
          </span>
        </button>
      </div>

      {/* TAB 1: GENERATOR */}
      {activeTab === "generator" && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800">
              {isFrToEn
                ? "Sur quel sujet voulez-vous vous entraîner ?"
                : "What topic do you want to practice?"}
            </h2>
            <p className="text-sm text-slate-500">
              {isFrToEn
                ? "L'IA va créer une leçon Duolingo complète de 5 exercices sur mesure !"
                : "The AI will build a complete 5-exercise Duolingo lesson tailored for you!"}
            </p>
          </div>

          {/* Quick topic pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">
              {isFrToEn ? "Sujets populaires :" : "Popular topics:"}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                isFrToEn ? "Commander au restaurant" : "Ordering at a café",
                isFrToEn ? "Entretien d'embauche" : "Job interview",
                isFrToEn ? "Voyager dans le métro" : "Riding the subway",
                isFrToEn ? "Parler de football" : "Talking about football",
                isFrToEn ? "À la boulangerie" : "At the bakery",
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    playSound("pop");
                    setTopic(example);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateLesson} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {isFrToEn
                  ? "Votre sujet ou situation :"
                  : "Your topic or scenario:"}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  isFrToEn
                    ? "Ex: Acheter un billet de train, faire ses courses, parler météo..."
                    : "Ex: Buying a train ticket, shopping, talking about weather..."
                }
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-purple-500 focus:outline-none font-bold text-slate-800 text-base"
                required
              />
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {isFrToEn ? "Niveau de difficulté :" : "Difficulty Level:"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["débutant", "intermédiaire", "avancé"] as const).map(
                  (lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-3 rounded-xl font-extrabold text-sm capitalize border-2 border-b-4 transition-all cursor-pointer ${
                        difficulty === lvl
                          ? "bg-purple-100 border-purple-600 text-purple-900"
                          : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {lvl}
                    </button>
                  )
                )}
              </div>
            </div>

            {generateError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-bold text-rose-700">
                {generateError}
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                isGenerating || !topic.trim()
                  ? "bg-slate-300 border-b-4 border-slate-400 text-white cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800 text-white"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {isFrToEn
                      ? "Génération en cours..."
                      : "Generating lesson..."}
                  </span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>
                    {isFrToEn
                      ? "GÉNÉRER ET COMMENCER"
                      : "GENERATE & START LESSON"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: ROLEPLAY CHAT */}
      {activeTab === "roleplay" && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-8 flex flex-col h-[75vh] sm:h-auto shadow-sm">
          {/* Scenario Picker */}
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-slate-200 shrink-0">
            <span className="text-xs font-bold uppercase text-slate-400 mr-2 w-full sm:w-auto">
              {isFrToEn ? "Scénario :" : "Scenario:"}
            </span>
            {[
              { label: isFrToEn ? "Au café" : "At the Café", icon: Coffee },
              { label: isFrToEn ? "À l'aéroport" : "At the Airport", icon: Plane },
              { label: isFrToEn ? "Entretien" : "Interview", icon: Briefcase },
              { label: isFrToEn ? "Nouvel ami" : "New Friend", icon: Users },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  playSound("pop");
                  setScenario(s.label);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scenario === s.label
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 flex-1 overflow-y-auto p-2 min-h-0 mb-3">
            {messages.map((m) => {
              const isModel = m.sender === "model";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 sm:gap-3 ${
                    isModel ? "justify-start" : "justify-end"
                  }`}
                >
                  {isModel && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-lg sm:text-xl shrink-0">
                      🦉
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-md p-3 sm:p-4 rounded-2xl space-y-2 ${
                      isModel
                        ? "bg-purple-50 border border-purple-200 text-slate-800"
                        : "bg-emerald-500 text-white rounded-br-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <p className="font-bold text-sm sm:text-base">{m.text}</p>
                      {isModel && (
                        <button
                          onClick={() => speakText(m.text, targetLang)}
                          className="p-1 sm:p-1.5 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded-lg shrink-0 cursor-pointer"
                          title="Écouter la prononciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {isModel && m.translation && (
                      <p className="text-xs text-slate-500 italic border-t border-purple-200 pt-1.5">
                        {m.translation}
                      </p>
                    )}

                    {isModel && m.suggestion && (
                      <div className="bg-white/80 p-2 rounded-xl text-[11px] sm:text-xs font-bold text-purple-700 mt-2">
                        💡 Suggestion : « {m.suggestion} »
                        <button
                          onClick={() => setInputMessage(m.suggestion!)}
                          className="ml-2 text-purple-900 underline hover:no-underline cursor-pointer block sm:inline mt-1 sm:mt-0"
                        >
                          {isFrToEn ? "Utiliser" : "Use this"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isFrToEn ? "Lingo réfléchit..." : "Lingo is typing..."}
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isVoiceInput
                  ? isFrToEn
                    ? "🎤️ Écoute..."
                    : "🎤️ Listening..."
                  : isFrToEn
                  ? "Votre réponse..."
                  : "Your answer..."
              }
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border-2 border-slate-300 focus:border-purple-500 focus:outline-none font-bold text-slate-800 text-sm sm:text-base min-w-0"
              readOnly={isVoiceInput}
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isVoiceInput}
              title={isFrToEn ? "Parler" : "Speak"}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-black transition-all cursor-pointer flex items-center justify-center border-2 border-b-4 shrink-0 ${
                isVoiceInput
                  ? "bg-rose-100 border-rose-400 text-rose-700 animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
              }`}
            >
              {isVoiceInput ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isChatLoading}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
