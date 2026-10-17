import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameRoom } from './pages/GameRoom';
import { CelebrationEffects } from './components/CelebrationEffects';
import { ChatDrawer } from './components/ChatDrawer';

const GameRouter: React.FC = () => {
  const { room } = useGame();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-0.5 animate-spin">
          <div className="w-full h-full bg-[#0a051b] rounded-[14px]" />
        </div>
        <p className="text-xs uppercase tracking-widest text-purple-300 font-bold animate-pulse">
          Loading Party Zone...
        </p>
      </div>
    );
  }

  // If in a room
  if (room) {
    if (room.status === 'waiting') {
      return <Lobby />;
    }
    return <GameRoom />;
  }

  // Not in a room -> Home
  return <Home />;
};

export function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="min-h-screen flex flex-col bg-[#0a051b] text-white selection:bg-pink-500 selection:text-white">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <GameRouter />
          </main>
          {/* Global real-time floating emoji overlay */}
          <CelebrationEffects />
          {/* Global floating chat & emoji drawer */}
          <ChatDrawer />
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
