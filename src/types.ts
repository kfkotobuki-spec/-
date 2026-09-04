/**
 * Types and interfaces for Night Release (おやすみ浄化)
 */

export type RitualType = 'stardust' | 'lantern' | 'waves' | 'candle' | 'bubbles';

export interface RitualOption {
  id: RitualType;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  accentColor: string;
}

export interface MindPurificationResult {
  empatheticValidation: string;
  boundaryReframing: string;
  cleansingAffirmation: string;
  hopeSeedForTomorrow: string;
  bedtimeWhisper: string;
  summaryTitle: string;
}

export interface ReleasedMemory {
  id: string;
  timestamp: number;
  dateStr: string;
  ritualType: RitualType;
  burdenSnippet: string;
  summaryTitle: string;
  hopeSeed: string;
  cleansingAffirmation: string;
  starsGenerated: number;
}

export interface HopeItem {
  id: string;
  title: string;
  detail: string;
  category: string;
  custom?: boolean;
}

export interface SoundTrackConfig {
  id: string;
  name: string;
  icon: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
  color: string;
}

export type AppTab = 'ritual' | 'breathe' | 'hope' | 'sounds' | 'stargarden';

export interface NightStreakData {
  streakDays: number;
  totalNights: number;
  lastDateStr: string;
}
