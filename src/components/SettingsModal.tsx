import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RoomSettings, QuestionCategory, Difficulty } from '../types/game';
import { Settings, X, Check, Sliders, Users, Clock, ShieldCheck, Flame } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRUTH_CATEGORIES: { id: QuestionCategory; label: string }[] = [
  { id: 'funny', label: 'Funny Questions' },
  { id: 'friendship', label: 'Friendship' },
  { id: 'crushes', label: 'Crushes & Dating' },
  { id: 'personal', label: 'Personal Preferences' },
  { id: 'embarrassing', label: 'Embarrassing Moments' },
  { id: 'school', label: 'School & College' },
  { id: 'deep', label: 'Deep Conversations' },
  { id: 'would_you_rather', label: 'Would You Rather' },
  { id: 'random', label: 'Random & Wild' },
];

const DARE_CATEGORIES: { id: QuestionCategory; label: string }[] = [
  { id: 'funny_actions', label: 'Funny Actions' },
  { id: 'acting', label: 'Acting & Impressions' },
  { id: 'singing_dancing', label: 'Singing or Dancing' },
  { id: 'creative', label: 'Creative Challenges' },
  { id: 'group', label: 'Group Challenges' },
  { id: 'video_call', label: 'Video Call & Online' },
  { id: 'emoji_typing', label: 'Emoji & Typing' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { room, updateSettings, isHost } = useGame();

  const [settings, setSettings] = useState<RoomSettings>(
    room?.settings || {
      maxPlayers: 12,
      turnOrder: 'random',
      turnTimerSeconds: 60,
      categories: [
        'funny',
        'friendship',
        'crushes',
        'personal',
        'embarrassing',
        'deep',
        'funny_actions',
        'acting',
        'singing_dancing',
        'video_call',
      ],
      difficulties: ['easy', 'medium', 'spicy'],
      allowPass: true,
      requireApproval: false,
      preventConsecutiveTurns: true,
    }
  );

  if (!isOpen) return null;

  const toggleCategory = (cat: QuestionCategory) => {
    setSettings((prev) => {
      const exists = prev.categories.includes(cat);
      const nextCats = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      // ensure at least 1 category
      return { ...prev, categories: nextCats.length > 0 ? nextCats : prev.categories };
    });
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setSettings((prev) => {
      const exists = prev.difficulties.includes(diff);
      const nextDiffs = exists
        ? prev.difficulties.filter((d) => d !== diff)
        : [...prev.difficulties, diff];
      return { ...prev, difficulties: nextDiffs.length > 0 ? nextDiffs : prev.difficulties };
    });
  };

  const handleSave = () => {
    if (isHost) {
      updateSettings(settings);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#11092a] border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-500/20 bg-purple-950/40">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-pink-400" />
            <h3 className="font-bold text-white text-lg">Game & Room Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Turn Order */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
              Turn Order
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!isHost}
                onClick={() => setSettings({ ...settings, turnOrder: 'random' })}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  settings.turnOrder === 'random'
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                🎲 Random Turns
              </button>
              <button
                type="button"
                disabled={!isHost}
                onClick={() => setSettings({ ...settings, turnOrder: 'round_robin' })}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  settings.turnOrder === 'round_robin'
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                🔄 Round Robin
              </button>
            </div>
          </div>

          {/* Turn Timer */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-pink-400" /> Turn Timer
              </label>
              <span className="text-xs font-mono text-pink-400 font-bold">
                {settings.turnTimerSeconds === 0 ? 'Unlimited' : `${settings.turnTimerSeconds}s`}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, 30, 45, 60, 90].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  disabled={!isHost}
                  onClick={() => setSettings({ ...settings, turnTimerSeconds: sec })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    settings.turnTimerSeconds === sec
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {sec === 0 ? 'None' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulties */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1">
              <Flame className="w-4 h-4 text-pink-500" /> Intensity / Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'spicy'] as Difficulty[]).map((diff) => {
                const active = settings.difficulties.includes(diff);
                return (
                  <button
                    key={diff}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                      active
                        ? diff === 'spicy'
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : diff === 'medium'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/60 border-white/10 text-slate-500'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{diff === 'spicy' ? '🔥 Spicy' : diff}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Truth Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Truth Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {TRUTH_CATEGORIES.map((cat) => {
                const active = settings.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleCategory(cat.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dare Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 mb-2">
              Dare Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {DARE_CATEGORIES.map((cat) => {
                const active = settings.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleCategory(cat.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                        : 'bg-slate-900/60 border-white/5 text-slate-500'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safe Pass Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-purple-950/20 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Allow Safe Pass</p>
              <p className="text-xs text-slate-400">
                Players can opt to pass a challenge without peer pressure.
              </p>
            </div>
            <input
              type="checkbox"
              disabled={!isHost}
              checked={settings.allowPass}
              onChange={(e) => setSettings({ ...settings, allowPass: e.target.checked })}
              className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-purple-950/30 flex items-center justify-between">
          {!isHost && (
            <span className="text-xs text-slate-400 italic">
              Only the host can modify game settings.
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              Cancel
            </button>
            {isHost && (
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm transition-colors shadow-lg shadow-pink-500/20"
              >
                Save Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
