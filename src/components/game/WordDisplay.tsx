
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { usePrevious } from '@/hooks/usePrevious';

interface WordDisplayProps {
    wordToGuess: string;
    gameStatus: 'playing' | 'won' | 'lost';
    category: string | null | undefined;
    guessedWords: string[];
    finalMessage: string;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({ wordToGuess, gameStatus, category, guessedWords, finalMessage }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const prevGuessedWords = usePrevious(guessedWords) ?? [];
    const prevGameStatus = usePrevious(gameStatus);
    const prevWordToGuess = usePrevious(wordToGuess);

    useEffect(() => {
        if (wordToGuess) {
            letterRefs.current = letterRefs.current.slice(0, wordToGuess.length);
        }
    }, [wordToGuess]);

    // Animate letters in on new word
    useEffect(() => {
        const isNewWord = wordToGuess && wordToGuess !== prevWordToGuess;
        if (isNewWord && gameStatus === 'playing') {
            gsap.fromTo(letterRefs.current,
                { y: -20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: 'back.out(1.7)'
                }
            );
        }
    }, [wordToGuess, prevWordToGuess, gameStatus]);

    // Animate wrong guess with a shake
    useEffect(() => {
        if (gameStatus === 'playing' && guessedWords.length > prevGuessedWords.length) {
            const lastGuess = guessedWords[guessedWords.length - 1];
            if (lastGuess !== wordToGuess?.toLowerCase()) {
                gsap.fromTo(containerRef.current,
                    { x: 0 },
                    {
                        x: 10,
                        duration: 0.08,
                        repeat: 5,
                        yoyo: true,
                        ease: 'power1.inOut'
                    }
                );
            }
        }
    }, [guessedWords, prevGuessedWords, wordToGuess, gameStatus]);
    
    // Animate word reveal on win/loss
    useEffect(() => {
        if (prevGameStatus === 'playing' && (gameStatus === 'won' || gameStatus === 'lost')) {
            const tl = gsap.timeline();
            letterRefs.current.forEach((el, index) => {
                if(!el) return;
                const blank = el.querySelector('.letter-blank');
                const letter = el.querySelector('.letter-char');
                tl.to(blank, {
                    y: 20,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in'
                }, index * 0.05);
                tl.fromTo(letter, 
                    { y: -20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' },
                    '>-0.2'
                );
            });
        }
    }, [gameStatus, prevGameStatus]);

    const characters = wordToGuess ? wordToGuess.split('') : [];

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center gap-4 p-4 text-center">
            <p className="text-lg">I'm thinking of a word...</p>
            {category && <p className="text-sm text-white/70">Hint: The category is "{category}"</p>}
            <div className="flex justify-center items-center gap-2 md:gap-4 p-4 min-h-[5rem]">
                {characters.length > 0 ? characters.map((char, index) => (
                    <span
                        key={index}
                        ref={el => letterRefs.current[index] = el}
                        className="relative text-4xl md:text-6xl font-bold font-boxing tracking-widest text-white w-[1ch] h-[1.2em]"
                    >
                        <span className="letter-blank absolute inset-0 flex items-center justify-center">{gameStatus === 'playing' ? '_' : ''}</span>
                        <span className="letter-char absolute inset-0 flex items-center justify-center opacity-0">{char}</span>
                    </span>
                )) : <p className="text-4xl font-bold tracking-widest p-4">...</p>}
            </div>
            {gameStatus === 'won' && <p className="text-green-500 font-bold text-lg mt-4 animate-scale-in">You won this round! The word was "{wordToGuess}"!</p>}
            {gameStatus === 'lost' && <p className="text-red-500 font-bold text-lg mt-4 animate-scale-in">Round over! The word was "{wordToGuess}"!</p>}
            {finalMessage && <p className="text-blue-500 font-bold text-lg mt-4 animate-scale-in">{finalMessage}</p>}
        </div>
    );
};
