# 🔥 Truth or Dare — Real-Time Multiplayer Party Game

A modern, fast, and feature-complete real-time multiplayer party game web application designed for friends playing together across mobile phones, tablets, and laptops.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Lucide Icons**, and **Supabase / WebSockets**.

---

## ✨ Features

- **🎮 Real-Time Multiplayer Rooms**:
  - Host creates a room with unique 6-character room code (e.g. `TRUTH7`) and 1-click shareable invite link (`?join=CODE`).
  - Supports 2–20 players with live real-time synchronization.
  - Room host controls: Start, pause, resume, end game, and kick disruptive players.
- **⚡ Smart Random Question Engine (Strict No-Repeat Guarantee)**:
  - Tracks question history per player within each game session.
  - Player A never receives the same question twice in the same session.
  - Different players can receive the same question fairly.
  - Truth questions and Dare challenges are tracked separately.
  - Detects category pool exhaustion cleanly without silently repeating questions.
  - Host can reset session question history at any time.
- **📚 150+ Categorized Question & Dare Library**:
  - **Truth Categories**: Funny, Friendship, Crushes & Relationships, Personal Preferences, Embarrassing Moments, School & College Life, Deep Conversations, Would You Rather, Random & Wild.
  - **Dare Categories**: Funny Actions, Acting & Impressions, Singing or Dancing, Creative Challenges, Group Challenges, Video Call Challenges, Emoji & Typing Challenges.
  - **3 Intensity Settings**: Easy, Medium, and Spicy (party safe & respectful).
- **🎨 Custom Question Engine**:
  - Add, edit, and delete custom Truths and Dares.
  - Choose difficulty and category; automatically integrated into the no-repeat engine.
- **🎲 Fair Turn Management**:
  - Random or round-robin turn order.
  - Turn timer countdown bar (30s, 45s, 60s, 90s, or unlimited).
  - Safe Pass feature allows players to pass without peer pressure.
- **🎉 High-Energy UI & Visual Aesthetics**:
  - Dark purple, blue, and pink gradient palette with neon glows and glassmorphism.
  - 3D card flip animations on question reveal.
  - Responsive player roster with live glowing halo on the active player.
  - Real-time floating emoji reaction bursts and celebratory confetti effects (`canvas-confetti`).
  - Procedural zero-latency sound effects using Web Audio API (with instant mute toggle).
- **💬 In-Game Chat & Live Reactions**:
  - Floating party chat drawer with instant reaction presets (😂, 🔥, 😱, 👏, 💀, 🍿, 💖, 🤐).
- **🔒 Flexible Backend**:
  - **Dual Mode**: Runs with 100% zero-configuration out-of-the-box in local multi-tab broadcast mode, OR connects to Supabase PostgreSQL & Supabase Realtime when credentials are provided in `.env`.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd truth-or-dare
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser!

### 3. Test Multiplayer Locally
- **Tab 1 (Host)**: Open `http://127.0.0.1:5173/`, choose an avatar and enter nickname (e.g., "Alice"), then click **Host New Game**.
- **Tab 2 (Friend)**: Open a second tab or incognito window, choose another avatar (e.g., "Bob"), and enter the room code displayed in Tab 1 (or open the copied invite link).
- Both players will instantly appear in the room lobby, ready up, and start the live party game!

---

## 🗄️ Supabase PostgreSQL Setup (Optional Cloud Mode)

To enable persistent cloud database storage and Supabase Authentication across remote devices:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase Dashboard.
3. Open [`supabase/schema.sql`](./supabase/schema.sql), copy its contents, paste it into the SQL editor, and click **Run**.
   - This creates tables: `profiles`, `rooms`, `room_members`, `question_library`, `game_sessions`, `question_history`, `game_events`.
   - Sets up Row Level Security (RLS) policies.
   - Installs the atomic stored procedure `get_next_smart_question`.
   - Seeds the question library with categorized truths and dares.
4. Copy your project credentials into `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart the dev server (`npm run dev`). The in-app database indicator in the navbar will switch to **Cloud DB**!

---

## 🧪 Testing the No-Repeat Question Engine

Run the automated test suite verifying per-player no-repeat guarantees:
```bash
node scripts/test-no-repeat.js
```

All 7 test cases verify:
1. Player receives distinct questions in sequence without repetition.
2. Pool exhaustion is signaled cleanly when all category questions are used.
3. Different players can receive the same questions in the same session.
4. Truth and Dare question pools operate independently.
5. Session resets properly restore question availability.

---

## 📦 Deployment Instructions (Vercel)

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In **Build and Output Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**! Your party game is now live worldwide!
