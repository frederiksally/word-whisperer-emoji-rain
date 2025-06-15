import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LeaderboardPromptDialog } from './LeaderboardPromptDialog';
import { LeaderboardDisplay } from './LeaderboardDisplay';
import { useGameLogic, MAX_ROUNDS, MAX_GUESSES_PER_ROUND } from '@/hooks/useGameLogic';
import { useAIAgent } from '@/hooks/useAIAgent';
import { GameUI } from './game/GameUI';
import { useSound } from '@/contexts/SoundContext';
import { usePrevious } from '@/hooks/usePrevious';
import { useGameNotification } from '@/contexts/GameNotificationContext';
import { GameScore } from './game/GameScore';

export const ConversationalAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  const { playSound, playMusic, stopMusic } = useSound();
  const { showNotification } = useGameNotification();
  
  const gameLogic = useGameLogic();
  const { states, actions, setters } = gameLogic;
  const { startSession, endSession, status, clientTools } = useAIAgent(gameLogic, {
    onMessage: (message) => {
      if (message.source === 'user' && message.message) {
        setLastUserTranscript(message.message);
      }
    },
  });

  const { guessedWords, wordToGuess, gameStatus, roundNumber, showLeaderboardDisplay, matchId, currentWord, totalScore } = states;
  const prevGuessedWords = usePrevious(guessedWords) ?? [];
  const prevGameStatus = usePrevious(gameStatus);
  const prevShowLeaderboardDisplay = usePrevious(showLeaderboardDisplay);
  const prevMatchId = usePrevious(matchId);
  const prevCurrentWord = usePrevious(currentWord);

  const attemptsText = gameStatus === 'playing'
    ? `${guessedWords.length} / ${MAX_GUESSES_PER_ROUND}`
    : `${guessedWords.length}`;
  
  const isLowOnGuesses = gameStatus === 'playing' &&
    (MAX_GUESSES_PER_ROUND - guessedWords.length) <= 2 &&
    guessedWords.length > 0 &&
    guessedWords.length < MAX_GUESSES_PER_ROUND;

  // Toast on new category
  useEffect(() => {
    if (currentWord && currentWord.id !== prevCurrentWord?.id) {
      showNotification({ type: 'round-start', payload: { roundNumber } });
    }
  }, [currentWord, prevCurrentWord, roundNumber, showNotification]);

  // Sound on new guess
  useEffect(() => {
    if (matchId && guessedWords.length > prevGuessedWords.length) {
      const lastGuess = guessedWords[guessedWords.length - 1];
      if (lastGuess === wordToGuess) {
        playSound('guessCorrect');
        showNotification({ message: `You guessed it!`, type: 'success', duration: 2000 });
      } else {
        playSound('guessIncorrect');
        // User requested to remove feedback for incorrect guess
      }
    }
  }, [guessedWords, prevGuessedWords, wordToGuess, playSound, matchId, showNotification]);

  // Sound and Toast on round end
  useEffect(() => {
    if (prevGameStatus === 'playing' && gameStatus !== 'playing') {
      if (gameStatus === 'won') {
        playSound('roundWin');
        if (roundNumber === MAX_ROUNDS) {
          playSound('gameWin');
          showNotification({ message: 'Congratulations, you won the whole game!', type: 'success', duration: 5000 });
        } else {
          showNotification({ message: `You won round ${roundNumber}!`, type: 'success' });
        }
      } else if (gameStatus === 'lost') {
        playSound('roundLose');
        showNotification({ message: `Round over! The word was "${wordToGuess}".`, type: 'info' });
      }
    }
  }, [gameStatus, prevGameStatus, roundNumber, playSound, showNotification, wordToGuess]);

  // Handle music changes
  useEffect(() => {
    if (matchId && matchId !== prevMatchId) {
      stopMusic(); // Stop any previous music
      playSound('gameStart');
      playMusic('roundMusic');
    }
    if (showLeaderboardDisplay && !prevShowLeaderboardDisplay) {
      stopMusic();
      playMusic('leaderboardMusic');
    }
  }, [matchId, prevMatchId, showLeaderboardDisplay, prevShowLeaderboardDisplay, playSound, playMusic, stopMusic]);

  const handleStartConversation = async () => {
    setIsConnecting(true);
    
    actions.prepareNewMatch();

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke('elevenlabs-get-signed-url');
      if (error) throw error;
      if (!data.url) throw new Error('No URL returned from edge function.');

      await startSession({ signedUrl: data.url });

    } catch (error) {
      console.error('Failed to start conversation:', error);
      showNotification({ message: `Error starting conversation: ${error instanceof Error ? error.message : String(error)}`, type: 'error' });
      actions.resetMatchState();
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleStopConversation = () => {
    if (endSession) endSession();
    actions.resetMatchState();
    setLastUserTranscript('');
    stopMusic();
  };

  const handlePlayAgain = () => {
    if (isConnected) {
        clientTools.resetGame();
    } else {
        handleStartConversation();
    }
  }

  const isConnected = status === 'connected';

  useEffect(() => {
    // Only reset the match if the status is fully 'disconnected'
    // This prevents premature resets on temporary connection flickers
    if (status === 'disconnected' && !isConnecting && states.matchId && !states.showLeaderboardPrompt && !states.showLeaderboardDisplay) {
      showNotification({ message: "You have been disconnected from the agent.", type: 'error' });
      actions.resetMatchState();
      setLastUserTranscript('');
    }
  }, [status, isConnecting, actions, states.matchId, states.showLeaderboardPrompt, states.showLeaderboardDisplay, showNotification]);

  if (states.showLeaderboardDisplay) {
    return <LeaderboardDisplay onPlayAgain={handlePlayAgain} />;
  }
  
  return (
    <div className="w-full h-screen flex flex-col">
      <LeaderboardPromptDialog
        isOpen={states.showLeaderboardPrompt}
        totalScore={states.totalScore}
        onClose={() => {
          setters.setShowLeaderboardPrompt(false);
          setters.setShowLeaderboardDisplay(true);
        }}
      />

      {!states.matchId ? (
         <div className="flex-grow flex flex-col items-center justify-center gap-6 p-6">
            <h1 className="text-4xl font-bold font-boxing tracking-wider">Word Guessing Game</h1>
            <p className="text-muted-foreground max-w-md text-center">
              Talk to our AI agent to guess the secret word! Press Start Game and allow microphone access to begin.
            </p>
            <div className="text-sm font-mono p-2 bg-muted rounded">Status: {isConnecting ? 'Connecting...' : status}</div>
            <Button onClick={() => { playSound('buttonClick'); handleStartConversation(); }} disabled={isConnecting} size="lg">
                {isConnecting ? 'Starting...' : 'Start Game'}
            </Button>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
            <GameScore 
                totalScore={totalScore}
                roundNumber={roundNumber}
                attemptsText={attemptsText}
                isLowOnGuesses={isLowOnGuesses}
            />
            <header className="flex-shrink-0 py-2 px-8 border-b flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Word Guessing Game</h1>
                    <p className="text-sm text-muted-foreground">Round {states.roundNumber} of {MAX_ROUNDS}</p>
                </div>
                <div className="text-sm font-mono p-2 bg-muted rounded">Status: {isConnecting ? 'Connecting...' : status}</div>
            </header>
            <main className="flex-grow overflow-hidden">
                 {!isConnected ? (
                    <div className="text-center h-full flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold">Connecting to agent...</p>
                    </div>
                ) : (
                  <GameUI 
                    gameLogic={gameLogic} 
                    lastUserTranscript={lastUserTranscript}
                    handleStopConversation={handleStopConversation}
                  />
                )}
            </main>
        </div>
      )}
    </div>
  );
};
