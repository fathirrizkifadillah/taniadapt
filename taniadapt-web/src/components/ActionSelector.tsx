'use client';

import { ActionType, ACTION_META } from '@/lib/types';

interface ActionSelectorProps {
  selectedAction: ActionType;
  onSelect: (action: ActionType) => void;
}

const ACTIONS: ActionType[] = ['irrigation', 'fertilizing', 'spraying', 'harvesting', 'pruning'];

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  irrigation: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 2.4-4 6.6-4 9a4 4 0 008 0c0-2.4-2.8-6.6-4-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-3" />
    </svg>
  ),
  fertilizing: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0l.94.94a.75.75 0 010 1.06l-3.69 3.69a.75.75 0 01-1.06 0L5 14.5" />
    </svg>
  ),
  spraying: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h4l3-5h4l3 5h4M7 8v8a2 2 0 002 2h6a2 2 0 002-2V8M12 8v10" />
    </svg>
  ),
  harvesting: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-3 4-7 7-7 11a7 7 0 0014 0c0-4-4-7-7-11z" />
    </svg>
  ),
  pruning: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
    </svg>
  ),
};

export default function ActionSelector({ selectedAction, onSelect }: ActionSelectorProps) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-900">Saya mau melakukan...</h2>
        <span className="text-sm text-slate-400">Pilih satu</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {ACTIONS.map((action) => {
          const meta = ACTION_META[action];
          const isSelected = selectedAction === action;
          return (
            <button
              key={action}
              onClick={() => onSelect(action)}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200 min-h-[80px] ${
                isSelected
                  ? 'bg-green-700 border-green-700 text-white shadow-lg shadow-green-700/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={isSelected}
              aria-label={`Pilih aksi ${meta.label}`}
            >
              <span className={isSelected ? 'text-white' : 'text-slate-600'}>
                {ACTION_ICONS[action]}
              </span>
              <span className={`mt-1.5 text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                {meta.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
