import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper for Gemini client (lazy initialization)
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Grammar Coach endpoint ("DuoCoach - Pourquoi mon erreur ?")
app.post("/api/ai/explain-grammar", async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, learningLanguage, nativeLanguage } = req.body;
    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        explanation:
          nativeLanguage === "fr"
            ? "Oups ! La clé API Gemini n'est pas configurée, mais voici l'astuce : compare attentivement les mots de ta phrase avec la correction officielle !"
            : "Oops! Gemini API key is not configured, but compare the word order and endings carefully with the correct answer!",
        tip:
          nativeLanguage === "fr"
            ? "Astuce : vérifie l'accord du sujet et la place des pronoms."
            : "Tip: Check subject-verb agreement and word order.",
      });
    }

    const prompt = `
Tu es Lingo le Hibou, la mascotte sympathique et encourageante de LingoQuest (une application style Duolingo).
L'élève apprend le ${learningLanguage === "en" ? "Anglais" : "Français"} et sa langue maternelle est le ${nativeLanguage === "fr" ? "Français" : "Anglais"}.
L'exercice était : "${question}"
Sa réponse incorrecte était : "${userAnswer}"
La réponse correcte était : "${correctAnswer}"

Donne une explication courte (2 ou 3 phrases max) et TRÈS claire dans la langue maternelle de l'élève (${nativeLanguage === "fr" ? "en français" : "in English"}) pour expliquer de manière simple et bienveillante pourquoi sa réponse est incorrecte et comment s'en souvenir. Add an encouraging emoji!
Réponds en format JSON strictly:
{
  "explanation": "explication claire ici...",
  "tip": "une astuce mnémotechnique courte ou règle d'or"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    console.error("Error in explain-grammar:", error);
    res.status(500).json({
      explanation:
        req.body.nativeLanguage === "fr"
          ? "Ne t'en fais pas, les erreurs font partie de l'apprentissage ! Répète la phrase correcte à haute voix pour la mémoriser."
          : "Don't worry, mistakes are part of learning! Repeat the correct phrase out loud to memorize it.",
      tip:
        req.body.nativeLanguage === "fr"
          ? "Règle d'or : observe la grammaire de la phrase corrigée."
          : "Golden rule: observe the grammar of the corrected phrase.",
    });
  }
});

// AI Custom Lesson Generator endpoint
app.post("/api/ai/generate-lesson", async (req, res) => {
  try {
    const { topic, learningLanguage, nativeLanguage, difficulty = "débutant" } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      // Fallback custom lesson if no API key
      const isFrToEn = learningLanguage === "en";
      return res.json({
        title: topic || "Leçon personnalisée",
        description: `Entraînement sur : ${topic}`,
        exercises: [
          {
            id: "custom-1",
            type: "word_bank",
            questionPrompt: isFrToEn ? "Traduisez cette phrase en anglais :" : "Translate this sentence into French:",
            sourceText: isFrToEn ? `J'aime apprendre : ${topic}.` : `I love learning about: ${topic}.`,
            correctAnswer: isFrToEn ? `I love learning about ${topic}` : `J'aime apprendre sur ${topic}`,
            words: isFrToEn
              ? ["I", "love", "learning", "about", topic, "hate", "you"]
              : ["J'aime", "apprendre", "sur", topic, "déteste", "nous"],
            hint: isFrToEn ? "I love = J'aime" : "J'aime = I love",
          },
        ],
      });
    }

    const targetLangName = learningLanguage === "en" ? "Anglais" : "Français";
    const nativeLangName = nativeLanguage === "fr" ? "Français" : "Anglais";

    const prompt = `
Tu es un expert pédagogique de Duolingo pour l'application LingoQuest.
Crée une leçon interactive amusante et réaliste de 5 exercices sur le thème : "${topic}".
L'élève apprend le ${targetLangName} à partir du ${nativeLangName} (niveau : ${difficulty}).

Génère un objet JSON strictement formaté comme suit :
{
  "title": "Titre court de la leçon (ex: Commander un café à Paris)",
  "description": "Description en une ligne dans la langue de l'utilisateur",
  "exercises": [
    {
      "id": "ex-1",
      "type": "word_bank",
      "questionPrompt": "Consigne dans la langue maternelle (ex: Traduis cette phrase :)",
      "sourceText": "Phrase à traduire dans la langue maternelle",
      "correctAnswer": "Traduction exacte et naturelle dans la langue cible (${targetLangName})",
      "words": ["mot1", "mot2", "mot3", "mot4", "mot_piège_1", "mot_piège_2"],
      "hint": "Un petit conseil de grammaire ou vocabulaire"
    },
    {
      "id": "ex-2",
      "type": "multiple_choice",
      "questionPrompt": "Consigne dans la langue maternelle (ex: Quel est le mot pour ... ?)",
      "sourceText": "Mot ou courte phrase",
      "correctAnswer": "Bonne réponse dans la langue cible",
      "options": ["Bonne réponse", "Option piège 1", "Option piège 2", "Option piège 3"],
      "hint": "Indice utile"
    },
    {
      "id": "ex-3",
      "type": "listening",
      "questionPrompt": "Écoute attentivement et écris ce que tu entends :",
      "sourceText": "Phrase dans la langue cible à écouter et écrire",
      "correctAnswer": "Phrase dans la langue cible",
      "words": ["mots", "de", "la", "phrase", "plus", "des", "pièges"],
      "hint": "Prononciation naturelle"
    },
    {
      "id": "ex-4",
      "type": "speaking",
      "questionPrompt": "Entraîne ta prononciation en lisant cette phrase à haute voix :",
      "sourceText": "Phrase dans la langue cible (${targetLangName}) à prononcer",
      "correctAnswer": "Traduction dans la langue maternelle",
      "hint": "Parle clairement dans ton micro ou clique pour écouter l'exemple"
    },
    {
      "id": "ex-5",
      "type": "fill_blank",
      "questionPrompt": "Choisis le mot manquant pour compléter la phrase :",
      "sourceText": "Phrase avec ___ à compléter dans la langue cible",
      "correctAnswer": "mot_correct",
      "options": ["mot_correct", "option2", "option3"],
      "hint": "Indice grammatical"
    }
  ]
}
Assure-toi que les 5 exercices sont variés, naturels et parfaitement adaptés au thème "${topic}".
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    console.error("Error generating custom lesson:", error);
    res.status(500).json({ error: "Impossible de générer la leçon pour le moment." });
  }
});

// AI Roleplay Conversation Partner
app.post("/api/ai/roleplay-chat", async (req, res) => {
  try {
    const { messages = [], scenario = "café", learningLanguage = "en", nativeLanguage = "fr" } = req.body;
    const ai = getGenAIClient();
    const targetLangName = learningLanguage === "en" ? "English" : "Français";
    const nativeLangName = nativeLanguage === "fr" ? "Français" : "English";

    if (!ai) {
      return res.json({
        reply:
          learningLanguage === "en"
            ? "Hello! Nice to practice with you. What would you like to order today? (API Key not set - mock reply)"
            : "Bonjour ! Ravi de discuter avec vous. Qu'est-ce qui vous ferait plaisir aujourd'hui ?",
        translation:
          nativeLanguage === "fr"
            ? "Bonjour ! Ravi de discuter avec vous..."
            : "Hello! Nice to practice with you...",
        suggestion:
          learningLanguage === "en"
            ? "Try replying: I would like a coffee, please."
            : "Essayez de répondre : Je voudrais un café, s'il vous plaît.",
      });
    }

    const systemPrompt = `
You are Lingo the Owl, playing a friendly roleplay character in the scenario: "${scenario}".
The user is learning ${targetLangName} (their native language is ${nativeLangName}).
Engage in a fun, natural conversation in ${targetLangName}.
Keep your reply concise (1 to 3 sentences maximum) suitable for a language learner.
Always reply in strictly formatted JSON:
{
  "reply": "Your message in ${targetLangName}",
  "translation": "Translation of your reply in ${nativeLangName}",
  "suggestion": "A helpful phrase suggestion the user can say next in ${targetLangName}"
}
`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    console.error("Error in roleplay chat:", error);
    res.status(500).json({
      reply:
        req.body.learningLanguage === "en"
          ? "Great effort! Let's try another sentence together."
          : "Bravo ! essayons une autre phrase ensemble.",
      translation: "Bravo ! essayons une autre phrase ensemble.",
      suggestion: req.body.learningLanguage === "en" ? "How are you today?" : "Comment allez-vous aujourd'hui ?",
    });
  }
});

// Vite middleware for development or Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `LingoQuest Server running on port ${PORT} (env: ${
        process.env.NODE_ENV || "development"
      })`
    );
  });
}

startServer();
