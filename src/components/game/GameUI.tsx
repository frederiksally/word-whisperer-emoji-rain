
import React from 'react';
import { Button } from '@/components/ui/button';
import { GuessedWords } from './GuessedWords';
import { WordDisplay } from './WordDisplay';
import { TexAvatar } from './TexAvatar';

export const GameUI = ({ gameLogic, lastUserTranscript, handleStopConversation, isConnected }: { gameLogic: any, lastUserTranscript: string, handleStopConversation: () => void, isConnected: boolean }) => {
    const { states } = gameLogic;
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
            
            {/* Tex Avatar - shows on desktop */}
            <div className="absolute bottom-8 right-8 z-20 hidden md:block">
                <TexAvatar isConnected={isConnected} />
            </div>

            {/* Main content area. Takes full page width on desktop to allow for true centering. */}
            <div className="w-full h-2/3 md:h-full flex flex-col items-center justify-end md:justify-center gap-4 md:gap-8 p-4">
                 <div className="flex-grow flex items-center justify-center w-full">
                    <WordDisplay
                        wordToGuess={wordToGuess}
                        gameStatus={gameStatus}
                        theme={currentWord?.theme}
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
                    
                    <Button onClick={handleStopConversation} variant="destructive" size="lg" className="w-full font-boxing text-2xl uppercase">
                        End Game
                    </Button>
                </div>
            </div>
        </div>
    );
};
