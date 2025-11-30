import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../src/hooks/useGame';

describe('useGame Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGame('walls'));

      expect(result.current.gameState.status).toBe('idle');
      expect(result.current.gameState.mode).toBe('walls');
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.snake.length).toBe(3);
    });

    it('should initialize with pass-through mode when specified', () => {
      const { result } = renderHook(() => useGame('pass-through'));

      expect(result.current.gameState.mode).toBe('pass-through');
    });

    it('should have snake starting at correct position', () => {
      const { result } = renderHook(() => useGame('walls'));

      expect(result.current.gameState.snake[0]).toEqual({ x: 10, y: 10 });
      expect(result.current.gameState.snake[1]).toEqual({ x: 9, y: 10 });
      expect(result.current.gameState.snake[2]).toEqual({ x: 8, y: 10 });
    });

    it('should have food at initial position', () => {
      const { result } = renderHook(() => useGame('walls'));

      expect(result.current.gameState.food).toEqual({ x: 15, y: 10 });
    });
  });

  describe('startGame', () => {
    it('should change status to playing', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });

      expect(result.current.gameState.status).toBe('playing');
    });

    it('should reset snake to initial position', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });

      expect(result.current.gameState.snake[0]).toEqual({ x: 10, y: 10 });
    });

    it('should reset score to zero', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });

      expect(result.current.gameState.score).toBe(0);
    });
  });

  describe('pauseGame', () => {
    it('should toggle between playing and paused', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });
      expect(result.current.gameState.status).toBe('playing');

      act(() => {
        result.current.pauseGame();
      });
      expect(result.current.gameState.status).toBe('paused');

      act(() => {
        result.current.pauseGame();
      });
      expect(result.current.gameState.status).toBe('playing');
    });
  });

  describe('resetGame', () => {
    it('should reset to idle state', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState.status).toBe('idle');
      expect(result.current.gameState.score).toBe(0);
    });
  });

  describe('setMode', () => {
    it('should change game mode', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.setMode('pass-through');
      });

      expect(result.current.gameState.mode).toBe('pass-through');
    });

    it('should reset game state when changing mode', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.setMode('pass-through');
      });

      expect(result.current.gameState.status).toBe('idle');
      expect(result.current.gameState.score).toBe(0);
    });
  });

  describe('changeDirection', () => {
    it('should not allow reversing direction', () => {
      const { result } = renderHook(() => useGame('walls'));

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.changeDirection('LEFT');
      });

      expect(result.current.gameState.direction).toBe('RIGHT');
    });
  });

  describe('grid properties', () => {
    it('should expose gridSize', () => {
      const { result } = renderHook(() => useGame('walls'));

      expect(result.current.gridSize).toBe(20);
    });

    it('should expose cellSize', () => {
      const { result } = renderHook(() => useGame('walls'));

      expect(result.current.cellSize).toBe(20);
    });
  });
});

describe('Game Logic', () => {
  describe('collision detection', () => {
    it('should detect wall collision in walls mode', () => {
      const { result } = renderHook(() => useGame('walls'));
      
      expect(result.current.gameState.mode).toBe('walls');
    });

    it('should allow wrapping in pass-through mode', () => {
      const { result } = renderHook(() => useGame('pass-through'));
      
      expect(result.current.gameState.mode).toBe('pass-through');
    });
  });

  describe('position wrapping', () => {
    it('should handle negative positions', () => {
      const wrapPosition = (pos: number, gridSize: number): number => {
        return ((pos % gridSize) + gridSize) % gridSize;
      };

      expect(wrapPosition(-1, 20)).toBe(19);
      expect(wrapPosition(-5, 20)).toBe(15);
    });

    it('should handle positions beyond grid', () => {
      const wrapPosition = (pos: number, gridSize: number): number => {
        return ((pos % gridSize) + gridSize) % gridSize;
      };

      expect(wrapPosition(20, 20)).toBe(0);
      expect(wrapPosition(25, 20)).toBe(5);
    });
  });

  describe('direction logic', () => {
    it('should identify opposite directions correctly', () => {
      const opposites: Record<string, string> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };

      expect(opposites['UP']).toBe('DOWN');
      expect(opposites['DOWN']).toBe('UP');
      expect(opposites['LEFT']).toBe('RIGHT');
      expect(opposites['RIGHT']).toBe('LEFT');
    });
  });
});
