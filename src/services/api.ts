import { 
  User, 
  LeaderboardEntry, 
  ActivePlayer, 
  AuthCredentials, 
  ApiResponse,
  GameMode,
  GameState,
  Position,
  Direction
} from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database
let mockUsers: User[] = [
  { id: '1', username: 'PixelMaster', email: 'pixel@game.com', highScore: 1250, gamesPlayed: 45, createdAt: '2024-01-15' },
  { id: '2', username: 'NeonNinja', email: 'neon@game.com', highScore: 980, gamesPlayed: 32, createdAt: '2024-02-20' },
  { id: '3', username: 'RetroGamer', email: 'retro@game.com', highScore: 850, gamesPlayed: 28, createdAt: '2024-03-10' },
];

let mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'PixelMaster', score: 1250, mode: 'walls', date: '2024-11-25', rank: 1 },
  { id: '2', username: 'NeonNinja', score: 980, mode: 'pass-through', date: '2024-11-24', rank: 2 },
  { id: '3', username: 'RetroGamer', score: 850, mode: 'walls', date: '2024-11-23', rank: 3 },
  { id: '4', username: 'ArcadeKing', score: 720, mode: 'pass-through', date: '2024-11-22', rank: 4 },
  { id: '5', username: 'SnakeCharmer', score: 650, mode: 'walls', date: '2024-11-21', rank: 5 },
  { id: '6', username: 'GameWizard', score: 580, mode: 'pass-through', date: '2024-11-20', rank: 6 },
  { id: '7', username: 'VintageVictor', score: 520, mode: 'walls', date: '2024-11-19', rank: 7 },
  { id: '8', username: 'DigitalDragon', score: 480, mode: 'pass-through', date: '2024-11-18', rank: 8 },
  { id: '9', username: 'CyberSnake', score: 420, mode: 'walls', date: '2024-11-17', rank: 9 },
  { id: '10', username: 'GlowGamer', score: 380, mode: 'pass-through', date: '2024-11-16', rank: 10 },
];

let currentUser: User | null = null;

// Helper to generate AI game state
const generateAIGameState = (): GameState => {
  const snake: Position[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  
  return {
    snake,
    food: { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) },
    direction: 'RIGHT',
    score: Math.floor(Math.random() * 500),
    status: 'playing',
    mode: Math.random() > 0.5 ? 'walls' : 'pass-through',
    speed: 150,
  };
};

let mockActivePlayers: ActivePlayer[] = [
  { 
    id: 'ai-1', 
    username: 'NeonNinja', 
    currentScore: 120, 
    mode: 'walls', 
    gameState: generateAIGameState(),
    startedAt: new Date(Date.now() - 300000).toISOString() 
  },
  { 
    id: 'ai-2', 
    username: 'RetroGamer', 
    currentScore: 85, 
    mode: 'pass-through', 
    gameState: generateAIGameState(),
    startedAt: new Date(Date.now() - 180000).toISOString() 
  },
];

// Auth API
export const authApi = {
  async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return { data: null, error: 'Invalid email or password', success: false };
    }
    
    // In real app, we'd verify password
    currentUser = user;
    localStorage.setItem('snake_user', JSON.stringify(user));
    
    return { data: user, error: null, success: true };
  },

  async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
    await delay(500);
    
    if (mockUsers.find(u => u.email === credentials.email)) {
      return { data: null, error: 'Email already exists', success: false };
    }
    
    if (mockUsers.find(u => u.username === credentials.username)) {
      return { data: null, error: 'Username already taken', success: false };
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username: credentials.username || 'Player' + mockUsers.length,
      email: credentials.email,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    currentUser = newUser;
    localStorage.setItem('snake_user', JSON.stringify(newUser));
    
    return { data: newUser, error: null, success: true };
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(200);
    currentUser = null;
    localStorage.removeItem('snake_user');
    return { data: null, error: null, success: true };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(100);
    
    const stored = localStorage.getItem('snake_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return { data: currentUser, error: null, success: true };
    }
    
    return { data: null, error: 'Not authenticated', success: false };
  },
};

// Game API
export const gameApi = {
  async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
    await delay(300);
    
    if (!currentUser) {
      return { data: null, error: 'Must be logged in to submit score', success: false };
    }
    
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      username: currentUser.username,
      score,
      mode,
      date: new Date().toISOString().split('T')[0],
      rank: 0,
    };
    
    mockLeaderboard.push(entry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    mockLeaderboard.forEach((e, i) => e.rank = i + 1);
    
    // Update user high score
    if (score > currentUser.highScore) {
      currentUser.highScore = score;
      currentUser.gamesPlayed++;
      localStorage.setItem('snake_user', JSON.stringify(currentUser));
    }
    
    return { data: entry, error: null, success: true };
  },

  async getLeaderboard(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return { data: entries.slice(0, 10), error: null, success: true };
  },
};

// Live players API
export const liveApi = {
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    await delay(200);
    
    // Update AI game states with some variation
    mockActivePlayers = mockActivePlayers.map(player => ({
      ...player,
      currentScore: player.currentScore + Math.floor(Math.random() * 10),
      gameState: {
        ...player.gameState,
        score: player.gameState.score + Math.floor(Math.random() * 10),
      },
    }));
    
    return { data: mockActivePlayers, error: null, success: true };
  },

  async getPlayerStream(playerId: string): Promise<ApiResponse<ActivePlayer>> {
    await delay(100);
    
    const player = mockActivePlayers.find(p => p.id === playerId);
    if (!player) {
      return { data: null, error: 'Player not found', success: false };
    }
    
    return { data: player, error: null, success: true };
  },

  // Simulate AI player moves
  simulateAIMove(gameState: GameState): GameState {
    const { snake, food, direction, score, mode } = gameState;
    const head = { ...snake[0] };
    
    // Simple AI: move towards food
    let newDirection: Direction = direction;
    
    if (food.x > head.x && direction !== 'LEFT') {
      newDirection = 'RIGHT';
    } else if (food.x < head.x && direction !== 'RIGHT') {
      newDirection = 'LEFT';
    } else if (food.y > head.y && direction !== 'UP') {
      newDirection = 'DOWN';
    } else if (food.y < head.y && direction !== 'DOWN') {
      newDirection = 'UP';
    }
    
    // Move head
    switch (newDirection) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }
    
    // Handle boundaries
    const gridSize = 20;
    if (mode === 'pass-through') {
      if (head.x < 0) head.x = gridSize - 1;
      if (head.x >= gridSize) head.x = 0;
      if (head.y < 0) head.y = gridSize - 1;
      if (head.y >= gridSize) head.y = 0;
    }
    
    const newSnake = [head, ...snake];
    let newScore = score;
    let newFood = food;
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      newScore += 10;
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } else {
      newSnake.pop();
    }
    
    return {
      ...gameState,
      snake: newSnake,
      food: newFood,
      direction: newDirection,
      score: newScore,
    };
  },
};
