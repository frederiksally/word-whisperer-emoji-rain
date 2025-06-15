import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MAX_ROUNDS } from '@/hooks/useGameLogic';
import { cn } from '@/lib/utils';

interface GameScoreProps {
  totalScore: number;
  roundNumber: number;
  attemptsText: string;
  isLowOnGuesses?: boolean;
}

export const GameScore = ({ totalScore, roundNumber, attemptsText, isLowOnGuesses = false }: GameScoreProps) => {
  const scoreRef = useRef<HTMLParagraphElement>(null);
  const scoreData = useRef({ value: totalScore });

  useEffect(() => {
    gsap.to(scoreData.current, {
      duration: 1.5,
      ease: 'power3.out',
      value: totalScore,
      onUpdate: () => {
        if (scoreRef.current) {
          scoreRef.current.textContent = String(Math.round(scoreData.current.value));
        }
      },
    });
  }, [totalScore]);

  useEffect(() => {
    // Set initial score without animation to avoid 0 -> score on mount
    scoreData.current.value = totalScore;
    if (scoreRef.current) {
        scoreRef.current.textContent = String(totalScore);
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 p-4 font-pilcrow text-white border-2 border-white rounded-lg shadow-xl z-50">
        <div className="flex items-center justify-center divide-x-2 divide-white/30">
            <div className="text-center px-8">
                <p className="text-sm uppercase tracking-widest text-white/80">Total Score</p>
                <p ref={scoreRef} className="text-5xl font-bold">{totalScore}</p>
            </div>
            <div className="text-center px-8">
                <p className="text-sm uppercase tracking-wider text-white/80">Round</p>
                <p className="text-5xl font-bold">{roundNumber}<span className="text-3xl opacity-75"> / {MAX_ROUNDS}</span></p>
            </div>
            <div className="text-center px-8">
                <p className="text-sm uppercase tracking-wider text-white/80">Attempts</p>
                <p className={cn(
                    "text-5xl font-bold transition-colors duration-300",
                    isLowOnGuesses && "text-yellow-400 animate-pulse"
                  )}
                >
                    {attemptsText}
                </p>
            </div>
        </div>
    </div>
  );
};
