
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MAX_ROUNDS } from '@/hooks/useGameLogic';

interface GameScoreProps {
  totalScore: number;
  roundNumber: number;
  attemptsText: string;
}

export const GameScore = ({ totalScore, roundNumber, attemptsText }: GameScoreProps) => {
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
    <div className="fixed top-4 right-4 p-4 font-pilcrow text-white bg-black/50 backdrop-blur-sm border-2 border-white rounded-lg shadow-xl z-50 text-center w-48">
        <div className="mb-2">
            <p className="text-sm uppercase tracking-widest text-white/80">Total Score</p>
            <p ref={scoreRef} className="text-4xl font-bold">{totalScore}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <p className="uppercase tracking-wider text-white/80">Round</p>
                <p className="text-lg font-bold">{roundNumber} / {MAX_ROUNDS}</p>
            </div>
            <div>
                <p className="uppercase tracking-wider text-white/80">Attempts</p>
                <p className="text-lg font-bold">{attemptsText}</p>
            </div>
        </div>
    </div>
  );
};
