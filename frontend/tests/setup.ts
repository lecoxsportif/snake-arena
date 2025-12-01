import '@testing-library/jest-dom';
import { vi } from 'vitest';

class LocalStorageMock {
  store: Record<string, string>;

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

const localStorageMock = new LocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch API with proper Response implementation
globalThis.fetch = vi.fn((url: string, options?: RequestInit) => {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : null;

  // Mock responses based on endpoint
  if (url.indexOf('/auth/login') !== -1) {
    if (body?.email === 'pixel@game.com') {
      return Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          data: { id: '1', username: 'PixelMaster', email: 'pixel@game.com', highScore: 1250, gamesPlayed: 45, createdAt: '2024-01-15' },
          error: null
        })
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({
        success: false,
        data: null,
        error: 'Invalid email or password'
      })
    });
  }

  if (url.indexOf('/auth/signup') !== -1) {
    if (body?.email === 'pixel@game.com') {
      return Promise.resolve({
        json: () => Promise.resolve({
          success: false,
          data: null,
          error: 'Email already exists'
        })
      });
    }
    if (body?.username === 'PixelMaster') {
      return Promise.resolve({
        json: () => Promise.resolve({
          success: false,
          data: null,
          error: 'Username already taken'
        })
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: { id: '4', username: body?.username || 'NewPlayer', email: body?.email, highScore: 0, gamesPlayed: 0, createdAt: new Date().toISOString() },
        error: null
      })
    });
  }

  if (url.indexOf('/auth/logout') !== -1) {
    return Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: null,
        error: null
      })
    });
  }

  if (url.indexOf('/auth/me') !== -1) {
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      return Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          data: JSON.parse(stored),
          error: null
        })
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({
        success: false,
        data: null,
        error: 'Not authenticated'
      })
    });
  }

  if (url.indexOf('/game/leaderboard') !== -1) {
    const allEntries = [
      { id: '1', username: 'PixelMaster', score: 1250, mode: 'walls', date: '2024-11-25', rank: 1 },
      { id: '2', username: 'NeonNinja', score: 980, mode: 'pass-through', date: '2024-11-24', rank: 2 },
      { id: '3', username: 'RetroGamer', score: 850, mode: 'walls', date: '2024-11-23', rank: 3 },
    ];

    let filteredEntries = allEntries;
    if (url.indexOf('mode=walls') !== -1) {
      filteredEntries = allEntries.filter(e => e.mode === 'walls');
    } else if (url.indexOf('mode=pass-through') !== -1) {
      filteredEntries = allEntries.filter(e => e.mode === 'pass-through');
    }

    return Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: filteredEntries,
        error: null
      })
    });
  }

  if (url.endsWith('/game/score')) {
    const stored = localStorage.getItem('snake_user');
    if (!stored) {
      return Promise.resolve({
        json: () => Promise.resolve({
          success: false,
          data: null,
          error: 'Must be logged in to submit score'
        })
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: { id: '11', username: 'TestUser', score: body?.score || 100, mode: body?.mode || 'walls', date: new Date().toISOString().split('T')[0], rank: 1 },
        error: null
      })
    });
  }

  if (url.indexOf('/live/players/') !== -1) {
    // Specific player ID - check if it's a valid one
    const playerId = url.split('/').pop();
    if (playerId === 'ai-1') {
      return Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'ai-1',
            username: 'NeonNinja',
            currentScore: 120,
            mode: 'walls',
            gameState: {
              snake: [{ x: 10, y: 10 }],
              food: { x: 5, y: 5 },
              direction: 'RIGHT',
              score: 120,
              status: 'playing',
              mode: 'walls',
              speed: 150
            },
            startedAt: new Date().toISOString()
          },
          error: null
        })
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({
        success: false,
        data: null,
        error: 'Player not found'
      })
    });
  }

  if (url.indexOf('/live/players') !== -1) {
    return Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: [
          {
            id: 'ai-1',
            username: 'NeonNinja',
            currentScore: 120,
            mode: 'walls',
            gameState: {
              snake: [{ x: 10, y: 10 }],
              food: { x: 5, y: 5 },
              direction: 'RIGHT',
              score: 120,
              status: 'playing',
              mode: 'walls',
              speed: 150
            },
            startedAt: new Date().toISOString()
          },
        ],
        error: null
      })
    });
  }

  // Default response
  return Promise.resolve({
    json: () => Promise.resolve({
      success: false,
      data: null,
      error: 'Not found'
    })
  });
}) as any;
