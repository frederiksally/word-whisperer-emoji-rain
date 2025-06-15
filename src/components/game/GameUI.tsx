
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSound } from '@/contexts/SoundContext';
import { GuessedWords } from './GuessedWords';
import { WordDisplay } from './WordDisplay';

export const GameUI = ({ gameLogic, lastUserTranscript, handleStopConversation }: any) => {
    const { states } = gameLogic;
    const { playSound } = useSound();
    const {
        guessedWords, gameStatus,
        wordToGuess, currentWord, finalMessage,
    } = states;

    return (
        <div className="w-full h-full flex flex-col md:flex-row relative">
            {/* Guessed words list. On desktop, it's an absolute sidebar. On mobile, it's a block at the top. */}
            <div className="w-full h-1/3 md:absolute md:left-0 md:top-0 md:w-1/3 md:h-full">
                <GuessedWords guessedWords={guessedWords} wordToGuess={wordToGuess} />
            </div>

            {/* Main content area. Takes full page width on desktop to allow for true centering. */}
            <div className="w-full h-2/3 md:h-full flex flex-col items-center justify-end md:justify-center gap-4 md:gap-8 p-4">
                 <div className="flex-grow flex items-center justify-center w-full">
                    <WordDisplay
                        wordToGuess={wordToGuess}
                        gameStatus={gameStatus}
                        category={currentWord?.category}
                        guessedWords={guessedWords}
                        finalMessage={finalMessage}
                    />
                 </div>
                
                <div className="w-full max-w-md">
                    <div className="w-full p-4 border rounded-lg bg-black/30 border-white/20 mb-4">
                        <h3 className="font-semibold mb-2">What I'm hearing:</h3>
                        <p className="text-sm text-white/70 italic min-h-[20px]">
                            {lastUserTranscript || '...'}
                        </p>
                    </div>
                    
                    <Button onClick={() => { playSound('buttonClick'); handleStopConversation(); }} variant="destructive" className="w-full">
                        End Game
                    </Button>
                </div>
            </div>
        </div>
    );
};
