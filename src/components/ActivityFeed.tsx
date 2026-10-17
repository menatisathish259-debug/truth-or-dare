import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const { activityFeed } = useGame();
  const [collapsed, setCollapsed] = useState(false);

  if (activityFeed.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-2xl border border-purple-500/20 overflow-hidden shadow-xl">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-3.5 py-2 bg-purple-950/40 cursor-pointer hover:bg-purple-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
            Live Party Feed
          </span>
          <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded-full font-mono">
            {activityFeed.length}
          </span>
        </div>
        <button
          type="button"
          aria-label={collapsed ? "Expand party feed" : "Collapse party feed"}
          className="text-purple-300 hover:text-white"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-28 overflow-y-auto p-2 space-y-1.5 text-xs divide-y divide-white/5">
          {activityFeed.slice(0, 8).map((evt) => (
            <div key={evt.id} className="pt-1 first:pt-0 flex items-center justify-between text-slate-300">
              <span className="truncate pr-2">{evt.message}</span>
              <span className="text-[10px] text-purple-400/80 font-mono flex-shrink-0">
                {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
