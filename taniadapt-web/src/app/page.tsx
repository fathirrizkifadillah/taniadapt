'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/types';
import { getProfile, saveProfile, clearProfile } from '@/lib/storage';
import Dashboard from '@/components/Dashboard';
import OnboardingScreen from '@/components/OnboardingScreen';

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      setProfile(saved);
    }
    setIsLoaded(true);
  }, []);

  const handleOnboardingComplete = (data: {
    latitude: number;
    longitude: number;
    locationName: string;
    commodity: string;
  }) => {
    const newProfile: UserProfile = {
      latitude: data.latitude,
      longitude: data.longitude,
      locationName: data.locationName,
      commodity: data.commodity,
    };
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleResetProfile = () => {
    clearProfile();
    setProfile(null);
  };

  // Show nothing until localStorage is checked (avoid hydration mismatch)
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <Dashboard profile={profile} onResetProfile={handleResetProfile} />;
}
