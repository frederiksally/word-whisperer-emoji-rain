
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePrevious } from '@/hooks/usePrevious';
import { Check } from 'lucide-react';

interface GuessedWordsProps {
    guessedWords: string[];
    wordToGuess: string;
}

export const GuessedWords: React.FC<GuessedWordsProps> = ({ guessedWords, wordToGuess }) => {
    const listRef = useRef<HTMLUListElement>(null);
    const prevGuessedWords = usePrevious(guessedWords) ?? [];

    useEffect(() => {
        if (!listRef.current) return;

        const newWordsCount = guessedWords.length - prevGuessedWords.length;
        if (newWordsCount > 0) {
            const newWordElements = Array.from(listRef.current.children).slice(-newWordsCount);
            
            newWordElements.forEach((wordEl, index) => {
                const word = guessedWords[prevGuessedWords.length + index];
                const isCorrect = word === wordToGuess;

                gsap.fromTo(wordEl, 
                    { opacity: 0, x: -50 }, 
                    { 
                        opacity: 1, 
                        x: 0,
                        duration: 0.6, 
                        ease: 'power3.out',
                        delay: index * 0.1,
                        onComplete: () => {
                            if (isCorrect) {
                                const checkEl = (wordEl as HTMLElement).querySelector('.check-mark');
                                if (checkEl) {
                                    gsap.fromTo(checkEl,
                                        { scale: 0.5, opacity: 0, rotate: -45 },
                                        { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.7)', delay: 0.2 }
                                    );
                                }
                                const scoreEl = (wordEl as HTMLElement).querySelector('.score-popup');
                                if (scoreEl) {
                                    gsap.fromTo(scoreEl,
                                        { opacity: 0, y: 10, scale: 0.8 },
                                        { opacity: 1, y: -20, scale: 1.2, duration: 0.6, ease: 'power3.out', delay: 0.4 }
                                    );
                                    gsap.to(scoreEl, 
                                        { opacity: 0, y: -50, scale: 0.8, duration: 0.5, ease: 'power2.in', delay: 1.5 }
                                    );
                                }
                            } else {
                                const strikeEl = (wordEl as HTMLElement).querySelector('.strike-through');
                                if (strikeEl) {
                                    gsap.fromTo(strikeEl, 
                                        { scaleX: 0 }, 
                                        { scaleX: 1, duration: 0.4, ease: 'power2.inOut', delay: 0.3 }
                                    );
                                }
                            }
                        }
                    }
                );
            });
        }
    }, [guessedWords, prevGuessedWords, wordToGuess]);

    const calculateScore = (numGuesses: number) => {
        // Score is 100 for 1st guess, 90 for 2nd, etc.
        return Math.max(0, 110 - numGuesses * 10);
    };

    return (
        <div className="h-full flex flex-col justify-center p-4 md:p-8 overflow-y-auto">
            {guessedWords.length > 0 && (
                <ul ref={listRef} className="space-y-4 w-full">
                    {guessedWords.map((word, index) => (
                        <li key={index} className="relative w-fit font-boxing text-5xl md:text-6xl text-white uppercase">
                            <span>{word}</span>
                            {word === wordToGuess && (
                                <>
                                    <Check className="check-mark absolute -right-12 top-1/2 -translate-y-1/2 h-10 w-10 text-green-500 opacity-0" />
                                    <span className="score-popup absolute -right-24 top-1/2 -translate-y-1/2 text-4xl font-bold text-yellow-400 opacity-0 pointer-events-none" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                        +{calculateScore(guessedWords.length)}
                                    </span>
                                </>
                            )}
                            {word !== wordToGuess && (
                                <div className="strike-through absolute top-1/2 left-0 w-full h-1.5 md:h-2 bg-white transform -translate-y-1/2 origin-left scale-x-0"></div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
