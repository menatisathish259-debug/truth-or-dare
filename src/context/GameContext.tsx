import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Room,
  RoomMember,
  RoomSettings,
  GameSession,
  Question,
  QuestionType,
  TurnPhase,
  ActivityEvent,
  ChatMessage,
  EmojiReaction,
  QuestionCategory,
  Difficulty,
  QuestionHistoryItem,
} from '../types/game';
import { useAuth } from './AuthContext';
import { INITIAL_QUESTIONS } from '../lib/questions-data';
import { sound } from '../lib/audio';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface GameContextType {
  room: Room | null;
  session: GameSession | null;
  currentQuestion: Question | null;
  members: RoomMember[];
  activityFeed: ActivityEvent[];
  chatMessages: ChatMessage[];
  reactions: EmojiReaction[];
  customQuestions: Question[];
  isHost: boolean;
  isMyTurn: boolean;
  currentTurnMember: RoomMember | null;
  allQuestions: Question[];
  playerQuestionHistory: Record<string, string[]>; // playerId -> questionIds asked this session

  // Room actions
  createRoom: (customSettings?: Partial<RoomSettings>) => Promise<string>;
  joinRoom: (code: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  toggleReady: () => void;
  kickPlayer: (userId: string) => void;
  updateSettings: (newSettings: Partial<RoomSettings>) => void;

  // Game control
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  resetSessionQuestions: () => void;
  startNewSession: () => void;

  // Turn actions
  selectTurnType: (type: QuestionType) => void;
  completeTurn: (answerNotes?: string) => void;
  passTurn: () => void;
  skipTurn: () => void;

  // Real-time chat & reactions
  sendMessage: (text: string) => void;
  sendReaction: (emoji: string) => void;

  // Custom questions
  addCustomQuestion: (question: Omit<Question, 'id' | 'isActive'>) => void;
  deleteCustomQuestion: (id: string) => void;
  reportQuestion: (questionId: string, reason: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_SETTINGS: RoomSettings = {
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
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);

  // Local BroadcastChannel for instant multi-tab sync when running locally/offline
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<any>(null);

  // Load custom questions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tod_custom_questions');
      if (saved) {
        setCustomQuestions(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // All questions combined (built-in + custom)
  const allQuestions = [...INITIAL_QUESTIONS, ...customQuestions];

  // Map of playerId -> array of questionIds already asked in the CURRENT session
  const playerQuestionHistory = questionHistory.reduce((acc, item) => {
    if (session && item.sessionId === session.id) {
      if (!acc[item.playerId]) acc[item.playerId] = [];
      acc[item.playerId].push(item.questionId);
    }
    return acc;
  }, {} as Record<string, string[]>);

  const isHost = Boolean(user && room && room.hostId === user.id);
  const isMyTurn = Boolean(
    user && session && session.currentTurnPlayerId === user.id && session.status === 'active'
  );
  const currentTurnMember = members.find((m) => m.userId === session?.currentTurnPlayerId) || null;

  // Broadcast a game state payload to all peers (via Supabase Realtime OR BroadcastChannel)
  const broadcastSync = useCallback(
    (actionType: string, payload: any) => {
      // 1. Supabase Broadcast
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: actionType,
          payload,
        });
      }
      // 2. Local BroadcastChannel
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: actionType,
          payload,
          timestamp: Date.now(),
        });
      }
    },
    []
  );

  // Add event to live activity feed
  const addActivity = useCallback((type: ActivityEvent['type'], message: string, playerName?: string) => {
    const newEvent: ActivityEvent = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      type,
      message,
      playerName,
      timestamp: Date.now(),
    };
    setActivityFeed((prev) => [newEvent, ...prev.slice(0, 40)]);
  }, []);

  // Handle incoming broadcast messages
  const handleIncomingMessage = useCallback(
    (type: string, payload: any) => {
      switch (type) {
        case 'ROOM_UPDATED':
          setRoom(payload.room);
          setMembers(payload.room.members || []);
          break;
        case 'MEMBER_JOINED':
          setMembers(payload.members);
          addActivity('player_joined', `${payload.newMember.username} entered the room!`, payload.newMember.username);
          break;
        case 'MEMBER_LEFT':
          setMembers(payload.members);
          addActivity('player_left', `${payload.leftMemberName} left the game.`, payload.leftMemberName);
          break;
        case 'MEMBER_READY_TOGGLED':
          setMembers(payload.members);
          break;
        case 'SETTINGS_UPDATED':
          setRoom((prev) => (prev ? { ...prev, settings: payload.settings } : null));
          addActivity('settings_updated', 'Room settings updated by the host.');
          break;
        case 'GAME_STARTED':
          setRoom((prev) => (prev ? { ...prev, status: 'playing' } : null));
          setSession(payload.session);
          setCurrentQuestion(payload.currentQuestion || null);
          addActivity('game_started', 'Game session started! Let the truth and dares begin! 🎉');
          sound.playTurnChime();
          break;
        case 'TURN_SELECTED':
          setSession(payload.session);
          setCurrentQuestion(null);
          addActivity('turn_started', `It's ${payload.playerName}'s turn!`, payload.playerName);
          sound.playTurnChime();
          break;
        case 'TYPE_CHOSEN':
          setSession(payload.session);
          setCurrentQuestion(payload.question);
          if (payload.questionHistoryItem) {
            setQuestionHistory((prev) => [...prev, payload.questionHistoryItem]);
          }
          addActivity(
            'type_chosen',
            `${payload.playerName} chose ${payload.type.toUpperCase()}!`,
            payload.playerName
          );
          sound.playCardFlip();
          break;
        case 'TURN_COMPLETED':
          setSession(payload.session);
          setCurrentQuestion(null);
          addActivity('turn_completed', `${payload.playerName} completed their challenge! 🔥`, payload.playerName);
          sound.playCelebration();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff2a85', '#00f0ff', '#8b5cf6', '#facc15'],
          });
          break;
        case 'TURN_PASSED':
          setSession(payload.session);
          setCurrentQuestion(null);
          addActivity('turn_passed', `${payload.playerName} passed the challenge. Safe! 🛡️`, payload.playerName);
          sound.playPass();
          break;
        case 'TURN_SKIPPED':
          setSession(payload.session);
          setCurrentQuestion(null);
          addActivity('turn_skipped', `${payload.playerName}'s turn was skipped by the host.`, payload.playerName);
          break;
        case 'SESSION_RESET':
          setSession(payload.session);
          setCurrentQuestion(null);
          setQuestionHistory((prev) => prev.filter((item) => item.sessionId !== payload.oldSessionId));
          addActivity('game_started', 'Question history reset for all players! Fresh pool loaded.');
          break;
        case 'CHAT_MESSAGE':
          setChatMessages((prev) => [...prev.slice(-99), payload.message]);
          break;
        case 'EMOJI_REACTION':
          setReactions((prev) => [...prev.slice(-25), payload.reaction]);
          sound.playReaction();
          // Remove emoji after 3.5s
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== payload.reaction.id));
          }, 3500);
          break;
      }
    },
    [addActivity]
  );

  // Setup channel listener when room changes
  useEffect(() => {
    if (!room) {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (supabaseChannelRef.current && supabase) {
        supabase.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
      return;
    }

    const channelName = `tod_room_${room.roomCode}`;

    // 1. Setup local BroadcastChannel
    try {
      const bc = new BroadcastChannel(channelName);
      bc.onmessage = (event) => {
        const { type, payload } = event.data;
        handleIncomingMessage(type, payload);
      };
      broadcastChannelRef.current = bc;
    } catch (err) {
      console.warn('BroadcastChannel not supported in this environment');
    }

    // 2. Setup Supabase Realtime channel if available
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase.channel(channelName);

      channel
        .on('broadcast', { event: '*' }, ({ event, payload }) => {
          handleIncomingMessage(event, payload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to Supabase Realtime: ${channelName}`);
          }
        });

      supabaseChannelRef.current = channel;

      return () => {
        if (supabaseChannelRef.current && supabase) {
          supabase.removeChannel(supabaseChannelRef.current);
          supabaseChannelRef.current = null;
        }
      };
    }
  }, [room?.roomCode, handleIncomingMessage]);

  // SMART RANDOM QUESTION PICKER (Strict No-Repeat Implementation)
  const getNextSmartQuestion = useCallback(
    (playerId: string, type: QuestionType, currentSettings: RoomSettings): Question | null => {
      if (!session) return null;

      // 1. Gather all question IDs already assigned to this player in this session
      const alreadyAskedIds = new Set(
        questionHistory
          .filter((item) => item.sessionId === session.id && item.playerId === playerId)
          .map((item) => item.questionId)
      );

      // 2. Filter pool by active, matching type, category, difficulty, room custom filter
      const eligibleQuestions = allQuestions.filter((q) => {
        if (!q.isActive) return false;
        if (q.type !== type) return false;

        // Categories check
        if (currentSettings.categories.length > 0 && !currentSettings.categories.includes(q.category)) {
          return false;
        }

        // Difficulties check
        if (currentSettings.difficulties.length > 0 && !currentSettings.difficulties.includes(q.difficulty)) {
          return false;
        }

        // Custom question room filter
        if (q.isCustom && q.roomId && room && q.roomId !== room.id) {
          return false;
        }

        // STRICT NO-REPEAT RULE FOR THIS PLAYER IN THIS SESSION:
        if (alreadyAskedIds.has(q.id)) {
          return false;
        }

        return true;
      });

      if (eligibleQuestions.length === 0) {
        // Pool exhausted for this player in this session!
        return null;
      }

      // 3. Pick random question
      const randomIndex = Math.floor(Math.random() * eligibleQuestions.length);
      return eligibleQuestions[randomIndex];
    },
    [session, questionHistory, allQuestions, room]
  );

  // Helper to pick the next player fairly
  const selectNextPlayer = useCallback(
    (currentMemberList: RoomMember[], currentTurnPlayerId: string | null, order: 'random' | 'round_robin') => {
      if (currentMemberList.length === 0) return null;

      if (order === 'round_robin') {
        if (!currentTurnPlayerId) {
          return currentMemberList[0];
        }
        const currentIndex = currentMemberList.findIndex((m) => m.userId === currentTurnPlayerId);
        const nextIndex = (currentIndex + 1) % currentMemberList.length;
        return currentMemberList[nextIndex];
      }

      // Random turn order with consecutive prevention
      if (currentMemberList.length === 1) {
        return currentMemberList[0];
      }

      const candidates = currentMemberList.filter((m) => m.userId !== currentTurnPlayerId);
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      return chosen || currentMemberList[0];
    },
    []
  );

  // 1. CREATE ROOM
  const createRoom = async (customSettings?: Partial<RoomSettings>): Promise<string> => {
    if (!user) throw new Error('You must be signed in to create a room');

    // Generate unique 6-character room code (e.g. TRUTH8, DARE42)
    const code = 'TRUTH' + Math.floor(10 + Math.random() * 89);
    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);

    const initialMember: RoomMember = {
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      roomId,
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isReady: true,
      isHost: true,
      isOnline: true,
      joinedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };

    const newRoom: Room = {
      id: roomId,
      roomCode: code,
      hostId: user.id,
      status: 'waiting',
      settings: { ...DEFAULT_SETTINGS, ...customSettings },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [initialMember],
    };

    setRoom(newRoom);
    setMembers([initialMember]);
    setActivityFeed([]);
    setChatMessages([]);
    addActivity('player_joined', `${user.username} created room ${code}!`, user.username);

    // Save to localStorage room registry so other tabs can discover it
    try {
      const roomsRegistry = JSON.parse(localStorage.getItem('tod_public_rooms') || '{}');
      roomsRegistry[code] = newRoom;
      localStorage.setItem('tod_public_rooms', JSON.stringify(roomsRegistry));
    } catch {}

    // If Supabase is configured, create row in Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('rooms').insert({
          id: roomId,
          room_code: code,
          host_id: user.id,
          status: 'waiting',
          settings: newRoom.settings,
        });
        await supabase.from('room_members').insert({
          room_id: roomId,
          user_id: user.id,
          is_ready: true,
          is_host: true,
        });
      } catch (err) {
        console.error('Supabase room insert error:', err);
      }
    }

    return code;
  };

  // 2. JOIN ROOM
  const joinRoom = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Sign in to join a game room' };

    const formattedCode = code.trim().toUpperCase();

    // Check localStorage registry or Supabase
    let targetRoom: Room | null = null;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*, room_members(*, profiles(*))')
        .eq('room_code', formattedCode)
        .single();

      if (data && !error) {
        const mappedMembers: RoomMember[] = (data.room_members || []).map((rm: any) => ({
          id: rm.id,
          roomId: rm.room_id,
          userId: rm.user_id,
          username: rm.profiles?.username || 'Player',
          avatarUrl: rm.profiles?.avatar_url || 'cyber-fox',
          isReady: rm.is_ready,
          isHost: rm.is_host,
          isOnline: rm.is_online,
          joinedAt: rm.joined_at,
          lastSeenAt: rm.last_seen_at,
        }));

        targetRoom = {
          id: data.id,
          roomCode: data.room_code,
          hostId: data.host_id,
          status: data.status,
          settings: data.settings,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          members: mappedMembers,
        };
      }
    }

    if (!targetRoom) {
      try {
        const roomsRegistry = JSON.parse(localStorage.getItem('tod_public_rooms') || '{}');
        targetRoom = roomsRegistry[formattedCode] || null;
      } catch {}
    }

    if (!targetRoom) {
      return { success: false, error: `Room ${formattedCode} not found. Check the code and try again!` };
    }

    if (targetRoom.members.length >= (targetRoom.settings.maxPlayers || 12)) {
      return { success: false, error: 'This room is already at maximum capacity.' };
    }

    // Add or update current user in members
    const existingIndex = targetRoom.members.findIndex((m) => m.userId === user.id);
    let updatedMembers = [...targetRoom.members];

    const currentMemberData: RoomMember = {
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      roomId: targetRoom.id,
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isReady: false,
      isHost: targetRoom.hostId === user.id,
      isOnline: true,
      joinedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      updatedMembers[existingIndex] = {
        ...updatedMembers[existingIndex],
        isOnline: true,
        avatarUrl: user.avatarUrl,
        username: user.username,
      };
    } else {
      updatedMembers.push(currentMemberData);
    }

    const updatedRoom: Room = {
      ...targetRoom,
      members: updatedMembers,
    };

    setRoom(updatedRoom);
    setMembers(updatedMembers);

    // Save update in registry
    try {
      const roomsRegistry = JSON.parse(localStorage.getItem('tod_public_rooms') || '{}');
      roomsRegistry[formattedCode] = updatedRoom;
      localStorage.setItem('tod_public_rooms', JSON.stringify(roomsRegistry));
    } catch {}

    broadcastSync('MEMBER_JOINED', {
      newMember: currentMemberData,
      members: updatedMembers,
    });

    addActivity('player_joined', `${user.username} joined the party! 🎉`, user.username);
    return { success: true };
  };

  // 3. LEAVE ROOM
  const leaveRoom = () => {
    if (!room || !user) return;
    const remainingMembers = members.filter((m) => m.userId !== user.id);

    broadcastSync('MEMBER_LEFT', {
      leftUserId: user.id,
      leftMemberName: user.username,
      members: remainingMembers,
    });

    setRoom(null);
    setSession(null);
    setCurrentQuestion(null);
    setMembers([]);
  };

  // 4. TOGGLE READY
  const toggleReady = () => {
    if (!user || !room) return;
    const updated = members.map((m) => (m.userId === user.id ? { ...m, isReady: !m.isReady } : m));
    setMembers(updated);
    broadcastSync('MEMBER_READY_TOGGLED', { members: updated });
  };

  // 5. KICK PLAYER (Host only)
  const kickPlayer = (userId: string) => {
    if (!isHost || !room) return;
    const target = members.find((m) => m.userId === userId);
    const updated = members.filter((m) => m.userId !== userId);
    setMembers(updated);
    broadcastSync('MEMBER_LEFT', {
      leftUserId: userId,
      leftMemberName: target?.username || 'Player',
      members: updated,
    });
  };

  // 6. UPDATE SETTINGS (Host only)
  const updateSettings = (newSettings: Partial<RoomSettings>) => {
    if (!isHost || !room) return;
    const updated = { ...room.settings, ...newSettings };
    const updatedRoom = { ...room, settings: updated };
    setRoom(updatedRoom);
    broadcastSync('SETTINGS_UPDATED', { settings: updated });
  };

  // 7. START GAME (Host only)
  const startGame = () => {
    if (!isHost || !room || members.length < 2) return;

    // Pick first player
    const firstPlayer = selectNextPlayer(members, null, room.settings.turnOrder);
    const newSession: GameSession = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      roomId: room.id,
      sessionNumber: 1,
      currentTurnPlayerId: firstPlayer ? firstPlayer.userId : null,
      currentTurnNumber: 1,
      currentQuestionId: null,
      turnPhase: 'choosing_type',
      selectedType: null,
      turnStartedAt: new Date().toISOString(),
      status: 'active',
      startedAt: new Date().toISOString(),
    };

    setRoom({ ...room, status: 'playing' });
    setSession(newSession);
    setCurrentQuestion(null);

    broadcastSync('GAME_STARTED', {
      session: newSession,
      currentQuestion: null,
    });

    sound.playTurnChime();
    addActivity('game_started', `Game started! First up: ${firstPlayer?.username}!`, firstPlayer?.username);
  };

  // 8. PAUSE GAME
  const pauseGame = () => {
    if (!isHost || !room) return;
    const newStatus = room.status === 'paused' ? 'playing' : 'paused';
    setRoom({ ...room, status: newStatus });
    broadcastSync('ROOM_UPDATED', { room: { ...room, status: newStatus } });
  };

  // 9. END GAME
  const endGame = () => {
    if (!isHost || !room) return;
    setRoom({ ...room, status: 'ended' });
    if (session) {
      setSession({ ...session, status: 'completed', endedAt: new Date().toISOString() });
    }
    broadcastSync('ROOM_UPDATED', { room: { ...room, status: 'ended' } });
  };

  // 10. RESET SESSION QUESTIONS
  const resetSessionQuestions = () => {
    if (!isHost || !session) return;
    setQuestionHistory((prev) => prev.filter((item) => item.sessionId !== session.id));
    broadcastSync('SESSION_RESET', { oldSessionId: session.id, session });
    sound.playTurnChime();
  };

  // 11. START NEW SESSION
  const startNewSession = () => {
    if (!isHost || !room) return;
    const nextPlayer = selectNextPlayer(members, null, room.settings.turnOrder);
    const newSession: GameSession = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      roomId: room.id,
      sessionNumber: (session?.sessionNumber || 1) + 1,
      currentTurnPlayerId: nextPlayer ? nextPlayer.userId : null,
      currentTurnNumber: 1,
      currentQuestionId: null,
      turnPhase: 'choosing_type',
      selectedType: null,
      turnStartedAt: new Date().toISOString(),
      status: 'active',
      startedAt: new Date().toISOString(),
    };

    setSession(newSession);
    setCurrentQuestion(null);
    broadcastSync('GAME_STARTED', { session: newSession, currentQuestion: null });
    sound.playTurnChime();
  };

  // 12. SELECT TURN TYPE (Active player chooses Truth or Dare)
  const selectTurnType = (type: QuestionType) => {
    if (!isMyTurn || !session || !room || !user) return;

    // Pick question with strict no-repeat guarantee
    const pickedQuestion = getNextSmartQuestion(user.id, type, room.settings);

    let nextPhase: TurnPhase = 'active_challenge';
    let historyItem: QuestionHistoryItem | null = null;

    if (!pickedQuestion) {
      nextPhase = 'pool_exhausted';
    } else {
      historyItem = {
        id: 'qh_' + Math.random().toString(36).substring(2, 9),
        sessionId: session.id,
        playerId: user.id,
        questionId: pickedQuestion.id,
        assignedAt: new Date().toISOString(),
        turnStatus: 'pending',
      };
      setQuestionHistory((prev) => [...prev, historyItem!]);
    }

    const updatedSession: GameSession = {
      ...session,
      selectedType: type,
      turnPhase: nextPhase,
      currentQuestionId: pickedQuestion ? pickedQuestion.id : null,
      currentQuestion: pickedQuestion || null,
    };

    setSession(updatedSession);
    setCurrentQuestion(pickedQuestion || null);

    broadcastSync('TYPE_CHOSEN', {
      session: updatedSession,
      type,
      question: pickedQuestion || null,
      questionHistoryItem: historyItem,
      playerName: user.username,
    });

    sound.playCardFlip();
    addActivity('type_chosen', `${user.username} picked ${type.toUpperCase()}!`, user.username);
  };

  // Helper to advance to next turn
  const advanceTurn = useCallback(
    (reason: 'completed' | 'passed' | 'skipped') => {
      if (!session || !room) return;

      const nextMember = selectNextPlayer(
        members,
        session.currentTurnPlayerId,
        room.settings.turnOrder
      );

      const updatedSession: GameSession = {
        ...session,
        currentTurnNumber: session.currentTurnNumber + 1,
        currentTurnPlayerId: nextMember ? nextMember.userId : null,
        currentQuestionId: null,
        currentQuestion: null,
        selectedType: null,
        turnPhase: 'choosing_type',
        turnStartedAt: new Date().toISOString(),
      };

      const currentPlayer = members.find((m) => m.userId === session.currentTurnPlayerId);
      const actionName =
        reason === 'completed'
          ? 'TURN_COMPLETED'
          : reason === 'passed'
          ? 'TURN_PASSED'
          : 'TURN_SKIPPED';

      setSession(updatedSession);
      setCurrentQuestion(null);

      broadcastSync(actionName, {
        session: updatedSession,
        playerName: currentPlayer?.username || 'Player',
      });
    },
    [session, room, members, selectNextPlayer, broadcastSync]
  );

  // 13. COMPLETE TURN
  const completeTurn = () => {
    if (!isMyTurn || !session || !user) return;

    // Update user stats
    if (session.selectedType === 'truth') {
      updateProfile({ truthsCount: (user.truthsCount || 0) + 1 });
    } else if (session.selectedType === 'dare') {
      updateProfile({ daresCount: (user.daresCount || 0) + 1 });
    }

    sound.playCelebration();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff2a85', '#00f0ff', '#8b5cf6', '#facc15'],
    });

    advanceTurn('completed');
  };

  // 14. PASS TURN (Without pressure)
  const passTurn = () => {
    if (!isMyTurn || !user) return;
    updateProfile({ passesCount: (user.passesCount || 0) + 1 });
    sound.playPass();
    advanceTurn('passed');
  };

  // 15. SKIP TURN (Host skips disconnected or stalled player)
  const skipTurn = () => {
    if (!isHost) return;
    advanceTurn('skipped');
  };

  // 16. CHAT & EMOJI REACTIONS
  const sendMessage = (text: string) => {
    if (!user || !text.trim()) return;
    const msg: ChatMessage = {
      id: 'chat_' + Math.random().toString(36).substring(2, 9),
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatarUrl,
      text: text.trim(),
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev.slice(-99), msg]);
    broadcastSync('CHAT_MESSAGE', { message: msg });
  };

  const sendReaction = (emoji: string) => {
    if (!user) return;
    const reaction: EmojiReaction = {
      id: 'react_' + Math.random().toString(36).substring(2, 9),
      senderId: user.id,
      senderName: user.username,
      emoji,
      x: 15 + Math.random() * 70,
      timestamp: Date.now(),
    };
    setReactions((prev) => [...prev.slice(-25), reaction]);
    broadcastSync('EMOJI_REACTION', { reaction });
    sound.playReaction();

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3500);
  };

  // 17. CUSTOM QUESTIONS
  const addCustomQuestion = (newQ: Omit<Question, 'id' | 'isActive'>) => {
    const q: Question = {
      ...newQ,
      id: 'custom_' + Math.random().toString(36).substring(2, 9),
      isActive: true,
      isCustom: true,
      authorId: user?.id,
      roomId: room?.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customQuestions, q];
    setCustomQuestions(updated);
    try {
      localStorage.setItem('tod_custom_questions', JSON.stringify(updated));
    } catch {}
  };

  const deleteCustomQuestion = (id: string) => {
    const updated = customQuestions.filter((q) => q.id !== id);
    setCustomQuestions(updated);
    try {
      localStorage.setItem('tod_custom_questions', JSON.stringify(updated));
    } catch {}
  };

  const reportQuestion = (questionId: string, reason: string) => {
    console.log(`Question ${questionId} reported. Reason: ${reason}`);
    // Disable locally
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isActive: false } : q))
    );
  };

  return (
    <GameContext.Provider
      value={{
        room,
        session,
        currentQuestion,
        members,
        activityFeed,
        chatMessages,
        reactions,
        customQuestions,
        isHost,
        isMyTurn,
        currentTurnMember,
        allQuestions,
        playerQuestionHistory,

        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        kickPlayer,
        updateSettings,

        startGame,
        pauseGame,
        endGame,
        resetSessionQuestions,
        startNewSession,

        selectTurnType,
        completeTurn,
        passTurn,
        skipTurn,

        sendMessage,
        sendReaction,

        addCustomQuestion,
        deleteCustomQuestion,
        reportQuestion,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
