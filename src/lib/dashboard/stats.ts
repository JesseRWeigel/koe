import { getWords } from "@/lib/vocabulary/store";

export interface DashboardStats {
  wordsLearned: number;
  dueToday: number;
  retention: number | null; // percentage, null if no reviews yet
  conversations: number;
  streakDays: number;
}

// In-memory tracking (will be replaced by database later)
let reviewsCorrect = 0;
let reviewsTotal = 0;
let conversationCount = 0;
let lastStudyDate: string | null = null;
let currentStreak = 0;

export function resetStats(): void {
  reviewsCorrect = 0;
  reviewsTotal = 0;
  conversationCount = 0;
  lastStudyDate = null;
  currentStreak = 0;
}

export function recordReview(correct: boolean): void {
  reviewsTotal++;
  if (correct) reviewsCorrect++;
  updateStreak();
}

export function recordConversation(): void {
  conversationCount++;
  updateStreak();
}

function updateStreak(): void {
  const today = new Date().toISOString().split("T")[0];
  if (lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastStudyDate === yesterdayStr || lastStudyDate === null) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    lastStudyDate = today;
  }
}

export function getDashboardStats(languageCode?: string): DashboardStats {
  const words = getWords(languageCode);
  const wordsLearned = words.length;

  // All new words are due immediately for first review
  const dueToday = wordsLearned;

  const retention =
    reviewsTotal > 0
      ? Math.round((reviewsCorrect / reviewsTotal) * 10000) / 100
      : null;

  return {
    wordsLearned,
    dueToday,
    retention,
    conversations: conversationCount,
    streakDays: currentStreak,
  };
}
