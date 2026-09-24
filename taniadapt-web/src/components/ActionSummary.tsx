'use client';

import { ActionType, ActionEvaluation, ACTION_META, StatusLevel } from '@/lib/types';

interface ActionSummaryProps {
  actions: Record<ActionType, ActionEvaluation>;
  selectedAction: ActionType;
  onSelectAction?: (action: ActionType) => void;
}

const ACTION_ICONS_SMALL: Record<ActionType, React.ReactNode> = {
  irrigation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 2.4-4 6.6-4 9a4 4 0 008 0c0-2.4-2.8-6.6-4-9z" />
    </svg>
  ),
  fertilizing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M14.25 3.104v5.714c0 .597.237 1.17.659 1.591L19 14.5" />
    </svg>
  ),
  spraying: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h4l3-5h4l3 5h4M7 8v8a2 2 0 002 2h6a2 2 0 002-2V8" />
    </svg>
  ),
  harvesting: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-3 4-7 7-7 11a7 7 0 0014 0c0-4-4-7-7-11z" />
    </svg>
  ),
  pruning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121" />
    </svg>
  ),
};

function getStatusColor(status: StatusLevel): string {
  switch (status) {
    case 'SAFE': return 'text-green-700';
    case 'WARN': return 'text-amber-700';
    case 'DANGER': return 'text-red-700';
  }
}

function getIconBgColor(status: StatusLevel): string {
  switch (status) {
    case 'SAFE': return 'bg-green-100 text-green-700';
    case 'WARN': return 'bg-amber-100 text-amber-700';
    case 'DANGER': return 'bg-red-100 text-red-700';
  }
}

function getStatusLabel(status: StatusLevel): string {
  switch (status) {
    case 'SAFE': return 'Aman';
    case 'WARN': return 'Waspada';
    case 'DANGER': return 'Hindari';
  }
}

export default function ActionSummary({ actions, selectedAction, onSelectAction }: ActionSummaryProps) {
  const otherActions = (Object.keys(actions) as ActionType[]).filter(a => a !== selectedAction);

  if (otherActions.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold text-slate-900 mb-3">Ringkasan aksi lainnya</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {otherActions.map((action) => {
          const evaluation = actions[action];
          const meta = ACTION_META[action];
          return (
            <button
              key={action}
              onClick={() => onSelectAction?.(action)}
              className="bg-white hover:bg-slate-50 active:scale-[0.98] rounded-xl border border-slate-200 p-4 flex items-center gap-3 transition-all duration-150 text-left shadow-sm hover:shadow"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getIconBgColor(evaluation.status)}`}>
                {ACTION_ICONS_SMALL[action]}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{meta.shortLabel}</p>
                <p className={`text-xs font-semibold ${getStatusColor(evaluation.status)}`}>
                  {getStatusLabel(evaluation.status)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
