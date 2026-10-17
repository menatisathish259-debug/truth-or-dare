import React from 'react';
import { AVATARS } from '../lib/avatars';

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedAvatarId, onSelect }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-1">
      {AVATARS.map((avatar) => {
        const isSelected = avatar.id === selectedAvatarId;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 ${
              isSelected
                ? 'bg-purple-900/60 ring-2 ring-pink-500 scale-105 shadow-lg shadow-pink-500/25'
                : 'bg-slate-900/40 hover:bg-slate-800/60 hover:scale-105 border border-white/5'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${avatar.bgGradient} shadow-md transition-transform group-hover:scale-110`}
            >
              {avatar.emoji}
            </div>
            <span className="text-[11px] font-medium text-slate-300 mt-1.5 truncate max-w-full">
              {avatar.name}
            </span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-[10px] text-white shadow">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
