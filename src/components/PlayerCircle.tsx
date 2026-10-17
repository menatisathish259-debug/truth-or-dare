import React from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { getAvatarById } from '../lib/avatars';
import { Crown, CheckCircle2, CircleDashed, UserX, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const PlayerCircle: React.FC = () => {
  const { members, session, isHost, kickPlayer } = useGame();
  const { user } = useAuth();

  const currentTurnPlayerId = session?.currentTurnPlayerId;

  return (
    <div className="w-full max-w-4xl mx-auto py-2 px-2">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Party Squad ({members.length})
          </span>
          {session && (
            <span className="text-[11px] bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
              Turn #{session.currentTurnNumber}
            </span>
          )}
        </div>
        {session && (
          <div className="text-xs text-pink-400 font-semibold flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>
              {members.find((m) => m.userId === currentTurnPlayerId)?.username || 'Someone'}'s Turn
            </span>
          </div>
        )}
      </div>

      {/* Responsive Player Avatars Grid/Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-3 glass-panel rounded-2xl border border-purple-500/20 shadow-xl">
        {members.map((member) => {
          const avatar = getAvatarById(member.avatarUrl);
          const isTurn = currentTurnPlayerId === member.userId;
          const isMe = user?.id === member.userId;

          return (
            <motion.div
              key={member.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${
                isTurn
                  ? 'bg-gradient-to-b from-pink-500/20 to-purple-600/30 ring-2 ring-pink-500 shadow-lg shadow-pink-500/30 scale-105'
                  : 'bg-slate-900/40 border border-white/5'
              }`}
            >
              {/* Crown for host */}
              {member.isHost && (
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.7)]"
                  title="Party Host"
                >
                  <Crown className="w-4 h-4 fill-yellow-400" />
                </div>
              )}

              {/* Avatar circle with glow if it's their turn */}
              <div className="relative mt-1">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${
                    avatar.bgGradient
                  } shadow-md transition-transform ${
                    isTurn ? 'animate-bounce-subtle ring-2 ring-white/60' : ''
                  }`}
                >
                  {avatar.emoji}
                </div>

                {/* Ready Status indicator (in lobby mode) */}
                {session?.status !== 'active' && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                    {member.isReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <CircleDashed className="w-4 h-4 text-slate-500 animate-spin-slow" />
                    )}
                  </div>
                )}

                {/* Online status indicator */}
                <div
                  className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#130c2e] ${
                    member.isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-500'
                  }`}
                  title={member.isOnline ? 'Online' : 'Offline'}
                />
              </div>

              {/* Name and Me indicator */}
              <div className="mt-2 text-center max-w-[80px]">
                <p className="text-xs font-semibold text-white truncate">
                  {member.username}
                </p>
                {isMe && (
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1 rounded font-bold uppercase">
                    You
                  </span>
                )}
              </div>

              {/* Host kick control (only if host and not self) */}
              {isHost && !isMe && (
                <button
                  type="button"
                  onClick={() => kickPlayer(member.userId)}
                  className="mt-1 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all"
                  title="Remove player"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
