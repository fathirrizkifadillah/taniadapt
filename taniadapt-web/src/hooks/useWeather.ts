'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/lib/types';
import { fetchWeatherData } from '@/lib/weather-api';
import { cacheWeatherData, getCachedWeatherData } from '@/lib/storage';

interface UseWeatherResult {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  lastFetchedAt: string | null;
  refetch: () => Promise<void>;
}

export function useWeather(lat: number | null, lon: number | null): UseWeatherResult {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchData = useCallback(async () => {
    if (lat === null || lon === null) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOffline(true);
        const cached = getCachedWeatherData() as WeatherData | null;
        if (cached) {
          setWeatherData(cached);
        } else {
          setError('Tidak ada data tersimpan. Hubungkan ke internet.');
        }
        setIsLoading(false);
        return;
      }

      setIsOffline(false);
      const data = await fetchWeatherData(lat, lon);
      setWeatherData(data);
      cacheWeatherData(data);
    } catch (err) {
      // Try cache on failure
      const cached = getCachedWeatherData() as WeatherData | null;
      if (cached) {
        setWeatherData(cached);
        setIsOffline(true);
      } else {
        setError(err instanceof Error ? err.message : 'Gagal mengambil data cuaca');
      }
    } finally {
      setIsLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  return {
    weatherData,
    isLoading,
    error,
    isOffline,
    lastFetchedAt: weatherData?.fetchedAt ?? null,
    refetch: fetchData,
  };
}
