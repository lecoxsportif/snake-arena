import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, LogOut, Trophy, Eye, Gamepad2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onNavigate: (view: 'game' | 'leaderboard' | 'spectate') => void;
  currentView: string;
}

export function Header({ onOpenAuth, onNavigate, currentView }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuthContext();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('game')}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center neon-box">
            <span className="font-pixel text-lg neon-text">🐍</span>
          </div>
          <h1 className="font-pixel text-xl neon-text hidden sm:block group-hover:animate-flicker">
            SNAKE
          </h1>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button
            variant={currentView === 'game' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('game')}
            className="font-pixel text-xs"
          >
            <Gamepad2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Play</span>
          </Button>
          <Button
            variant={currentView === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('leaderboard')}
            className="font-pixel text-xs"
          >
            <Trophy className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Scores</span>
          </Button>
          <Button
            variant={currentView === 'spectate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavigate('spectate')}
            className="font-pixel text-xs"
          >
            <Eye className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Watch</span>
          </Button>
        </nav>

        {/* User menu */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-foreground">{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="font-medium text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">High Score</p>
                <p className="font-pixel text-sm text-primary">{user.highScore}</p>
              </div>
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground">Games Played</p>
                <p className="text-sm">{user.gamesPlayed}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenAuth('login')}
              className="font-pixel text-xs"
            >
              Login
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenAuth('signup')}
              className="neon-box font-pixel text-xs"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
