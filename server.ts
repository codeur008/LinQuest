import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "lingoquest-super-secret-key-2026";

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: "Forbidden: Admin only" });
  next();
};

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

// Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, avatar, avatarLabel, targetLanguage, learningReason, dailyGoalMinutes } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const id = "usr_" + Math.random().toString(36).substr(2, 9);
    const passwordHash = await bcrypt.hash(password, 10);
    const isAdmin = email.toLowerCase() === "admin" ? 1 : 0;
    const joinedDate = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, avatar, avatarLabel, targetLanguage, learningReason, dailyGoalMinutes, joinedDate, isAdmin)
      VALUES (@id, @name, @email, @passwordHash, @avatar, @avatarLabel, @targetLanguage, @learningReason, @dailyGoalMinutes, @joinedDate, @isAdmin)
    `);

    insertUser.run({
      id, name, email, passwordHash,
      avatar: avatar || '👤',
      avatarLabel: avatarLabel || 'Explorer',
      targetLanguage: targetLanguage || 'en',
      learningReason: learningReason || '',
      dailyGoalMinutes: dailyGoalMinutes || 10,
      joinedDate,
      isAdmin
    });
    
    // Create initial stats
    db.prepare(`INSERT INTO stats (userId) VALUES (?)`).run(id);

    const token = jwt.sign({ id, email, isAdmin: isAdmin === 1 }, JWT_SECRET, { expiresIn: '7d' });
    
    const profile = { id, name, email, avatar, avatarLabel, targetLanguage, learningReason, dailyGoalMinutes, joinedDate, isAdmin: isAdmin === 1 };
    res.json({ token, profile, stats: { xp: 0, streak: 0, gems: 0, completedNodes: [] } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare("SELECT u.*, s.xp, s.streak, s.gems, s.completedNodes FROM users u LEFT JOIN stats s ON u.id = s.userId WHERE u.email = ?").get(email) as any;
    
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (user.status === 'banned') return res.status(403).json({ error: "Account banned" });

    const validPassword = await bcrypt.compare(password, user.passwordHash || "");
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin === 1 }, JWT_SECRET, { expiresIn: '7d' });
    
    const profile = { 
      id: user.id, name: user.name, email: user.email, avatar: user.avatar, avatarLabel: user.avatarLabel, 
      targetLanguage: user.targetLanguage, learningReason: user.learningReason, dailyGoalMinutes: user.dailyGoalMinutes, 
      joinedDate: user.joinedDate, isAdmin: user.isAdmin === 1 
    };
    
    const stats = {
      xp: user.xp || 0, streak: user.streak || 0, gems: user.gems || 0,
      completedNodes: user.completedNodes ? JSON.parse(user.completedNodes) : []
    };

    res.json({ token, profile, stats });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected Profile Sync
app.post("/api/users/sync", authenticateToken, (req: any, res: any) => {
  try {
    const { profile, stats } = req.body;
    if (req.user.id !== profile.id) return res.status(403).json({ error: "Forbidden" });

    // Update stats only (Profile is usually updated via other endpoints in a real app)
    if (stats) {
      const insertStats = db.prepare(`
        INSERT OR REPLACE INTO stats (userId, xp, streak, gems, completedNodes)
        VALUES (@userId, @xp, @streak, @gems, @completedNodes)
      `);
      insertStats.run({
        userId: profile.id,
        xp: stats.xp || 0,
        streak: stats.streak || 0,
        gems: stats.gems || 0,
        completedNodes: JSON.stringify(stats.completedNodes || [])
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error syncing user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin Routes Protected
app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*, s.xp, s.streak, s.gems, s.completedNodes
      FROM users u
      LEFT JOIN stats s ON u.id = s.userId
    `).all();
    
    // Format JSON
    const formatted = users.map((u: any) => ({
      ...u,
      isAdmin: u.isAdmin === 1,
      completedNodes: u.completedNodes ? JSON.parse(u.completedNodes) : []
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/users/:id/toggle-ban", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare("SELECT status FROM users WHERE id = ?").get(id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(newStatus, id);
    
    res.json({ success: true, newStatus });
  } catch (err) {
    console.error("Error toggling ban:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
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
