import React from 'react';
import { Button } from '@/components/ui/button';
import { Direction } from '@/types/game';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  disabled?: boolean;
}

export function MobileControls({ onDirectionChange, disabled }: MobileControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-36 mx-auto mt-4 md:hidden">
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('UP')}
        disabled={disabled}
        className="neon-box h-12 w-12"
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('LEFT')}
        disabled={disabled}
        className="neon-box h-12 w-12"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('RIGHT')}
        disabled={disabled}
        className="neon-box h-12 w-12"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange('DOWN')}
        disabled={disabled}
        className="neon-box h-12 w-12"
      >
        <ChevronDown className="h-6 w-6" />
      </Button>
      <div />
    </div>
  );
}
