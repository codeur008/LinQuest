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

// Add passwordHash to existing db if it doesn't exist
try {
  db.exec(`ALTER TABLE users ADD COLUMN passwordHash TEXT;`);
} catch (e) {
  // column already exists
}

export default db;
