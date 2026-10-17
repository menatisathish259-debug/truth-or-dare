import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { sound } from '../lib/audio';
import { getAvatarById } from '../lib/avatars';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  LogOut,
  Database,
  Sparkles,
  Settings as SettingsIcon,
  Flame,
} from 'lucide-react';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { SettingsModal } from './SettingsModal';
import { CustomQuestionsModal } from './CustomQuestionsModal';

export const Navbar: React.FC = () => {
  const { room, isHost, leaveRoom } = useGame();
  const { user, signOut } = useAuth();

  const [muted, setMuted] = useState(sound.isMuted());
  const [copied, setCopied] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const toggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const copyRoomInvite = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}?join=${room.roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatar = user ? getAvatarById(user.avatarUrl) : null;
  const isSupabaseOk = isSupabaseConfigured();

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-purple-500/20 px-3 sm:px-6 py-2.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-pink-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a051b] rounded-[10px] flex items-center justify-center text-lg">
                🔥
              </div>
            </div>
            <div>
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 tracking-wider text-base sm:text-lg">
                TRUTH <span className="text-white text-xs font-semibold">OR</span> DARE
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                Multiplayer
              </span>
            </div>
          </div>

          {/* Active Room Code & Invite button */}
          {room && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-slate-900/80 border border-purple-500/30 rounded-xl px-2.5 py-1 text-xs sm:text-sm">
                <span className="text-purple-300 font-medium text-[11px] mr-1 hidden sm:inline">
                  Room:
                </span>
                <span className="font-mono font-black text-cyan-300 tracking-wider">
                  {room.roomCode}
                </span>
                <button
                  type="button"
                  onClick={copyRoomInvite}
                  className="ml-2 p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
                  title="Copy shareable invite link"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {isHost && (
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Game Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Custom questions trigger */}
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="hidden md:flex items-center gap-1.5 text-xs text-purple-200 hover:text-white px-2.5 py-1.5 rounded-xl glass-card hover:bg-white/10 transition-colors border border-purple-500/20"
              title="Custom Questions & Dares"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Questions</span>
            </button>

            {/* Supabase status indicator */}
            <button
              type="button"
              onClick={() => setShowDbModal(true)}
              className={`p-2 rounded-xl glass-card border transition-colors flex items-center gap-1 text-xs ${
                isSupabaseOk
                  ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                  : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
              }`}
              title={isSupabaseOk ? 'Supabase Database Connected' : 'Local Multi-tab Realtime Active'}
            >
              <Database className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px] font-semibold">
                {isSupabaseOk ? 'Cloud DB' : 'Local Realtime'}
              </span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-purple-500/20"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-pink-400" />
              )}
            </button>

            {/* User Profile Badge */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-white/10">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-gradient-to-br ${
                    avatar?.bgGradient || 'from-purple-600 to-pink-600'
                  } shadow`}
                  title={`${user.username} (${user.truthsCount} truths, ${user.daresCount} dares)`}
                >
                  {avatar?.emoji || '✨'}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <p className="font-bold text-white leading-tight truncate max-w-[90px]">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {user.truthsCount + user.daresCount} completed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                  title="Sign Out / Switch Profile"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Leave room button */}
            {room && (
              <button
                type="button"
                onClick={leaveRoom}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-2.5 py-1.5 rounded-xl font-semibold transition-colors"
              >
                Leave
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <SupabaseSetupModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <CustomQuestionsModal isOpen={showCustomModal} onClose={() => setShowCustomModal(false)} />
    </>
  );
};
