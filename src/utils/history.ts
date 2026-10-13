import { StoredQuizRecord } from '../types/quiz.ts';

const STORAGE_KEY = 'quiz_studio_history_v1';

export function getQuizHistory(): StoredQuizRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load quiz history:', err);
    return [];
  }
}

export function saveQuizRecord(record: StoredQuizRecord): void {
  try {
    const existing = getQuizHistory();
    // Keep up to 20 recent quizzes
    const updated = [record, ...existing.filter(item => item.id !== record.id)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save quiz history:', err);
  }
}

export function deleteQuizRecord(id: string): StoredQuizRecord[] {
  try {
    const existing = getQuizHistory();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete quiz record:', err);
    return [];
  }
}

export function clearQuizHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear quiz history:', err);
  }
}
