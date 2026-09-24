'use client';

import { useState, useCallback } from 'react';

interface GeolocationResult {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): GeolocationResult {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolokasi tidak didukung peramban Anda.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(4)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(4)));
        setIsLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Izin lokasi ditolak. Silakan aktifkan GPS.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Lokasi tidak tersedia.');
            break;
          case err.TIMEOUT:
            setError('Waktu permintaan lokasi habis.');
            break;
          default:
            setError('Gagal mendapatkan lokasi.');
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  return { latitude, longitude, error, isLoading, requestLocation };
}
