import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'lingoquest.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT,
    avatar TEXT,
    avatarLabel TEXT,
    targetLanguage TEXT,
    learningReason TEXT,
    dailyGoalMinutes INTEGER,
    joinedDate TEXT,
    isAdmin BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS stats (
    userId TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 0,
    completedNodes TEXT DEFAULT '[]',
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

import bcrypt from 'bcryptjs';

// Add passwordHash to existing db if it doesn't exist
try {
  db.exec(`ALTER TABLE users ADD COLUMN passwordHash TEXT;`);
} catch (e) {
  // column already exists
}

// Seed admin and demo users if they don't exist
const seedUsers = async () => {
  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin'").get();
  if (!adminExists) {
    const adminHash = await bcrypt.hash('lingoquest', 10);
    db.prepare(`INSERT INTO users (id, name, email, passwordHash, avatar, avatarLabel, targetLanguage, learningReason, dailyGoalMinutes, joinedDate, isAdmin) 
                VALUES ('admin', 'Administrateur', 'admin', ?, '🛠️', 'Admin', 'en', 'Général', 10, 'aujourdhui', 1)`).run(adminHash);
    db.prepare(`INSERT INTO stats (userId) VALUES ('admin')`).run();
  }

  const demoAccounts = [
    { email: 'sophie.l@lingoquest.fr', name: 'Sophie L.', lang: 'en', avatar: '🦉', label: 'Hibou Lingo' },
    { email: 'alex.w@lingoquest.en', name: 'Alex W.', lang: 'fr', avatar: '🦊', label: 'Renard Malin' },
    { email: 'lucas.m@lingoquest.fr', name: 'Lucas M.', lang: 'es', avatar: '🦁', label: 'Lion Vaillant' }
  ];

  for (const demo of demoAccounts) {
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(demo.email);
    if (!exists) {
      const demoHash = await bcrypt.hash('password123', 10);
      const id = 'demo_' + Math.random().toString(36).substr(2, 9);
      db.prepare(`INSERT INTO users (id, name, email, passwordHash, avatar, avatarLabel, targetLanguage, learningReason, dailyGoalMinutes, joinedDate, isAdmin) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'Culture', 10, 'aujourdhui', 0)`).run(
        id, demo.name, demo.email, demoHash, demo.avatar, demo.label, demo.lang
      );
      db.prepare(`INSERT INTO stats (userId) VALUES (?)`).run(id);
    }
  }
};

seedUsers().catch(console.error);

export default db;
