import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameControls } from '@/components/game/GameControls';
import { MobileControls } from '@/components/game/MobileControls';
import { AuthModal } from '@/components/auth/AuthModal';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SpectatorView } from '@/components/spectate/SpectatorView';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { useGame } from '@/hooks/useGame';
import { gameApi } from '@/services/api';
import { toast } from 'sonner';

type View = 'game' | 'leaderboard' | 'spectate';

function GamePage() {
  const [currentView, setCurrentView] = useState<View>('game');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { isAuthenticated } = useAuthContext();

  const {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    changeDirection,
    gridSize,
    cellSize,
  } = useGame('walls');

  // Submit score when game ends
  useEffect(() => {
    if (gameState.status === 'game-over' && gameState.score > 0) {
      if (isAuthenticated) {
        gameApi.submitScore(gameState.score, gameState.mode).then(response => {
          if (response.success) {
            toast.success(`Score ${gameState.score} submitted!`);
          }
        });
      } else {
        toast.info('Login to save your score!', {
          action: {
            label: 'Login',
            onClick: () => {
              setAuthMode('login');
              setAuthModalOpen(true);
            },
          },
        });
      }
    }
  }, [gameState.status, gameState.score, gameState.mode, isAuthenticated]);

  // Handle keyboard for start/restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && (gameState.status === 'idle' || gameState.status === 'game-over')) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, startGame]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onOpenAuth={openAuth}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      <main className="container mx-auto px-4 py-8">
        {currentView === 'game' && (
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
            {/* Game area */}
            <div className="flex flex-col items-center gap-4">
              <GameCanvas
                gameState={gameState}
                gridSize={gridSize}
                cellSize={cellSize}
              />
              <MobileControls
                onDirectionChange={changeDirection}
                disabled={gameState.status !== 'playing'}
              />
            </div>

            {/* Controls sidebar */}
            <div className="w-full max-w-xs lg:w-64 p-6 rounded-xl bg-card border border-border">
              <GameControls
                status={gameState.status}
                mode={gameState.mode}
                score={gameState.score}
                onStart={startGame}
                onPause={pauseGame}
                onReset={resetGame}
                onModeChange={setMode}
              />
            </div>
          </div>
        )}

        {currentView === 'leaderboard' && (
          <div className="max-w-md mx-auto">
            <h2 className="font-pixel text-2xl neon-text text-center mb-6">
              Leaderboard
            </h2>
            <Leaderboard />
          </div>
        )}

        {currentView === 'spectate' && (
          <SpectatorView onBack={() => setCurrentView('game')} />
        )}
      </main>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
      />
    </div>
  );
}

export default function Index() {
  return (
    <AuthProvider>
      <GamePage />
    </AuthProvider>
  );
}
