import { UserProfile, LogbookEntry } from './types';

const PROFILE_KEY = 'taniadapt_profile';
const LOGBOOK_KEY = 'taniadapt_logbook';
const WEATHER_CACHE_KEY = 'taniadapt_weather_cache';

export function saveProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_KEY);
  }
}

export function getLogbook(): LogbookEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOGBOOK_KEY);
  return data ? JSON.parse(data) : [];
}

export function addLogbookEntry(entry: LogbookEntry): void {
  const entries = getLogbook();
  entries.push(entry);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGBOOK_KEY, JSON.stringify(entries));
  }
}

export function getLastEntryForAction(action: string): LogbookEntry | undefined {
  const entries = getLogbook();
  return entries
    .filter(e => e.action === action)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
}

export function isActionCompletedToday(action: string): boolean {
  const last = getLastEntryForAction(action);
  if (!last) return false;
  const today = new Date().toDateString();
  return new Date(last.completedAt).toDateString() === today;
}

export function cacheWeatherData(data: unknown): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
  }
}

export function getCachedWeatherData(): unknown | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(WEATHER_CACHE_KEY);
  return data ? JSON.parse(data) : null;
}
