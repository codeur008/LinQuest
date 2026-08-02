/**
 * Learning direction:
 * "fr-to-en": French speaker learning English (Je parle Français -> J'apprends l'Anglais)
 * "en-to-fr": English speaker learning French (I speak English -> I am learning French)
 */
export type TargetLanguage = "en" | "fr" | "es";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string; // Emoji character or id
  avatarLabel?: string;
  targetLanguage: TargetLanguage; // The language user chose to learn
  learningReason: string;
  dailyGoalMinutes: number;
  joinedDate: string;
  isGuest?: boolean;
}

export type LearningDirection = "fr-to-en" | "en-to-fr";

export type ExerciseType =
  | "word_bank"
  | "multiple_choice"
  | "listening"
  | "speaking"
  | "fill_blank";

export interface Exercise {
  id: string;
  type: ExerciseType;
  questionPrompt: string; // The instruction for the user
  sourceText: string; // Text to translate or listen to
  correctAnswer: string;
  words?: string[]; // Word tiles for word_bank / listening
  options?: string[]; // Multiple choice / fill in blank options
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  exercises: Exercise[];
  completed?: boolean;
}

export type NodeStatus = "locked" | "current" | "completed";

export interface LessonNode {
  id: string;
  unitId: string;
  title: string;
  status: NodeStatus;
  stars: number; // 0 to 3
  lessonData: Lesson;
  type?: "lesson" | "chest" | "trophy" | "story";
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  description: string;
  themeColor: "green" | "blue" | "purple" | "orange" | "pink" | "red";
  iconName: string;
  nodes: LessonNode[];
}

export interface UserStats {
  xp: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  gems: number;
  league: "Bronze" | "Argent" | "Or" | "Diamant";
  completedNodes: string[]; // List of completed node IDs
  lastPlayedDate: string;
  activeCostume: string; // default, beret, sherlock, superlingo, wizard
  unlockedCostumes: string[];
}

export interface LeagueLearner {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isUser?: boolean;
  countryFlag?: string;
}

export interface DailyQuest {
  id: string;
  titleFr: string;
  titleEn: string;
  current: number;
  target: number;
  rewardGems: number;
  completed: boolean;
}

export interface AIExplanationResponse {
  explanation: string;
  tip?: string;
}

export interface RoleplayMessage {
  id: string;
  sender: "user" | "model";
  text: string;
  translation?: string;
  suggestion?: string;
}
