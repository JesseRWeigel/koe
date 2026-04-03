import { getWords } from "@/lib/vocabulary/store";

export interface DashboardStats {
  wordsLearned: number;
  dueToday: number;
  retention: number | null; // percentage, null if no reviews yet
  conversations: number;
  streakDays: number;
}

const CONVERSATIONS_KEY = "koe-conversations";
const REVIEW_STATS_KEY = "koe-review-stats";
const STREAK_KEY = "koe-streak";

interface ReviewStats {
  correct: number;
  total: number;
}

interface StreakData {
  lastStudyDate: string | null;
  currentStreak: number;
}

function loadConversationCount(): number {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return 0;
    const val = parseInt(raw, 10);
    return isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

function saveConversationCount(count: number): void {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, String(count));
  } catch {}
}

function loadReviewStats(): ReviewStats {
  try {
    const raw = localStorage.getItem(REVIEW_STATS_KEY);
    if (!raw) return { correct: 0, total: 0 };
    return JSON.parse(raw) as ReviewStats;
  } catch {
    return { correct: 0, total: 0 };
  }
}

function saveReviewStats(stats: ReviewStats): void {
  try {
    localStorage.setItem(REVIEW_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { lastStudyDate: null, currentStreak: 0 };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { lastStudyDate: null, currentStreak: 0 };
  }
}

function saveStreak(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {}
}

// In-memory cache loaded from localStorage
let reviewsCorrect = 0;
let reviewsTotal = 0;
let conversationCount = 0;
let lastStudyDate: string | null = null;
let currentStreak = 0;

function loadFromStorage(): void {
  conversationCount = loadConversationCount();
  const reviewStats = loadReviewStats();
  reviewsCorrect = reviewStats.correct;
  reviewsTotal = reviewStats.total;
  const streak = loadStreak();
  lastStudyDate = streak.lastStudyDate;
  currentStreak = streak.currentStreak;
}

// Initialize from localStorage
loadFromStorage();

export function resetStats(): void {
  loadFromStorage();
}

export function recordReview(correct: boolean): void {
  reviewsTotal++;
  if (correct) reviewsCorrect++;
  saveReviewStats({ correct: reviewsCorrect, total: reviewsTotal });
  updateStreak();
}

export function recordConversation(): void {
  conversationCount++;
  saveConversationCount(conversationCount);
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
    saveStreak({ lastStudyDate, currentStreak });
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
