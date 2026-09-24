'use client';

interface WeatherInfoProps {
  temperature: number;
  windSpeed: number;
  humidity: number;
}

export default function WeatherInfo({ temperature, windSpeed, humidity }: WeatherInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      {/* Sun Icon */}
      <div className="text-amber-500">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{Math.round(temperature)}°C</p>
        <p className="text-xs text-slate-500">
          Angin {Math.round(windSpeed)} km/j · Lembap {Math.round(humidity)}%
        </p>
      </div>
    </div>
  );
}
