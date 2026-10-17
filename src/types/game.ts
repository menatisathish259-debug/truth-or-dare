export type QuestionType = 'truth' | 'dare';

export type Difficulty = 'easy' | 'medium' | 'spicy';

export type TruthCategory =
  | 'funny'
  | 'friendship'
  | 'crushes'
  | 'personal'
  | 'embarrassing'
  | 'school'
  | 'random'
  | 'deep'
  | 'would_you_rather';

export type DareCategory =
  | 'funny_actions'
  | 'acting'
  | 'singing_dancing'
  | 'creative'
  | 'group'
  | 'video_call'
  | 'emoji_typing';

export type QuestionCategory = TruthCategory | DareCategory;

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  difficulty: Difficulty;
  isActive: boolean;
  isCustom?: boolean;
  authorId?: string;
  roomId?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  email?: string;
  createdAt: string;
  truthsCount: number;
  daresCount: number;
  passesCount: number;
}

export interface RoomSettings {
  maxPlayers: number;
  turnOrder: 'random' | 'round_robin';
  turnTimerSeconds: number; // 0 for unlimited, 30, 45, 60, 90, 120
  categories: QuestionCategory[];
  difficulties: Difficulty[];
  allowPass: boolean;
  requireApproval: boolean;
  preventConsecutiveTurns: boolean;
}

export type RoomStatus = 'waiting' | 'playing' | 'paused' | 'ended';

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  isReady: boolean;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: string;
  lastSeenAt: string;
}

export interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  settings: RoomSettings;
  createdAt: string;
  updatedAt: string;
  members: RoomMember[];
}

export type TurnPhase =
  | 'picking_turn'       // system selecting who's next
  | 'choosing_type'      // active player picking truth or dare
  | 'active_challenge'   // question shown, player performing/answering
  | 'turn_completed'     // celebrating completion
  | 'pool_exhausted';    // no more unasked questions available for this player

export interface GameSession {
  id: string;
  roomId: string;
  sessionNumber: number;
  currentTurnPlayerId: string | null;
  currentTurnNumber: number;
  currentQuestionId: string | null;
  currentQuestion?: Question | null;
  turnPhase: TurnPhase;
  selectedType: QuestionType | null;
  turnStartedAt: string;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  endedAt?: string | null;
}

export interface QuestionHistoryItem {
  id: string;
  sessionId: string;
  playerId: string;
  questionId: string;
  assignedAt: string;
  turnStatus: 'pending' | 'completed' | 'passed' | 'skipped';
}

export interface ActivityEvent {
  id: string;
  type:
    | 'player_joined'
    | 'player_left'
    | 'player_ready'
    | 'game_started'
    | 'turn_started'
    | 'type_chosen'
    | 'turn_completed'
    | 'turn_passed'
    | 'turn_skipped'
    | 'settings_updated';
  timestamp: number;
  playerId?: string;
  playerName?: string;
  message: string;
  meta?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface EmojiReaction {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  x: number; // percentage 10% to 90%
  timestamp: number;
}
