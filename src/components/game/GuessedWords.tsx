
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePrevious } from '@/hooks/usePrevious';

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
                            if (!isCorrect) {
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

    return (
        <div className="h-full flex flex-col justify-center p-4 md:p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-muted-foreground self-start">Your Guesses:</h2>
            {guessedWords.length === 0 ? (
                <p className="text-lg text-muted-foreground">No guesses yet. Say a word!</p>
            ) : (
                <ul ref={listRef} className="space-y-4 w-full">
                    {guessedWords.map((word, index) => (
                        <li key={index} className="relative font-boxing text-5xl md:text-6xl text-foreground uppercase opacity-0">
                            <span>{word}</span>
                            {word !== wordToGuess && (
                                <div className="strike-through absolute top-1/2 left-0 w-full h-1 md:h-1.5 bg-red-500 transform -translate-y-1/2 origin-left scale-x-0"></div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
