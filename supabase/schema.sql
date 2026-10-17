-- ==============================================================================
-- TRUTH OR DARE - REAL-TIME MULTIPLAYER PARTY GAME
-- SUPABASE POSTGRESQL SCHEMA & STORED PROCEDURES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT NOT NULL,
  truths_count INT DEFAULT 0,
  dares_count INT DEFAULT 0,
  passes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Game Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'paused', 'ended')),
  settings JSONB NOT NULL DEFAULT '{
    "maxPlayers": 12,
    "turnOrder": "random",
    "turnTimerSeconds": 60,
    "categories": ["funny", "crushes", "embarrassing", "deep", "funny_actions", "acting", "singing_dancing", "video_call"],
    "difficulties": ["easy", "medium", "spicy"],
    "allowPass": true,
    "requireApproval": false,
    "preventConsecutiveTurns": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Room Members Table
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_ready BOOLEAN DEFAULT false,
  is_host BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (room_id, user_id)
);

-- 5. Question Library Table
CREATE TABLE IF NOT EXISTS public.question_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('truth', 'dare')),
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'spicy')),
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  session_number INT DEFAULT 1,
  current_turn_player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_turn_number INT DEFAULT 0,
  current_question_id UUID REFERENCES public.question_library(id) ON DELETE SET NULL,
  turn_phase VARCHAR(30) DEFAULT 'choosing_type' CHECK (turn_phase IN ('picking_turn', 'choosing_type', 'active_challenge', 'turn_completed', 'pool_exhausted')),
  selected_type VARCHAR(10) CHECK (selected_type IN ('truth', 'dare')),
  turn_started_at TIMESTAMPTZ DEFAULT now(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 7. Question History Table (CRITICAL NO-REPEAT CORE)
CREATE TABLE IF NOT EXISTS public.question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.question_library(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  turn_status VARCHAR(20) DEFAULT 'pending' CHECK (turn_status IN ('pending', 'completed', 'passed', 'skipped')),
  -- Strictly prevents duplicate assignment of the same question to the same player within a session
  CONSTRAINT unique_player_question_per_session UNIQUE (session_id, player_id, question_id)
);

-- 8. Game Events / Realtime Log Table
CREATE TABLE IF NOT EXISTS public.game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning fast queries & concurrency
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (room_code);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members (room_id);
CREATE INDEX IF NOT EXISTS idx_question_library_type_cat ON public.question_library (type, category, difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room ON public.game_sessions (room_id);
CREATE INDEX IF NOT EXISTS idx_qh_session_player ON public.question_history (session_id, player_id);

-- ==============================================================================
-- STORED PROCEDURES & ATOMIC FUNCTIONS
-- ==============================================================================

-- Atomic Question Selection Function: Never repeats a question for the same player in this session
CREATE OR REPLACE FUNCTION get_next_smart_question(
  p_session_id UUID,
  p_player_id UUID,
  p_room_id UUID,
  p_type VARCHAR(10),
  p_categories TEXT[],
  p_difficulties TEXT[]
)
RETURNS TABLE (
  question_id UUID,
  question_text TEXT,
  question_type VARCHAR(10),
  category VARCHAR(50),
  difficulty VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chosen_id UUID;
BEGIN
  -- 1. Query for an eligible question not yet in question_history for this player & session
  SELECT ql.id INTO v_chosen_id
  FROM public.question_library ql
  WHERE ql.is_active = TRUE
    AND ql.type = p_type
    AND (p_categories IS NULL OR cardinality(p_categories) = 0 OR ql.category = ANY(p_categories))
    AND (p_difficulties IS NULL OR cardinality(p_difficulties) = 0 OR ql.difficulty = ANY(p_difficulties))
    AND (ql.room_id IS NULL OR ql.room_id = p_room_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.question_history qh
      WHERE qh.session_id = p_session_id
        AND qh.player_id = p_player_id
        AND qh.question_id = ql.id
    )
  ORDER BY RANDOM()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- 2. If no question found (pool exhausted for this player in this session)
  IF v_chosen_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. Atomically record the assignment
  INSERT INTO public.question_history (session_id, player_id, question_id, turn_status)
  VALUES (p_session_id, p_player_id, v_chosen_id, 'pending')
  ON CONFLICT (session_id, player_id, question_id) DO NOTHING;

  -- 4. Return the selected question
  RETURN QUERY
  SELECT ql.id, ql.text, ql.type, ql.category, ql.difficulty
  FROM public.question_library ql
  WHERE ql.id = v_chosen_id;
END;
$$;

-- Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || SUBSTRING(NEW.id::text, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'cyber-fox')
  )
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- Permissive RLS for party rooms (authenticated or anon demo access)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Rooms viewable by everyone" ON public.rooms FOR ALL USING (true);
CREATE POLICY "Room members viewable by everyone" ON public.room_members FOR ALL USING (true);
CREATE POLICY "Questions viewable by everyone" ON public.question_library FOR ALL USING (true);
CREATE POLICY "Sessions viewable by everyone" ON public.game_sessions FOR ALL USING (true);
CREATE POLICY "History viewable by room members" ON public.question_history FOR ALL USING (true);
CREATE POLICY "Events viewable by everyone" ON public.game_events FOR ALL USING (true);

-- Enable Supabase Realtime for live multiplayer tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_events;
