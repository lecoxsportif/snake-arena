import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../src/hooks/useAuth';

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
    });

    it('should start with no user', async () => {
      // localStorage is empty by default due to beforeEach

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from localStorage if exists', async () => {
      const mockUser = {
        id: '1',
        username: 'TestUser',
        email: 'test@test.com',
        highScore: 100,
        gamesPlayed: 5,
        createdAt: '2024-01-01',
      };
      localStorage.setItem('snake_user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should set user on successful login', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'pixel@game.com',
          password: 'password123',
        });
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.username).toBe('PixelMaster');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set error on failed login', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'invalid@email.com',
          password: 'password123',
        });
      });

      expect(result.current.error).toBe('Invalid email or password');
      expect(result.current.user).toBeNull();
    });
  });

  describe('signup', () => {
    it('should set user on successful signup', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signup({
          email: 'newuser@test.com',
          password: 'password123',
          username: 'NewPlayer',
        });
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.username).toBe('NewPlayer');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set error on failed signup', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signup({
          email: 'pixel@game.com',
          password: 'password123',
          username: 'AnotherUsername',
        });
      });

      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear user on logout', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'pixel@game.com',
          password: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'invalid@email.com',
          password: 'password123',
        });
      });

      expect(result.current.error).toBe('Invalid email or password');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
