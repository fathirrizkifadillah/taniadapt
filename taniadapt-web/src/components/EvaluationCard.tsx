'use client';

import { ActionEvaluation, ACTION_META, StatusLevel } from '@/lib/types';
import { isActionCompletedToday, addLogbookEntry, getLastEntryForAction } from '@/lib/storage';
import { useState, useEffect } from 'react';

interface EvaluationCardProps {
  evaluation: ActionEvaluation;
}

function getStatusColor(status: StatusLevel) {
  switch (status) {
    case 'SAFE':
      return {
        headerBg: 'bg-[#dcfce7]',
        headerText: 'text-[#166534]',
        text: 'text-[#15803d]',
        dot: 'bg-[#15803d]',
        border: 'border-emerald-200',
        lightBg: 'bg-emerald-50',
      };
    case 'WARN':
      return {
        headerBg: 'bg-[#fef3c7]',
        headerText: 'text-[#92400e]',
        text: 'text-[#92400e]',
        dot: 'bg-[#b45309]',
        border: 'border-amber-200',
        lightBg: 'bg-amber-50',
      };
    case 'DANGER':
      return {
        headerBg: 'bg-[#fee2e2]',
        headerText: 'text-[#991b1b]',
        text: 'text-[#b91c1c]',
        dot: 'bg-[#dc2626]',
        border: 'border-red-200',
        lightBg: 'bg-red-50',
      };
  }
}

function getStatusLabel(status: StatusLevel): string {
  switch (status) {
    case 'SAFE': return 'Sangat Aman';
    case 'WARN': return 'Perlu Waspada';
    case 'DANGER': return 'Hindari';
  }
}

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const meta = ACTION_META[evaluation.action];
  const colors = getStatusColor(evaluation.status);
  const statusLabel = getStatusLabel(evaluation.status);

  const [completedToday, setCompletedToday] = useState(false);
  const [fertilizerLockout, setFertilizerLockout] = useState<string | null>(null);

  useEffect(() => {
    const done = isActionCompletedToday(evaluation.action);
    setCompletedToday(done);

    if (evaluation.action === 'fertilizing' && done) {
      const last = getLastEntryForAction('fertilizing');
      if (last?.nextRecommendation) {
        const nextDate = new Date(last.nextRecommendation);
        setFertilizerLockout(
          nextDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        );
      }
    }
  }, [evaluation.action]);

  const handleMarkComplete = () => {
    const now = new Date();
    const entry = {
      action: evaluation.action,
      completedAt: now.toISOString(),
      ...(evaluation.action === 'fertilizing' && {
        nextRecommendation: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    };
    addLogbookEntry(entry);
    setCompletedToday(true);

    if (evaluation.action === 'fertilizing') {
      const nextDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      setFertilizerLockout(
        nextDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Status Header */}
      <div className={`${colors.headerBg} px-5 py-3 border-b border-slate-100 transition-colors duration-200`}>
        <p className={`${colors.headerText} text-xs font-bold tracking-wider uppercase`}>
          EVALUASI · {meta.evalLabel}
        </p>
      </div>

      <div className="p-5">
        {/* Completed / Locked State */}
        {completedToday ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-base">
              {meta.label} selesai dicatat hari ini.
            </p>
            {fertilizerLockout && (
              <p className="text-sm text-slate-400 mt-2">
                Rekomendasi pemupukan susulan: {fertilizerLockout}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Status Indicator */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className={`w-4 h-4 rounded-full ${colors.dot}`} />
              <span className={`text-xl font-bold ${colors.text}`}>{statusLabel}</span>
            </div>

            {/* Best Window */}
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-0.5">Waktu terbaik</p>
              <p className="text-2xl font-bold text-slate-900">{evaluation.bestWindow}</p>
            </div>

            {/* Field Note */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-slate-700 mb-1">Catatan lapangan</p>
              <p className="text-sm text-slate-600 leading-relaxed">{evaluation.fieldNote}</p>
            </div>

            {/* Mark Complete Button */}
            <button
              onClick={handleMarkComplete}
              className="w-full py-4 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold text-base rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 min-h-[56px] shadow-sm"
              aria-label={`Tandai ${meta.label} selesai hari ini`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Tandai selesai hari ini
            </button>
          </>
        )}
      </div>
    </div>
  );
}
