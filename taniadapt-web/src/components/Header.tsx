'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeaderProps {
  locationName: string;
  isOffline: boolean;
  onLocationClick?: () => void;
}

export default function Header({ locationName, isOffline, onLocationClick }: HeaderProps) {
  const [offlineBadgeTime, setOfflineBadgeTime] = useState<string>('');

  useEffect(() => {
    if (isOffline) {
      const now = new Date();
      setOfflineBadgeTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
      );
    }
  }, [isOffline]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src="/icons/logo.png"
              alt="TaniAdapt Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">TaniAdapt</h1>
            <button
              onClick={onLocationClick}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationName || 'Lokasi Ladang Saya'}
            </button>
          </div>
        </div>

        {/* Online/Offline Status */}
        <div>
          {isOffline ? (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Data {offlineBadgeTime} WIB</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Online</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
