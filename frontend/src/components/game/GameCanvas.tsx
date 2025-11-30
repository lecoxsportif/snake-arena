import React from 'react';
import { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameCanvasProps {
  gameState: GameState;
  gridSize: number;
  cellSize: number;
  isSpectating?: boolean;
}

export function GameCanvas({ gameState, gridSize, cellSize, isSpectating = false }: GameCanvasProps) {
  const { snake, food, status, mode } = gameState;
  const canvasSize = gridSize * cellSize;

  return (
    <div className="relative">
      {/* Game board */}
      <div 
        className={cn(
          "game-canvas relative arcade-border rounded-lg overflow-hidden",
          isSpectating && "opacity-90"
        )}
        style={{ width: canvasSize, height: canvasSize }}
      >
        {/* Grid overlay for visual effect */}
        <div className="absolute inset-0 scanlines opacity-20" />
        
        {/* Food */}
        <div
          className="absolute rounded-full bg-food animate-food-pulse"
          style={{
            left: food.x * cellSize + 2,
            top: food.y * cellSize + 2,
            width: cellSize - 4,
            height: cellSize - 4,
            boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food-glow))',
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={cn(
              "absolute rounded-sm transition-all duration-75",
              index === 0 ? "bg-snake rounded-md" : "bg-snake/80"
            )}
            style={{
              left: segment.x * cellSize + 1,
              top: segment.y * cellSize + 1,
              width: cellSize - 2,
              height: cellSize - 2,
              boxShadow: index === 0 
                ? '0 0 8px hsl(var(--snake)), 0 0 16px hsl(var(--snake-glow))'
                : '0 0 4px hsl(var(--snake) / 0.5)',
              zIndex: snake.length - index,
            }}
          >
            {/* Eyes on head */}
            {index === 0 && (
              <>
                <div 
                  className="absolute w-1.5 h-1.5 rounded-full bg-background"
                  style={{ 
                    top: 3, 
                    left: gameState.direction === 'LEFT' ? 3 : gameState.direction === 'RIGHT' ? 10 : 3,
                  }}
                />
                <div 
                  className="absolute w-1.5 h-1.5 rounded-full bg-background"
                  style={{ 
                    top: gameState.direction === 'UP' ? 3 : gameState.direction === 'DOWN' ? 10 : 3, 
                    right: gameState.direction === 'LEFT' ? 10 : gameState.direction === 'RIGHT' ? 3 : 3,
                  }}
                />
              </>
            )}
          </div>
        ))}

        {/* Wall indicator for walls mode */}
        {mode === 'walls' && (
          <div className="absolute inset-0 border-4 border-wall/50 rounded-lg pointer-events-none" 
            style={{ boxShadow: 'inset 0 0 20px hsl(var(--wall) / 0.3)' }}
          />
        )}

        {/* Game over overlay */}
        {status === 'game-over' && !isSpectating && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <h2 className="font-pixel text-2xl neon-text-pink mb-4">GAME OVER</h2>
              <p className="text-muted-foreground">Press SPACE to restart</p>
            </div>
          </div>
        )}

        {/* Paused overlay */}
        {status === 'paused' && !isSpectating && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <h2 className="font-pixel text-2xl neon-text-blue mb-4">PAUSED</h2>
              <p className="text-muted-foreground">Press SPACE to continue</p>
            </div>
          </div>
        )}

        {/* Idle overlay */}
        {status === 'idle' && !isSpectating && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <h2 className="font-pixel text-lg neon-text mb-4">READY?</h2>
              <p className="text-muted-foreground text-sm">Press SPACE to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
