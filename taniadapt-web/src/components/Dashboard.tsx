'use client';

import { useState, useEffect, useMemo } from 'react';
import { ActionType, AgroAdvisory, UserProfile } from '@/lib/types';
import { useWeather } from '@/hooks/useWeather';
import { evaluateAllActions } from '@/lib/agro-engine';
import Header from './Header';
import WeatherInfo from './WeatherInfo';
import VoiceButton from './VoiceButton';
import ActionSelector from './ActionSelector';
import EvaluationCard from './EvaluationCard';
import HourlyTimeline from './HourlyTimeline';
import ActionSummary from './ActionSummary';

interface DashboardProps {
  profile: UserProfile;
  onResetProfile: () => void;
}

function formatDateIndonesian(): string {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export default function Dashboard({ profile, onResetProfile }: DashboardProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>('irrigation');
  const { weatherData, isLoading, error, isOffline } = useWeather(profile.latitude, profile.longitude);

  const advisory: AgroAdvisory | null = useMemo(() => {
    if (!weatherData) return null;
    const result = evaluateAllActions(weatherData);
    result.location = {
      latitude: profile.latitude,
      longitude: profile.longitude,
      displayName: profile.locationName,
    };
    return result;
  }, [weatherData, profile]);

  const currentEvaluation = advisory?.actions[selectedAction];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        locationName={profile.locationName}
        isOffline={isOffline}
        onLocationClick={onResetProfile}
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Membaca cuaca ladang Anda...</p>
            <p className="text-sm text-slate-400 mt-1">Mengunduh data meteorologi terkini</p>
          </div>
        )}

        {/* Error State */}
        {error && !weatherData && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Gagal mengambil data cuaca</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Main Dashboard Content */}
        {advisory && currentEvaluation && (
          <>
            {/* Greeting Section */}
            <section className="mb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-700 tracking-wider mb-1">
                    {formatDateIndonesian()}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                    Selamat datang di ladang.
                  </h2>
                  <p className="text-sm text-slate-500">
                    Cuaca sudah kami baca. Pilih pekerjaan yang ingin dilakukan hari ini.
                  </p>
                </div>
                <WeatherInfo
                  temperature={weatherData!.current.temperature}
                  windSpeed={weatherData!.current.wind_speed}
                  humidity={weatherData!.current.humidity}
                />
              </div>
            </section>

            {/* Voice Assistant Button (Action-Specific Audio Companion) */}
            <section className="mb-6">
              <VoiceButton
                voiceSummary={currentEvaluation.voiceInstruction}
                selectedAction={selectedAction}
              />
            </section>

            {/* Action Selector Chips */}
            <ActionSelector
              selectedAction={selectedAction}
              onSelect={setSelectedAction}
            />

            {/* Evaluation + Timeline Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <EvaluationCard evaluation={currentEvaluation} />
              <HourlyTimeline timeline={currentEvaluation.hourlyTimeline} />
            </section>

            {/* Other Actions Summary */}
            <ActionSummary
              actions={advisory.actions}
              selectedAction={selectedAction}
              onSelectAction={setSelectedAction}
            />
          </>
        )}
      </main>
    </div>
  );
}
