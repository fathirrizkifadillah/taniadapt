'use client';

import { HourlyStatus, StatusLevel } from '@/lib/types';
import { useState } from 'react';

interface HourlyTimelineProps {
  timeline: HourlyStatus[];
}

function getStatusDotColor(status: StatusLevel): string {
  switch (status) {
    case 'SAFE':
      return 'bg-[#15803d]';
    case 'WARN':
      return 'bg-[#b45309]';
    case 'DANGER':
      return 'bg-[#dc2626]';
  }
}

export default function HourlyTimeline({ timeline }: HourlyTimelineProps) {
  // Default highlighted hour is 14.00 (as shown in Screenshot 1) or current hour
  const [highlightedHour, setHighlightedHour] = useState<string>('14.00');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-50">
        <div>
          <p className="text-xs text-[#15803d] font-bold tracking-wide mb-0.5">06.00 - 18.00</p>
          <h3 className="text-lg font-bold text-slate-900">Jadwal per jam</h3>
        </div>
        {/* Weather Cloud Icon (matching screenshot) */}
        <div className="text-slate-500 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 15a4 4 0 004 4h10a4 4 0 001.9-7.53 5 5 0 00-9.74-2.22A4.002 4.002 0 003 15z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v2m4-2v2m4-2v2" />
          </svg>
        </div>
      </div>

      {/* Timeline List */}
      <div className="px-6 py-2">
        <div className="space-y-0.5">
          {timeline.map((item, index) => {
            const isHighlighted = item.hour === highlightedHour;
            return (
              <div
                key={item.hour}
                onClick={() => setHighlightedHour(item.hour)}
                className={`flex items-center gap-3.5 py-2.5 px-2.5 -mx-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                  isHighlighted ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                } ${index !== timeline.length - 1 && !isHighlighted ? 'border-b border-slate-100/80' : ''}`}
              >
                <span className="text-sm font-semibold text-slate-800 w-12 shrink-0">
                  {item.hour}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusDotColor(item.status)}`} />
                <span className="text-sm text-slate-600 font-normal">
                  {item.reason}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
