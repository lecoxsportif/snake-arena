import {
  User,
  LeaderboardEntry,
  ActivePlayer,
  AuthCredentials,
  ApiResponse,
  GameMode,
} from '@/types/game';

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    console.log(`[API] Calling ${endpoint}`, options);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Include cookies for session management
    });

    console.log(`[API] Response status: ${response.status}`);
    const data = await response.json();
    console.log(`[API] Response data:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Error calling ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: null
    };
  }
}

// Auth API
export const authApi = {
  async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    return apiCall<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    return apiCall<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiCall<null>('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiCall<User>('/auth/me');
  },
};

// Game API
export const gameApi = {
  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    return apiCall<LeaderboardEntry>('/game/score', {
      method: 'POST',
      body: JSON.stringify({ score, mode }),
    });
  },

  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    const queryParam = mode ? `?mode=${mode}` : '';
    return apiCall<LeaderboardEntry[]>(`/game/leaderboard${queryParam}`);
  },
};

// Live players API
export const liveApi = {
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    return apiCall<ActivePlayer[]>('/live/players');
  },

  async getPlayerStream(playerId: string): Promise<ApiResponse<ActivePlayer>> {
    return apiCall<ActivePlayer>(`/live/players/${playerId}`);
  },

  // Client-side AI simulation (kept for potential future use)
  simulateAIMove(gameState: any): any {
    // This function is kept for potential client-side game logic
    // but is not used for API calls
    return gameState;
  },
};
