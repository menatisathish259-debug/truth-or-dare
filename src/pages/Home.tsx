import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { AvatarPicker } from '../components/AvatarPicker';
import { getAvatarById } from '../lib/avatars';
import {
  Sparkles,
  Users,
  Flame,
  PlusCircle,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();
  const { createRoom, joinRoom } = useGame();

  // Auth mode: 'guest' | 'login' | 'signup'
  const [authTab, setAuthTab] = useState<'guest' | 'login' | 'signup'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('cyber-fox');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Room action state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-detect join query param from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      const code = joinCode.toUpperCase();
      setJoinCodeInput(code);
      if (user) {
        joinRoom(code);
      }
    }
  }, [user, joinRoom]);

  // Handle Guest Login
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setAuthError('Please choose a party nickname!');
      return;
    }
    setAuthError(null);
    signInAsGuest(username, selectedAvatar);
    if (joinCodeInput.trim()) {
      setActionLoading(true);
      const res = await joinRoom(joinCodeInput.trim());
      setActionLoading(false);
      if (!res.success && res.error) {
        setJoinError(res.error);
      }
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const { error } = await signInWithEmail(email, password);
    setAuthLoading(false);
    if (error) setAuthError(error);
  };

  // Handle Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim()) {
      setAuthError('Please enter a unique username.');
      return;
    }
    setAuthLoading(true);
    const { error } = await signUpWithEmail(email, password, username, selectedAvatar);
    setAuthLoading(false);
    if (error) setAuthError(error);
  };

  // Handle Create Room
  const handleCreateRoom = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await createRoom();
    } catch (err: any) {
      setJoinError(err.message || 'Failed to create room');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      setJoinError('Please enter a room code.');
      return;
    }
    setJoinError(null);
    setActionLoading(true);
    const res = await joinRoom(joinCodeInput);
    setActionLoading(false);
    if (!res.success && res.error) {
      setJoinError(res.error);
    }
  };

  const avatar = user ? getAvatarById(user.avatarUrl) : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
      {/* Hero Headline */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-pink-300 uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Real-Time Multiplayer Party Game</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
          TRUTH <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">OR</span> DARE
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-lg mx-auto leading-relaxed">
          Play with your friends online across phones, tablets, and laptops. Zero duplicate questions, live emoji reactions, and 150+ hilarious prompts!
        </p>
      </motion.div>

      {/* Main Interactive Card */}
      <div className="w-full max-w-xl">
        {!user ? (
          /* =========================================================
             AUTHENTICATION CARD (Quick Play / Login / Sign Up)
             ========================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl"
          >
            {/* Tabs */}
            <div className="flex items-center justify-center p-1 bg-slate-900/80 rounded-2xl border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('guest');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  authTab === 'guest'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Quick Play
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  authTab === 'login'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  authTab === 'signup'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 mb-4">
                {authError}
              </p>
            )}

            {/* TAB 1: QUICK PLAY GUEST */}
            {authTab === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                {joinCodeInput && (
                  <div className="p-3 bg-pink-500/20 border border-pink-500/40 rounded-2xl mb-2 text-center animate-pulse">
                    <span className="text-xs text-pink-300 font-bold">
                      🎉 You are joining Room <span className="font-mono text-white text-sm">{joinCodeInput}</span>!
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Pick your avatar & nickname below to enter the squad!
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Choose Your Avatar:
                  </label>
                  <AvatarPicker
                    selectedAvatarId={selectedAvatar}
                    onSelect={setSelectedAvatar}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Your Party Nickname:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alex Fire, StarQueen, DareDevil"
                    maxLength={20}
                    className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter Party Zone</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* TAB 2: SIGN IN */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@party.com"
                    className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{authLoading ? 'Signing in...' : 'Sign In'}</span>
                </button>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-[#130c2e] px-3 text-[11px] text-slate-400 uppercase">
                    Or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-2xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* TAB 3: REGISTER */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                    Choose Avatar:
                  </label>
                  <AvatarPicker
                    selectedAvatarId={selectedAvatar}
                    onSelect={setSelectedAvatar}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="CoolGamer99"
                    className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@party.com"
                    className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{authLoading ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          /* =========================================================
             LOGGED-IN PLAYER CARD: CREATE OR JOIN ROOM
             ========================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Player Welcome Chip */}
            <div className="glass-card p-4 rounded-3xl border border-purple-500/30 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${avatar?.bgGradient} shadow`}
                >
                  {avatar?.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Welcome, {user.username}!</h3>
                  <div className="flex items-center gap-2 text-xs text-purple-300">
                    <span>🔥 {user.truthsCount} Truths</span>
                    <span>•</span>
                    <span>⚡ {user.daresCount} Dares</span>
                    <span>•</span>
                    <span>🛡️ {user.passesCount} Passes</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                Online
              </span>
            </div>

            {/* Two Action Panels: Create Room & Join Room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CREATE ROOM CARD */}
              <div className="glass-panel p-6 rounded-3xl border border-pink-500/30 flex flex-col justify-between hover:border-pink-500/60 transition-all shadow-xl">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white">Create Room</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Host a game for up to 20 players. Choose categories, timers & invite your friends!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={actionLoading}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Host New Game</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* JOIN ROOM CARD */}
              <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-500/60 transition-all shadow-xl">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white">Join Room</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Got an invite code? Enter the 6-character room code to join the party!
                  </p>
                </div>

                <form onSubmit={handleJoinRoom} className="mt-4 space-y-3">
                  {joinError && (
                    <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                      {joinError}
                    </p>
                  )}
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g. TRUTH7)"
                    maxLength={8}
                    className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold tracking-widest text-cyan-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
                  />

                  <button
                    type="submit"
                    disabled={actionLoading || !joinCodeInput.trim()}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/25"
                  >
                    {actionLoading ? 'Connecting...' : 'Join Party'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Feature Badges Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 w-full max-w-4xl text-center">
        <div className="glass-card p-3 rounded-2xl border border-white/5">
          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white">Zero Repeats</p>
          <p className="text-[10px] text-slate-400">Strict per-player engine</p>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-white/5">
          <Flame className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white">150+ Prompts</p>
          <p className="text-[10px] text-slate-400">Categorized by spice</p>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-white/5">
          <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white">2–20 Players</p>
          <p className="text-[10px] text-slate-400">Phones, tablets & laptops</p>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-white/5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-xs font-bold text-white">Safe & Fun</p>
          <p className="text-[10px] text-slate-400">No-pressure pass feature</p>
        </div>
      </div>
    </div>
  );
};
