export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'walls' | 'pass-through';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
  rank: number;
}

export interface ActivePlayer {
  id: string;
  username: string;
  currentScore: number;
  mode: GameMode;
  gameState: GameState;
  startedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
