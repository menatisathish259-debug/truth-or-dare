import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { TurnCard } from '../components/TurnCard';
import { PlayerCircle } from '../components/PlayerCircle';
import { ActivityFeed } from '../components/ActivityFeed';
import { SettingsModal } from '../components/SettingsModal';
import {
  Pause,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Settings as SettingsIcon,
  Flame,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GameRoom: React.FC = () => {
  const {
    room,
    session,
    members,
    isHost,
    pauseGame,
    endGame,
    resetSessionQuestions,
    startNewSession,
  } = useGame();

  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (!room || !session) return null;

  const isPaused = room.status === 'paused';
  const isEnded = room.status === 'ended';

  return (
    <div className="flex-1 flex flex-col items-center px-3 sm:px-4 py-4 max-w-5xl mx-auto w-full space-y-4">
      {/* Top Game Bar */}
      <div className="w-full flex items-center justify-between gap-2 p-2.5 sm:p-3 glass-card rounded-2xl border border-purple-500/20 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Session #{session.sessionNumber}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-purple-200">
            Turn #{session.currentTurnNumber}
          </span>
        </div>

        {/* Host Controls */}
        {isHost && !isEnded && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={pauseGame}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 border border-white/5"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-yellow-400" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={resetSessionQuestions}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 border border-white/5"
              title="Reset question pool for all players"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Reset Pool</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 border border-white/5"
              title="Room Settings"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              type="button"
              onClick={endGame}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center gap-1 border border-red-500/30"
              title="End Game"
            >
              <Square className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End</span>
            </button>
          </div>
        )}
      </div>

      {/* Paused Overlay Banner */}
      {isPaused && (
        <div className="w-full p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 text-center text-sm font-bold animate-pulse">
          ⏸️ The party is paused by the host. Sit tight!
        </div>
      )}

      {/* Central Interactive Turn Arena */}
      {!isEnded ? (
        <div className="w-full flex-1 flex flex-col justify-center">
          <TurnCard />
        </div>
      ) : (
        /* GAME OVER / RESULTS VIEW */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-3xl border border-purple-500/30 text-center max-w-lg mx-auto shadow-2xl my-auto space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 mx-auto flex items-center justify-center text-3xl shadow-lg">
            🏆
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">Party Session Ended!</h2>
            <p className="text-xs text-slate-300 mt-1">
              What an epic game! Total turns played: {session.currentTurnNumber}
            </p>
          </div>

          {/* Squad Leaderboard / Participation */}
          <div className="space-y-2 text-left bg-slate-900/60 p-4 rounded-2xl border border-white/5 max-h-48 overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
              Squad Participation
            </h4>
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-white font-semibold">{m.username}</span>
                <span className="text-slate-400 font-mono">
                  {m.isHost ? '👑 Host' : 'Player'}
                </span>
              </div>
            ))}
          </div>

          {/* Rematch Button */}
          {isHost ? (
            <button
              type="button"
              onClick={startNewSession}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch / Start Fresh Session</span>
            </button>
          ) : (
            <p className="text-xs text-purple-300 italic">
              Waiting for the host to launch a rematch...
            </p>
          )}
        </motion.div>
      )}

      {/* Players Circle */}
      <PlayerCircle />

      {/* Live Activity Feed */}
      <ActivityFeed />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
