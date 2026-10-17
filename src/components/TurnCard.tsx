import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  ShieldAlert,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Send,
  Mic,
  MessageCircle,
  HelpCircle,
  Coffee,
} from 'lucide-react';

export const TurnCard: React.FC = () => {
  const {
    room,
    session,
    currentQuestion,
    isMyTurn,
    currentTurnMember,
    isHost,
    lastRevealedAnswer,
    clearLastRevealedAnswer,
    selectTurnType,
    completeTurn,
    passTurn,
    skipTurn,
    resetSessionQuestions,
    sendReaction,
  } = useGame();

  const { user } = useAuth();

  // State for typed answers
  const [truthAnswer, setTruthAnswer] = useState('');
  const [dareNote, setDareNote] = useState('');

  if (!session) return null;

  const handleTruthSubmit = () => {
    if (!truthAnswer.trim()) return;
    completeTurn(truthAnswer.trim());
    setTruthAnswer('');
  };

  const handleSpokenSubmit = () => {
    completeTurn('Answered out loud to the room 🗣️');
    setTruthAnswer('');
  };

  const handleDareSubmit = () => {
    completeTurn(dareNote.trim() || 'Dare challenge completed! 🔥');
    setDareNote('');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 py-2">
      {/* =========================================================================
          TRUTH REVEALED CELEBRATORY BANNER (Shows recently answered truth to all)
         ========================================================================= */}
      <AnimatePresence>
        {lastRevealedAnswer && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-purple-950/90 to-pink-950/90 border border-cyan-400/50 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
                <span>{lastRevealedAnswer.playerName}'s Honest Answer:</span>
              </span>
              <button
                type="button"
                onClick={clearLastRevealedAnswer}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              "{lastRevealedAnswer.answerText}"
            </p>
            {lastRevealedAnswer.questionText && (
              <p className="text-[11px] text-purple-300/80 mt-1.5 truncate">
                Prompt: "{lastRevealedAnswer.questionText}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* =========================================================================
            STATE 1: CHOOSING TRUTH OR DARE
           ========================================================================= */}
        {session.turnPhase === 'choosing_type' && (
          <motion.div
            key="choosing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center text-center"
          >
            {isMyTurn ? (
              <div className="w-full">
                <div className="mb-3">
                  <span className="inline-block bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                    🔥 It's Your Turn, {user?.username}!
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    Make Your Choice
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center justify-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-cyan-300" />
                    <span>No timer • Take your time to think and choose!</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* TRUTH CARD BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => selectTurnType('truth')}
                    className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#0c2444] to-[#071329] border-2 border-cyan-500/50 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/30 transition-all text-left flex flex-col justify-between h-56"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-cyan-400 tracking-wider">
                        TRUTH
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Answer 100% Honestly
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Type your honest answer so everyone can read it!
                      </p>
                    </div>
                    <div className="w-full py-2 bg-cyan-500 text-slate-950 font-bold text-center rounded-xl text-sm group-hover:bg-cyan-400 transition-colors shadow">
                      Choose Truth
                    </div>
                  </motion.button>

                  {/* DARE CARD BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => selectTurnType('dare')}
                    className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#380e28] to-[#1e0716] border-2 border-pink-500/50 hover:border-pink-400 shadow-xl hover:shadow-pink-500/30 transition-all text-left flex flex-col justify-between h-56"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-pink-500 tracking-wider">
                        DARE
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
                        <Flame className="w-5 h-5 text-pink-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Take The Challenge
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Fun actions, camera tricks, impressions & challenges.
                      </p>
                    </div>
                    <div className="w-full py-2 bg-pink-500 text-white font-bold text-center rounded-xl text-sm group-hover:bg-pink-400 transition-colors shadow">
                      Choose Dare
                    </div>
                  </motion.button>
                </div>
              </div>
            ) : (
              /* Waiting for other player */
              <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 w-full shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-3xl mb-4 animate-bounce">
                  🎲
                </div>
                <h3 className="text-xl font-bold text-white">
                  Waiting for {currentTurnMember?.username || 'Player'}...
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  They are deciding between Truth or Dare!
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping" />
                  <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping delay-150" />
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping delay-300" />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            STATE 2: ACTIVE QUESTION / DARE CHALLENGE
           ========================================================================= */}
        {session.turnPhase === 'active_challenge' && currentQuestion && (
          <motion.div
            key="challenge"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`relative p-5 sm:p-7 rounded-3xl shadow-2xl border-2 flex flex-col justify-between min-h-[360px] ${
              currentQuestion.type === 'truth'
                ? 'bg-gradient-to-b from-[#0c2444]/95 via-[#0e1b38]/95 to-[#071329]/95 border-cyan-500/50 shadow-cyan-500/20'
                : 'bg-gradient-to-b from-[#380e28]/95 via-[#290d21]/95 to-[#1e0716]/95 border-pink-500/50 shadow-pink-500/20'
            }`}
          >
            {/* Header badges */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      currentQuestion.type === 'truth'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50'
                        : 'bg-pink-500 text-white shadow-sm shadow-pink-500/50'
                    }`}
                  >
                    {currentQuestion.type.toUpperCase()}
                  </span>
                  <span className="text-xs bg-white/10 text-slate-200 px-2.5 py-1 rounded-full capitalize">
                    {currentQuestion.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Difficulty & No-Timer Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                    💭 No rush
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      currentQuestion.difficulty === 'spicy'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : currentQuestion.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {currentQuestion.difficulty === 'spicy' ? '🔥 Spicy' : currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              {/* Player Turn Indicator */}
              <div className="text-xs font-medium text-purple-300/90 mb-2 flex items-center gap-1.5">
                <span>Player:</span>
                <span className="font-bold text-white text-sm">{currentTurnMember?.username}</span>
                {isMyTurn && (
                  <span className="text-[10px] bg-pink-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                    Your Turn
                  </span>
                )}
              </div>

              {/* The Question Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mt-2 drop-shadow">
                "{currentQuestion.text}"
              </h2>
            </div>

            {/* =====================================================================
                TRUTH QUESTION ANSWERING SECTION
               ===================================================================== */}
            {currentQuestion.type === 'truth' && (
              <div className="mt-4 pt-3 border-t border-white/10">
                {isMyTurn ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                      <span>Write Your Honest Answer:</span>
                    </label>

                    <textarea
                      value={truthAnswer}
                      onChange={(e) => setTruthAnswer(e.target.value)}
                      placeholder="Type your honest answer here... Take all the time you need to think! 💭"
                      rows={3}
                      className="w-full bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-inner"
                    />

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        disabled={!truthAnswer.trim()}
                        onClick={handleTruthSubmit}
                        className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Honest Answer</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSpokenSubmit}
                        className="py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                        title="If you answered verbally in person or voice/video call"
                      >
                        <Mic className="w-4 h-4 text-cyan-400" />
                        <span>Answered Out Loud</span>
                      </button>

                      {room?.settings.allowPass && (
                        <button
                          type="button"
                          onClick={passTurn}
                          className="py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 text-slate-400 hover:text-white text-xs font-semibold border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" />
                          <span>Pass (Safe)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Other players waiting */
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-1">
                    <div className="inline-flex items-center gap-2 text-cyan-300 font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>Waiting for {currentTurnMember?.username} to write their answer...</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      No timer is running — they have all the time they need to think! 💭
                    </p>
                    {isHost && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={skipTurn}
                          className="text-xs text-slate-400 hover:text-red-400 inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-xl transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Skip Player
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================================
                DARE CHALLENGE SECTION
               ===================================================================== */}
            {currentQuestion.type === 'dare' && (
              <div className="mt-4 pt-3 border-t border-white/10">
                {isMyTurn ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={dareNote}
                      onChange={(e) => setDareNote(e.target.value)}
                      placeholder="Optional: Leave a comment or note about how the dare went..."
                      className="w-full bg-slate-950/80 border border-pink-500/40 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={handleDareSubmit}
                        className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>I Did It! Done & Completed!</span>
                      </button>

                      {room?.settings.allowPass && (
                        <button
                          type="button"
                          onClick={passTurn}
                          className="py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-1.5"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-400" />
                          <span>Pass (Safe)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-1">
                    <div className="inline-flex items-center gap-2 text-pink-300 font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                      <span>Watching {currentTurnMember?.username} complete the dare!</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Cheer them on using the reaction buttons below! 🔥
                    </p>
                    {isHost && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={skipTurn}
                          className="text-xs text-slate-400 hover:text-red-400 inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-xl transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Skip Player
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* =========================================================================
            STATE 3: QUESTION POOL EXHAUSTED (Friendly No-Repeat Notice)
           ========================================================================= */}
        {session.turnPhase === 'pool_exhausted' && (
          <motion.div
            key="exhausted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-yellow-500/40 text-center shadow-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 text-yellow-400 mx-auto flex items-center justify-center text-2xl mb-4">
              🎉
            </div>
            <h3 className="text-xl font-bold text-white">All Questions Completed!</h3>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              {currentTurnMember?.username} has already answered every available{' '}
              {session.selectedType?.toUpperCase()} question in the selected categories for this game session!
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {isHost ? (
                <button
                  type="button"
                  onClick={resetSessionQuestions}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Session Questions
                </button>
              ) : (
                <p className="text-xs text-purple-300 italic">
                  Ask the host to reset question history or choose another type!
                </p>
              )}
              <button
                type="button"
                onClick={() => selectTurnType(session.selectedType === 'truth' ? 'dare' : 'truth')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-white/10"
              >
                Try {session.selectedType === 'truth' ? 'Dare' : 'Truth'} Instead
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Reactions Bar directly underneath card */}
      <div className="mt-4 flex items-center justify-center gap-2 p-2 glass-panel rounded-2xl border border-purple-500/20">
        <span className="text-xs font-semibold text-purple-300 hidden sm:inline mr-1">
          Cheer & React:
        </span>
        {['😂', '🔥', '😱', '👏', '💀', '🍿', '💖', '🤐'].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => sendReaction(emoji)}
            className="text-2xl p-1.5 hover:scale-130 active:scale-95 transition-transform rounded-xl hover:bg-white/10"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
