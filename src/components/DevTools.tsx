
import React from 'react';
import { Button } from './ui/button';

interface DevToolsProps {
  onTestWin: () => void;
  onTestLeaderboardPrompt: () => void;
  onTestLeaderboard: () => void;
}

export const DevTools = ({ onTestWin, onTestLeaderboard, onTestLeaderboardPrompt }: DevToolsProps) => {
  return (
    <div className="absolute bottom-4 right-4 z-[999] flex flex-col gap-2 p-4 bg-stone-900/80 border border-amber-500/30 rounded-lg shadow-lg">
      <h4 className="text-amber-400 font-bold text-center font-pilcrow tracking-wider">DEV TOOLS</h4>
      <Button variant="outline" size="sm" onClick={onTestWin} className="text-white border-white/20 hover:bg-white/10 hover:text-white">
        Test Win Sequence
      </Button>
      <Button variant="outline" size="sm" onClick={onTestLeaderboardPrompt} className="text-white border-white/20 hover:bg-white/10 hover:text-white">
        Test Leaderboard Prompt
      </Button>
      <Button variant="outline" size="sm" onClick={onTestLeaderboard} className="text-white border-white/20 hover:bg-white/10 hover:text-white">
        Test Leaderboard Display
      </Button>
    </div>
  );
};
