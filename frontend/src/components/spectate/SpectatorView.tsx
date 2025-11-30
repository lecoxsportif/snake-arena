import React, { useEffect, useState, useRef } from 'react';
import { ActivePlayer } from '@/types/game';
import { liveApi } from '@/services/api';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpectatorViewProps {
  onBack: () => void;
}

export function SpectatorView({ onBack }: SpectatorViewProps) {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number>();

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await liveApi.getActivePlayers();
      if (response.success && response.data) {
        setActivePlayers(response.data);
        if (!selectedPlayer && response.data.length > 0) {
          setSelectedPlayer(response.data[0]);
        }
      }
      setLoading(false);
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate AI playing for selected player
  useEffect(() => {
    if (!selectedPlayer) return;

    const simulateGame = () => {
      setSelectedPlayer(prev => {
        if (!prev) return null;
        const newGameState = liveApi.simulateAIMove(prev.gameState);
        return {
          ...prev,
          gameState: newGameState,
          currentScore: newGameState.score,
        };
      });
    };

    const interval = setInterval(simulateGame, 200);
    return () => clearInterval(interval);
  }, [selectedPlayer?.id]);

  const handleSelectPlayer = (player: ActivePlayer) => {
    setSelectedPlayer(player);
  };

  const getTimePlaying = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="font-pixel text-lg neon-text-blue flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Spectate
          </h2>
          <p className="text-muted-foreground text-sm">Watch other players live</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Player list */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">{activePlayers.length} players online</span>
            </div>
            
            {activePlayers.map(player => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className={cn(
                  "w-full p-4 rounded-lg bg-muted/50 border border-border text-left transition-all hover:border-primary/50",
                  selectedPlayer?.id === player.id && "neon-box-pink border-neon-pink"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{player.username}</span>
                  <span className="text-xs px-2 py-1 rounded bg-background">
                    {player.mode === 'walls' ? '🧱' : '🔄'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Playing: {getTimePlaying(player.startedAt)}
                  </span>
                  <span className="font-pixel text-primary text-xs">
                    {player.currentScore}
                  </span>
                </div>
              </button>
            ))}

            {activePlayers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No players online right now
              </p>
            )}
          </div>

          {/* Game view */}
          {selectedPlayer && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center mb-2">
                <p className="text-muted-foreground text-sm">Watching</p>
                <h3 className="font-pixel text-lg neon-text-pink">{selectedPlayer.username}</h3>
              </div>
              
              <GameCanvas
                gameState={selectedPlayer.gameState}
                gridSize={20}
                cellSize={20}
                isSpectating
              />

              <div className="flex items-center gap-8 text-center">
                <div>
                  <p className="text-muted-foreground text-xs">Score</p>
                  <p className="font-pixel text-xl neon-text">{selectedPlayer.currentScore}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Mode</p>
                  <p className="text-sm text-foreground">
                    {selectedPlayer.mode === 'walls' ? '🧱 Walls' : '🔄 Wrap'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Time</p>
                  <p className="text-sm text-foreground">{getTimePlaying(selectedPlayer.startedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
