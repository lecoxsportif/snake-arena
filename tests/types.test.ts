import { describe, it, expect } from 'vitest';
import type { 
  Direction, 
  GameMode, 
  GameStatus, 
  Position, 
  GameState, 
  User, 
  LeaderboardEntry,
  ActivePlayer,
  AuthCredentials,
  ApiResponse
} from '../src/types/game';

describe('Game Types', () => {
  describe('Direction type', () => {
    it('should accept valid directions', () => {
      const up: Direction = 'UP';
      const down: Direction = 'DOWN';
      const left: Direction = 'LEFT';
      const right: Direction = 'RIGHT';

      expect(up).toBe('UP');
      expect(down).toBe('DOWN');
      expect(left).toBe('LEFT');
      expect(right).toBe('RIGHT');
    });
  });

  describe('GameMode type', () => {
    it('should accept valid game modes', () => {
      const walls: GameMode = 'walls';
      const passThrough: GameMode = 'pass-through';

      expect(walls).toBe('walls');
      expect(passThrough).toBe('pass-through');
    });
  });

  describe('GameStatus type', () => {
    it('should accept valid game statuses', () => {
      const idle: GameStatus = 'idle';
      const playing: GameStatus = 'playing';
      const paused: GameStatus = 'paused';
      const gameOver: GameStatus = 'game-over';

      expect(idle).toBe('idle');
      expect(playing).toBe('playing');
      expect(paused).toBe('paused');
      expect(gameOver).toBe('game-over');
    });
  });

  describe('Position interface', () => {
    it('should create valid position objects', () => {
      const position: Position = { x: 10, y: 20 };

      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
    });

    it('should accept negative positions', () => {
      const position: Position = { x: -5, y: -10 };

      expect(position.x).toBe(-5);
      expect(position.y).toBe(-10);
    });
  });

  describe('GameState interface', () => {
    it('should create valid game state objects', () => {
      const gameState: GameState = {
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        food: { x: 15, y: 15 },
        direction: 'RIGHT',
        score: 100,
        status: 'playing',
        mode: 'walls',
        speed: 150,
      };

      expect(gameState.snake.length).toBe(2);
      expect(gameState.food.x).toBe(15);
      expect(gameState.direction).toBe('RIGHT');
      expect(gameState.score).toBe(100);
      expect(gameState.status).toBe('playing');
      expect(gameState.mode).toBe('walls');
      expect(gameState.speed).toBe(150);
    });
  });

  describe('User interface', () => {
    it('should create valid user objects', () => {
      const user: User = {
        id: '1',
        username: 'TestPlayer',
        email: 'test@test.com',
        highScore: 500,
        gamesPlayed: 10,
        createdAt: '2024-01-01',
      };

      expect(user.id).toBe('1');
      expect(user.username).toBe('TestPlayer');
      expect(user.email).toBe('test@test.com');
      expect(user.highScore).toBe(500);
      expect(user.gamesPlayed).toBe(10);
    });
  });

  describe('LeaderboardEntry interface', () => {
    it('should create valid leaderboard entry objects', () => {
      const entry: LeaderboardEntry = {
        id: '1',
        username: 'TopPlayer',
        score: 1000,
        mode: 'walls',
        date: '2024-01-01',
        rank: 1,
      };

      expect(entry.username).toBe('TopPlayer');
      expect(entry.score).toBe(1000);
      expect(entry.mode).toBe('walls');
      expect(entry.rank).toBe(1);
    });
  });

  describe('ActivePlayer interface', () => {
    it('should create valid active player objects', () => {
      const player: ActivePlayer = {
        id: 'player-1',
        username: 'LivePlayer',
        currentScore: 250,
        mode: 'pass-through',
        gameState: {
          snake: [{ x: 5, y: 5 }],
          food: { x: 10, y: 10 },
          direction: 'UP',
          score: 250,
          status: 'playing',
          mode: 'pass-through',
          speed: 150,
        },
        startedAt: '2024-01-01T12:00:00Z',
      };

      expect(player.username).toBe('LivePlayer');
      expect(player.currentScore).toBe(250);
      expect(player.gameState.status).toBe('playing');
    });
  });

  describe('AuthCredentials interface', () => {
    it('should create valid auth credentials for login', () => {
      const credentials: AuthCredentials = {
        email: 'user@test.com',
        password: 'password123',
      };

      expect(credentials.email).toBe('user@test.com');
      expect(credentials.password).toBe('password123');
      expect(credentials.username).toBeUndefined();
    });

    it('should create valid auth credentials for signup', () => {
      const credentials: AuthCredentials = {
        email: 'user@test.com',
        password: 'password123',
        username: 'NewUser',
      };

      expect(credentials.username).toBe('NewUser');
    });
  });

  describe('ApiResponse interface', () => {
    it('should create valid success response', () => {
      const response: ApiResponse<User> = {
        data: {
          id: '1',
          username: 'TestUser',
          email: 'test@test.com',
          highScore: 0,
          gamesPlayed: 0,
          createdAt: '2024-01-01',
        },
        error: null,
        success: true,
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.error).toBeNull();
    });

    it('should create valid error response', () => {
      const response: ApiResponse<User> = {
        data: null,
        error: 'Something went wrong',
        success: false,
      };

      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toBe('Something went wrong');
    });
  });
});
