// Types for TaniAdapt application

export type ActionType = 'irrigation' | 'fertilizing' | 'spraying' | 'harvesting' | 'pruning';

export type StatusLevel = 'SAFE' | 'WARN' | 'DANGER';

export interface HourlyWeather {
  time: string; // ISO string
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  precipitation_probability: number;
  wind_speed_10m: number;
  soil_moisture_0_to_7cm: number;
  shortwave_radiation: number;
}

export interface WeatherData {
  hourly: HourlyWeather[];
  current: {
    temperature: number;
    wind_speed: number;
    humidity: number;
  };
  fetchedAt: string;
}

export interface HourlyStatus {
  hour: string; // e.g. '06.00'
  status: StatusLevel;
  reason: string;
}

export interface ActionEvaluation {
  action: ActionType;
  status: StatusLevel;
  statusLabel: string; // 'Sangat Aman', 'Perlu Waspada', 'Hindari'
  bestWindow: string; // e.g. '06.00 - 08.00 WIB'
  fieldNote: string;
  voiceInstruction: string; // Voice narrative dedicated to this specific action
  hourlyTimeline: HourlyStatus[];
}

export interface AgroAdvisory {
  location: {
    latitude: number;
    longitude: number;
    displayName: string;
  };
  commodity: string;
  generatedAt: string;
  voiceSummary: string;
  actions: Record<ActionType, ActionEvaluation>;
}

export interface LogbookEntry {
  action: ActionType;
  completedAt: string; // ISO date string
  nextRecommendation?: string; // ISO date string for fertilizing lockout
}

export interface UserProfile {
  latitude: number;
  longitude: number;
  locationName: string;
  commodity: string;
}

export const ACTION_META: Record<ActionType, { label: string; emoji: string; shortLabel: string; evalLabel: string }> = {
  irrigation: { label: 'Siram', emoji: '💧', shortLabel: 'Siram', evalLabel: 'MENYIRAM TANAMAN' },
  fertilizing: { label: 'Pupuk', emoji: '🧪', shortLabel: 'Pupuk', evalLabel: 'MEMUPUK TANAH' },
  spraying: { label: 'Semprot', emoji: '💨', shortLabel: 'Semprot', evalLabel: 'MENYEMPROT HAMA' },
  harvesting: { label: 'Panen', emoji: '🌾', shortLabel: 'Panen', evalLabel: 'MEMANEN' },
  pruning: { label: 'Rawat', emoji: '✂️', shortLabel: 'Rawat', evalLabel: 'MERAWAT TANAMAN' },
};
