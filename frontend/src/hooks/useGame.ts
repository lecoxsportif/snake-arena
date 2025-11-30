import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, GameMode, Position } from '@/types/game';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const getInitialState = (mode: GameMode): GameState => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  food: { x: 15, y: 10 },
  direction: 'RIGHT',
  score: 0,
  status: 'idle',
  mode,
  speed: INITIAL_SPEED,
});

const generateFood = (snake: Position[]): Position => {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
};

export function useGame(initialMode: GameMode = 'walls') {
  const [gameState, setGameState] = useState<GameState>(() => getInitialState(initialMode));
  const directionRef = useRef<Direction>(gameState.direction);
  const gameLoopRef = useRef<number | null>(null);

  const checkCollision = useCallback((head: Position, snake: Position[], mode: GameMode): boolean => {
    // Check self collision
    if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
      return true;
    }
    
    // Check wall collision only in walls mode
    if (mode === 'walls') {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
      }
    }
    
    return false;
  }, []);

  const wrapPosition = useCallback((pos: Position): Position => {
    return {
      x: ((pos.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
      y: ((pos.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE,
    };
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      const head = { ...prev.snake[0] };
      const direction = directionRef.current;

      switch (direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
      }

      // Handle pass-through mode
      const newHead = prev.mode === 'pass-through' ? wrapPosition(head) : head;

      // Check collision
      if (checkCollision(newHead, prev.snake, prev.mode)) {
        return { ...prev, status: 'game-over' };
      }

      const newSnake = [newHead, ...prev.snake];
      let newScore = prev.score;
      let newFood = prev.food;
      let newSpeed = prev.speed;

      // Check food collision
      if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
        newScore += 10;
        newFood = generateFood(newSnake);
        // Increase speed every 50 points
        if (newScore % 50 === 0 && newSpeed > 50) {
          newSpeed -= 10;
        }
      } else {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        score: newScore,
        speed: newSpeed,
        direction,
      };
    });
  }, [checkCollision, wrapPosition]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...getInitialState(prev.mode),
      status: 'playing',
    }));
    directionRef.current = 'RIGHT';
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    setGameState(prev => getInitialState(prev.mode));
    directionRef.current = 'RIGHT';
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...getInitialState(mode),
    }));
    directionRef.current = 'RIGHT';
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== directionRef.current) {
      directionRef.current = newDirection;
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const interval = setInterval(moveSnake, gameState.speed);
    return () => clearInterval(interval);
  }, [gameState.status, gameState.speed, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' && gameState.status !== 'paused') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          pauseGame();
          break;
        case 'Escape':
          e.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, changeDirection, pauseGame, resetGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    changeDirection,
    gridSize: GRID_SIZE,
    cellSize: CELL_SIZE,
  };
}
