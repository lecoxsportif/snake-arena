import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi, gameApi, liveApi } from '../src/services/api';

describe('Auth API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await authApi.login({
        email: 'pixel@game.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe('PixelMaster');
      expect(result.error).toBeNull();
    });

    it('should fail login with invalid email', async () => {
      const result = await authApi.login({
        email: 'invalid@email.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Invalid email or password');
    });
  });

  describe('signup', () => {
    it('should successfully create a new account', async () => {
      const result = await authApi.signup({
        email: 'newuser@test.com',
        password: 'password123',
        username: 'NewPlayer',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe('NewPlayer');
      expect(result.data?.email).toBe('newuser@test.com');
      expect(result.data?.highScore).toBe(0);
    });

    it('should fail signup with existing email', async () => {
      const result = await authApi.signup({
        email: 'pixel@game.com',
        password: 'password123',
        username: 'DifferentUsername',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('should fail signup with existing username', async () => {
      const result = await authApi.signup({
        email: 'different@email.com',
        password: 'password123',
        username: 'PixelMaster',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already taken');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      await authApi.login({
        email: 'pixel@game.com',
        password: 'password123',
      });

      const result = await authApi.logout();

      expect(result.success).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not logged in', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const result = await authApi.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Not authenticated');
    });

    it('should return user when logged in', async () => {
      const mockUser = {
        id: '1',
        username: 'TestUser',
        email: 'test@test.com',
        highScore: 100,
        gamesPlayed: 5,
        createdAt: '2024-01-01',
      };
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUser));

      const result = await authApi.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
  });
});

describe('Game API', () => {
  describe('getLeaderboard', () => {
    it('should return leaderboard entries', async () => {
      const result = await gameApi.getLeaderboard();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data!.length).toBeLessThanOrEqual(10);
    });

    it('should filter by game mode', async () => {
      const wallsResult = await gameApi.getLeaderboard('walls');
      const passThroughResult = await gameApi.getLeaderboard('pass-through');

      expect(wallsResult.success).toBe(true);
      expect(passThroughResult.success).toBe(true);

      if (wallsResult.data) {
        wallsResult.data.forEach(entry => {
          expect(entry.mode).toBe('walls');
        });
      }

      if (passThroughResult.data) {
        passThroughResult.data.forEach(entry => {
          expect(entry.mode).toBe('pass-through');
        });
      }
    });
  });

  describe('submitScore', () => {
    it('should fail when not logged in', async () => {
      localStorage.clear();
      
      const result = await gameApi.submitScore(100, 'walls');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be logged in to submit score');
    });
  });
});

describe('Live API', () => {
  describe('getActivePlayers', () => {
    it('should return list of active players', async () => {
      const result = await liveApi.getActivePlayers();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return players with valid game states', async () => {
      const result = await liveApi.getActivePlayers();

      if (result.data) {
        result.data.forEach(player => {
          expect(player.id).toBeDefined();
          expect(player.username).toBeDefined();
          expect(player.gameState).toBeDefined();
          expect(player.gameState.snake).toBeDefined();
          expect(player.gameState.food).toBeDefined();
        });
      }
    });
  });

  describe('getPlayerStream', () => {
    it('should return player data for valid ID', async () => {
      const playersResult = await liveApi.getActivePlayers();
      
      if (playersResult.data && playersResult.data.length > 0) {
        const playerId = playersResult.data[0].id;
        const result = await liveApi.getPlayerStream(playerId);

        expect(result.success).toBe(true);
        expect(result.data?.id).toBe(playerId);
      }
    });

    it('should fail for invalid player ID', async () => {
      const result = await liveApi.getPlayerStream('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Player not found');
    });
  });

  describe('simulateAIMove', () => {
    it('should move snake towards food', () => {
      const initialState = {
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 10, y: 5 },
        direction: 'RIGHT' as const,
        score: 0,
        status: 'playing' as const,
        mode: 'walls' as const,
        speed: 150,
      };

      const newState = liveApi.simulateAIMove(initialState);

      expect(newState.snake[0].x).toBe(6);
      expect(newState.snake[0].y).toBe(5);
    });

    it('should wrap position in pass-through mode', () => {
      const initialState = {
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
        food: { x: 1, y: 10 },
        direction: 'RIGHT' as const,
        score: 0,
        status: 'playing' as const,
        mode: 'pass-through' as const,
        speed: 150,
      };

      const newState = liveApi.simulateAIMove(initialState);

      expect(newState.snake[0].x).toBe(0);
    });

    it('should increase score when eating food', () => {
      const initialState = {
        snake: [{ x: 9, y: 5 }, { x: 8, y: 5 }, { x: 7, y: 5 }],
        food: { x: 10, y: 5 },
        direction: 'RIGHT' as const,
        score: 50,
        status: 'playing' as const,
        mode: 'walls' as const,
        speed: 150,
      };

      const newState = liveApi.simulateAIMove(initialState);

      expect(newState.score).toBe(60);
      expect(newState.snake.length).toBe(4);
    });
  });
});
