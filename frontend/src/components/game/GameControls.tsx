import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode, GameStatus } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

export function GameControls({
  status,
  mode,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
}: GameControlsProps) {
  return (
    <div className="space-y-6">
      {/* Score display */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Score</p>
        <p className="font-pixel text-3xl neon-text animate-score-pop" key={score}>
          {score.toString().padStart(4, '0')}
        </p>
      </div>

      {/* Mode selector */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs uppercase tracking-wider text-center">Mode</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeChange('walls')}
            disabled={status === 'playing'}
            className={cn(
              "flex-1 font-pixel text-xs",
              mode === 'walls' && "neon-box border-primary"
            )}
          >
            Walls
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeChange('pass-through')}
            disabled={status === 'playing'}
            className={cn(
              "flex-1 font-pixel text-xs",
              mode === 'pass-through' && "neon-box border-primary"
            )}
          >
            Wrap
          </Button>
        </div>
      </div>

      {/* Game controls */}
      <div className="flex gap-2">
        {status === 'idle' || status === 'game-over' ? (
          <Button 
            onClick={onStart} 
            className="flex-1 neon-box font-pixel text-xs"
          >
            <Play className="w-4 h-4 mr-2" />
            {status === 'game-over' ? 'Retry' : 'Start'}
          </Button>
        ) : (
          <Button 
            onClick={onPause} 
            variant="outline"
            className="flex-1 font-pixel text-xs"
          >
            {status === 'paused' ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
        )}
        <Button 
          onClick={onReset} 
          variant="outline"
          size="icon"
          disabled={status === 'idle'}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Controls info */}
      <div className="text-center text-muted-foreground text-xs space-y-1">
        <p>↑ ↓ ← → or WASD to move</p>
        <p>SPACE to pause</p>
        <p>ESC to reset</p>
      </div>
    </div>
  );
}
