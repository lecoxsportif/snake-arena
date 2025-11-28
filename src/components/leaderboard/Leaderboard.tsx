import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { gameApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  filterMode?: GameMode;
}

export function Leaderboard({ filterMode }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode | undefined>(filterMode);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const response = await gameApi.getLeaderboard(selectedMode);
      if (response.success && response.data) {
        setEntries(response.data);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [selectedMode]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-food" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode filter */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedMode(undefined)}
          className={cn(
            "font-pixel text-xs",
            !selectedMode && "neon-box border-primary"
          )}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedMode('walls')}
          className={cn(
            "font-pixel text-xs",
            selectedMode === 'walls' && "neon-box border-primary"
          )}
        >
          Walls
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedMode('pass-through')}
          className={cn(
            "font-pixel text-xs",
            selectedMode === 'pass-through' && "neon-box border-primary"
          )}
        >
          Wrap
        </Button>
      </div>

      {/* Leaderboard table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border",
                index === 0 && "neon-box border-neon-yellow",
                index === 1 && "border-muted-foreground/50",
                index === 2 && "border-food/50"
              )}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">{entry.username}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.mode === 'walls' ? '🧱 Walls' : '🔄 Wrap'} • {entry.date}
                </p>
              </div>
              <div className="font-pixel text-sm neon-text">
                {entry.score.toLocaleString()}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No scores yet. Be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
