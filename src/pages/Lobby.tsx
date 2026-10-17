import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { AvatarPicker } from '../components/AvatarPicker';
import { PlayerCircle } from '../components/PlayerCircle';
import { ActivityFeed } from '../components/ActivityFeed';
import { SettingsModal } from '../components/SettingsModal';
import {
  Play,
  Copy,
  Check,
  Share2,
  Settings as SettingsIcon,
  CheckCircle2,
  CircleDashed,
  Sparkles,
  Crown,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Lobby: React.FC = () => {
  const { room, members, isHost, toggleReady, startGame, leaveRoom } = useGame();
  const { user, updateProfile } = useAuth();

  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  if (!room) return null;

  const currentMember = members.find((m) => m.userId === user?.id);
  const isReady = currentMember?.isReady || false;
  const readyCount = members.filter((m) => m.isReady).length;
  const canStart = members.length >= 2;

  const copyInvite = () => {
    const inviteUrl = `${window.location.origin}?join=${room.roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarChange = (avatarId: string) => {
    updateProfile({ avatarUrl: avatarId });
    setShowAvatarModal(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header Room Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-panel p-6 rounded-3xl border border-purple-500/30 text-center shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs uppercase font-bold text-pink-400 tracking-wider">
            Party Waiting Room
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider flex items-center justify-center gap-2">
          <span>CODE:</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 font-mono">
            {room.roomCode}
          </span>
        </h1>

        <p className="text-xs text-slate-300 mt-2">
          Share this code or link with friends so they can join on their devices!
        </p>

        {/* Copy Invite Link Button */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={copyInvite}
            className="py-2.5 px-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-pink-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Invite Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copy Shareable Invite Link</span>
              </>
            )}
          </button>

          {isHost && (
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 rounded-2xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <SettingsIcon className="w-4 h-4 text-purple-400" />
              <span>Room Settings</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Players Circle */}
      <PlayerCircle />

      {/* Action Controls Card */}
      <div className="w-full max-w-lg glass-card p-5 rounded-3xl border border-purple-500/20 shadow-xl space-y-4">
        {/* Ready status counter */}
        <div className="flex items-center justify-between text-xs text-slate-300 px-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Players In Room: {members.length} / {room.settings.maxPlayers || 12}</span>
          </div>
          <span className="font-mono text-purple-300">
            {readyCount} of {members.length} Ready
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Ready Button */}
          <button
            type="button"
            onClick={toggleReady}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isReady
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You are Ready! (Click to unready)</span>
              </>
            ) : (
              <>
                <CircleDashed className="w-5 h-5 text-slate-400" />
                <span>Ready Up!</span>
              </>
            )}
          </button>

          {/* Host Start Game Button */}
          {isHost ? (
            <button
              type="button"
              disabled={!canStart}
              onClick={startGame}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{canStart ? 'Start Party Game!' : 'Need 2+ Players'}</span>
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400 flex items-center justify-center">
              Waiting for host to start the game...
            </div>
          )}
        </div>

        {/* Change avatar shortcut button */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowAvatarModal(!showAvatarModal)}
            className="text-xs text-purple-300 hover:text-white underline"
          >
            Change My Party Avatar
          </button>
        </div>

        {/* Inline Avatar Picker toggle */}
        {showAvatarModal && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-xs font-semibold text-purple-200 mb-2">Select Avatar:</p>
            <AvatarPicker
              selectedAvatarId={user?.avatarUrl || 'cyber-fox'}
              onSelect={handleAvatarChange}
            />
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
