
import React from 'react';
import { cn } from '@/lib/utils';

interface BackgroundManagerProps {
  roundNumber: number;
  matchId: string | null;
  showLeaderboardDisplay: boolean;
}

const backgrounds = {
  preGame: '/graphics/pre-game.jpg',
  round1: '/graphics/round-1.jpg',
  round2: '/graphics/round-2.jpg',
  round3: '/graphics/round-3.jpg',
  leaderboard: '/graphics/leaderboard.jpg',
};

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({ roundNumber, matchId, showLeaderboardDisplay }) => {
  const getActiveBackground = () => {
    if (showLeaderboardDisplay) return 'leaderboard';
    if (!matchId) return 'preGame';
    if (roundNumber === 1) return 'round1';
    if (roundNumber === 2) return 'round2';
    if (roundNumber === 3) return 'round3';
    return 'preGame'; // fallback
  };

  const activeBgKey = getActiveBackground();

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {Object.entries(backgrounds).map(([key, src]) => (
        <img
          key={key}
          src={src}
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out',
            key === activeBgKey ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
      <div className="absolute inset-0 w-full h-full bg-black/50" />
    </div>
  );
};
