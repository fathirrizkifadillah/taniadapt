'use client';

import { speakText, stopSpeaking, isSpeaking } from '@/lib/voice';
import { useState, useEffect } from 'react';
import { ActionType } from '@/lib/types';

interface VoiceButtonProps {
  voiceSummary: string;
  selectedAction?: ActionType;
  actionName?: string;
}

function getActionVoiceTitle(action?: ActionType): string {
  switch (action) {
    case 'irrigation':
      return 'Dengarkan instruksi menyiram hari ini';
    case 'fertilizing':
      return 'Dengarkan instruksi pemupukan hari ini';
    case 'spraying':
      return 'Dengarkan instruksi semprot hama hari ini';
    case 'harvesting':
      return 'Dengarkan instruksi memanen hari ini';
    case 'pruning':
      return 'Dengarkan instruksi merawat tanaman hari ini';
    default:
      return 'Dengarkan instruksi tani hari ini';
  }
}

export default function VoiceButton({ voiceSummary, selectedAction }: VoiceButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  // When user switches feature tab, stop previous audio and reset state
  useEffect(() => {
    stopSpeaking();
    setSpeaking(false);
  }, [selectedAction, voiceSummary]);

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handlePress = () => {
    if (isSpeaking() || speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    if (!voiceSummary) return;

    speakText(voiceSummary);
    setSpeaking(true);

    const checkInterval = setInterval(() => {
      if (!isSpeaking()) {
        setSpeaking(false);
        clearInterval(checkInterval);
      }
    }, 400);
  };

  const actionTitle = getActionVoiceTitle(selectedAction);

  return (
    <button
      onClick={handlePress}
      className={`w-full flex items-center justify-between py-3.5 px-5 rounded-xl transition-all duration-200 min-h-[56px] shadow-sm select-none ${
        speaking
          ? 'bg-[#0a2740] ring-2 ring-sky-400/60 shadow-md'
          : 'bg-[#0c2f4d] hover:bg-[#09233a] active:scale-[0.99]'
      }`}
      aria-label={actionTitle}
    >
      <div className="flex items-center gap-3.5 text-left">
        {/* Speaker Icon */}
        <div
          className={`w-8 h-8 rounded-lg bg-sky-900/60 flex items-center justify-center shrink-0 transition-colors ${
            speaking ? 'animate-pulse text-sky-300' : 'text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l5.7-4.8v16l-5.7-4.8H3a1 1 0 01-1-1v-4.4a1 1 0 011-1h3.5z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sky-300 text-[10px] font-bold tracking-widest uppercase mb-0.5">
            ASISTEN SUARA
          </p>
          <p className="text-white text-sm font-semibold leading-snug">
            {speaking ? 'Sedang membacakan instruksi...' : actionTitle}
          </p>
        </div>
      </div>

      {/* Headphone & Audio Waveform */}
      <div className="text-white/80 pr-1 flex items-center gap-1.5 shrink-0">
        {speaking ? (
          <div className="flex items-end gap-1 h-5">
            <span
              className="w-1 bg-sky-300 rounded-full animate-bounce"
              style={{ height: '10px', animationDelay: '0ms' }}
            />
            <span
              className="w-1 bg-sky-300 rounded-full animate-bounce"
              style={{ height: '18px', animationDelay: '100ms' }}
            />
            <span
              className="w-1 bg-sky-300 rounded-full animate-bounce"
              style={{ height: '8px', animationDelay: '200ms' }}
            />
            <span
              className="w-1 bg-sky-300 rounded-full animate-bounce"
              style={{ height: '15px', animationDelay: '300ms' }}
            />
          </div>
        ) : (
          <svg
            className="w-5 h-5 text-white/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 00-14 0m14 0v5a2 2 0 01-2 2h-1a1 1 0 01-1-1v-4a1 1 0 011-1h3m-14 1v-5a7 7 0 0114 0m-14 5v5a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H5"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
