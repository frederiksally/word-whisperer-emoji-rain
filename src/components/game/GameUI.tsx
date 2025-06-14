
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { MAX_ROUNDS, MAX_GUESSES_PER_ROUND } from '@/hooks/useGameLogic';

export const GameUI = ({ gameLogic, lastUserTranscript, handleStopConversation }: any) => {
    const { states } = gameLogic;
    const {
        totalScore, roundNumber, guessedWords, gameStatus,
        wordToGuess, currentWord, finalMessage,
    } = states;

    const attemptsText = gameStatus === 'playing'
        ? `${guessedWords.length} / ${MAX_GUESSES_PER_ROUND}`
        : `${guessedWords.length}`;

    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="w-full grid grid-cols-3 text-center p-4 rounded-lg bg-muted border">
                <div>
                    <p className="text-sm font-semibold text-muted-foreground tracking-wider">TOTAL SCORE</p>
                    <p className="text-3xl font-bold">{totalScore}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-muted-foreground tracking-wider">ROUND</p>
                    <p className="text-3xl font-bold">{roundNumber} / {MAX_ROUNDS}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-muted-foreground tracking-wider">ATTEMPTS</p>
                    <p className="text-3xl font-bold">{attemptsText}</p>
                </div>
            </div>

            <div className="text-center">
                <p className="text-lg">I'm thinking of a word...</p>
                {currentWord?.category && <p className="text-sm text-muted-foreground">Hint: The category is "{currentWord.category}"</p>}
                <p className="text-4xl font-bold tracking-widest p-4">
                    {wordToGuess ? (gameStatus !== 'playing' ? wordToGuess : wordToGuess.split('').map(() => '_').join('')) : '...'}
                </p>
                {gameStatus === 'won' && <p className="text-green-500 font-bold text-lg">You won this round! The word was "{wordToGuess}"!</p>}
                {gameStatus === 'lost' && <p className="text-red-500 font-bold text-lg">Round over! The word was "{wordToGuess}"!</p>}
                {finalMessage && <p className="text-blue-500 font-bold text-lg">{finalMessage}</p>}
            </div>

            <div className="w-full p-4 border rounded-lg bg-background">
                <h3 className="font-semibold mb-2">Your Guesses:</h3>
                <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                    {guessedWords.length > 0 ? (
                        guessedWords.map((word: string, i: number) => {
                            const isCorrect = word === wordToGuess;
                            return (
                                <Badge key={i} variant={isCorrect ? "success" : "destructive"} className="flex items-center gap-1.5">
                                    {isCorrect ? <Check size={14} /> : <X size={14} />}
                                    <span>{word}</span>
                                </Badge>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground">No guesses yet. Say a word!</p>
                    )}
                </div>
            </div>

            <div className="w-full p-4 border rounded-lg bg-background">
                <h3 className="font-semibold mb-2">What I'm hearing:</h3>
                <p className="text-sm text-muted-foreground italic min-h-[20px]">
                    {lastUserTranscript || '...'}
                </p>
            </div>
            
            <Button onClick={handleStopConversation} variant="destructive">
                End Game
            </Button>
        </div>
    );
};
