'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import Image from 'next/image';

interface OnboardingScreenProps {
  onComplete: (profile: {
    latitude: number;
    longitude: number;
    locationName: string;
    commodity: string;
  }) => void;
}

const COMMODITIES = [
  { id: 'padi', label: 'Padi', emoji: '🌾' },
  { id: 'cabai_rawit', label: 'Cabai Rawit', emoji: '🌶️' },
  { id: 'bawang_merah', label: 'Bawang Merah', emoji: '🧅' },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [locationName, setLocationName] = useState('');
  const [commodity, setCommodity] = useState('');
  const { latitude, longitude, error, isLoading, requestLocation } = useGeolocation();

  const hasLocation = (latitude !== null && longitude !== null) || locationName.trim().length > 0;

  const handleNextStep1 = () => {
    if (hasLocation) setStep(2);
  };

  const handleNextStep2 = () => {
    if (commodity) setStep(3);
  };

  const handleComplete = () => {
    onComplete({
      latitude: latitude ?? -6.9175,
      longitude: longitude ?? 107.6191,
      locationName: locationName || 'Lokasi Terdeteksi',
      commodity,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-4">
              <Image
                src="/icons/logo.png"
                alt="TaniAdapt Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">TaniAdapt</h1>
            <p className="text-sm text-slate-500 mt-1">Penasihat Tani Presisi Hiper-Lokal</p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-green-700' : s < step ? 'w-2 bg-green-400' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 text-center">
                Atur Lokasi Ladang
              </h2>
              <p className="text-sm text-slate-500 text-center">
                Kami butuh lokasi Anda untuk membaca cuaca mikro di ladang.
              </p>

              <button
                onClick={requestLocation}
                disabled={isLoading}
                className="w-full min-h-[56px] rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mendeteksi lokasi...
                  </>
                ) : (
                  '📍 Gunakan Lokasi Ladang Saat Ini'
                )}
              </button>

              {latitude !== null && longitude !== null && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-medium">✓ Lokasi terdeteksi</p>
                  <p className="text-sm text-green-600 mt-1">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-300 flex-1" />
                <span className="text-sm text-slate-400">Atau masukkan manual</span>
                <div className="h-px bg-slate-300 flex-1" />
              </div>

              <input
                type="text"
                placeholder="Nama desa/kecamatan, contoh: Sukamaju, Garut"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full min-h-[56px] rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20"
              />

              <button
                onClick={handleNextStep1}
                disabled={!hasLocation}
                className="w-full min-h-[56px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg transition-colors disabled:opacity-40"
              >
                Lanjut →
              </button>
            </div>
          )}

          {/* Step 2: Commodity */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 text-center">
                Pilih Komoditas Utama
              </h2>
              <p className="text-sm text-slate-500 text-center">
                Rekomendasi akan disesuaikan dengan kebutuhan tanaman Anda.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {COMMODITIES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCommodity(item.id)}
                    className={`flex flex-col items-center justify-center py-6 px-3 rounded-xl border-2 transition-all ${
                      commodity === item.id
                        ? 'border-green-700 bg-green-50 shadow-md shadow-green-700/10'
                        : 'border-slate-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <span className="text-5xl mb-3">{item.emoji}</span>
                    <span className="text-sm font-semibold text-slate-900 text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 min-h-[56px] rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-100 transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  onClick={handleNextStep2}
                  disabled={!commodity}
                  className="w-2/3 min-h-[56px] rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold text-lg transition-colors disabled:opacity-40"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-slate-900 text-center">
                Siap Memulai!
              </h2>
              <p className="text-sm text-slate-500 text-center">
                Pastikan informasi berikut sudah benar.
              </p>

              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lokasi</p>
                  <p className="text-base font-semibold text-slate-900 mt-0.5">
                    {latitude !== null
                      ? `${latitude.toFixed(4)}, ${longitude!.toFixed(4)}`
                      : locationName}
                  </p>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Komoditas</p>
                  <p className="text-base font-semibold text-slate-900 mt-0.5">
                    {COMMODITIES.find((c) => c.id === commodity)?.emoji}{' '}
                    {COMMODITIES.find((c) => c.id === commodity)?.label}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 min-h-[56px] rounded-xl border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-100 transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  onClick={handleComplete}
                  className="w-2/3 min-h-[56px] rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-lg transition-colors shadow-lg shadow-green-700/20"
                >
                  🌾 Mulai Bertani
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
