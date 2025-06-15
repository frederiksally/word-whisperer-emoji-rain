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
import { BackgroundManager } from './game/BackgroundManager';
import GameWinOverlay from './game/GameWinOverlay';

export const ConversationalAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  const [showGameWinOverlay, setShowGameWinOverlay] = useState(false);
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

  const { guessedWords, wordToGuess, gameStatus, roundNumber, showLeaderboardDisplay, matchId, currentWord, totalScore, isAwaitingLeaderboard } = states;
  const prevGuessedWords = usePrevious(guessedWords) ?? [];
  const prevGameStatus = usePrevious(gameStatus);
  const prevShowLeaderboardDisplay = usePrevious(showLeaderboardDisplay);
  const prevMatchId = usePrevious(matchId);
  const prevCurrentWord = usePrevious(currentWord);
  const prevIsAwaitingLeaderboard = usePrevious(isAwaitingLeaderboard);

  const attemptsText = gameStatus === 'playing'
    ? `${guessedWords.length} / ${MAX_GUESSES_PER_ROUND}`
    : `${guessedWords.length}`;
  
  const isLowOnGuesses = gameStatus === 'playing' &&
    (MAX_GUESSES_PER_ROUND - guessedWords.length) <= 2 &&
    guessedWords.length > 0 &&
    guessedWords.length < MAX_GUESSES_PER_ROUND;

  // Toast on new theme
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

  // Sound and Toast on round end (for intermediate rounds)
  useEffect(() => {
    // This effect handles non-final rounds. The final round is handled
    // by the isAwaitingLeaderboard effect.
    if (prevGameStatus === 'playing' && gameStatus !== 'playing' && !isAwaitingLeaderboard) {
      if (gameStatus === 'won') {
        playSound('roundWin');
        showNotification({ message: `You won round ${roundNumber}!`, type: 'success' });
      } else if (gameStatus === 'lost') {
        playSound('roundLose');
        showNotification({ message: `Round over! The word was "${wordToGuess}".`, type: 'info' });
      }
    }
  }, [gameStatus, prevGameStatus, roundNumber, playSound, showNotification, wordToGuess, isAwaitingLeaderboard]);

  // Handle music changes
  useEffect(() => {
    if (matchId && matchId !== prevMatchId) {
      stopMusic(); // Stop any previous music
      playSound('gameStart');
      playMusic('roundMusic');
    }
    // When the leaderboard appears, stop round music and start leaderboard music.
    // This transition is now cleaner.
    if (showLeaderboardDisplay && !prevShowLeaderboardDisplay) {
      stopMusic();
      playMusic('leaderboardMusic');
    }
  }, [matchId, prevMatchId, showLeaderboardDisplay, prevShowLeaderboardDisplay, playSound, playMusic, stopMusic]);

  // NEW: This effect orchestrates the entire end-game cinematic sequence.
  useEffect(() => {
    if (isAwaitingLeaderboard && !prevIsAwaitingLeaderboard) {
      // The AI has signaled the game is over.
      if (gameStatus === 'won') {
        // --- Grand Win Sequence ---
        // 1. Play the final round win sound immediately.
        playSound('roundWin');
        showNotification({ message: `You won the final round!`, type: 'success', duration: 2000 });
        
        // 2. Pause briefly to let the round win sink in, then fade out round music.
        setTimeout(() => {
            stopMusic();
        }, 1000);

        // 3. After another pause, show the main "YOU WON" overlay.
        // This overlay handles its own 'gameWin' sound and animations.
        setTimeout(() => {
          setShowGameWinOverlay(true);
        }, 2500);

      } else {
        // --- Final Round Loss Sequence ---
        playSound('roundLose');
        showNotification({ message: `Round over! The word was "${wordToGuess}".`, type: 'info' });
        // Wait a bit before showing the leaderboard to let the loss register.
        setTimeout(() => {
          actions.displayLeaderboard(totalScore);
        }, 2000);
      }
    }
  }, [isAwaitingLeaderboard, prevIsAwaitingLeaderboard, gameStatus, actions, totalScore, showNotification, playSound, stopMusic, wordToGuess]);

  const handleStartConversation = async () => {
    setIsConnecting(true);
    setShowGameWinOverlay(false);
    
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
    setShowGameWinOverlay(false);
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
    return (
        <>
            <BackgroundManager 
                roundNumber={roundNumber}
                matchId={matchId}
                showLeaderboardDisplay={showLeaderboardDisplay}
            />
            <div className="w-full h-screen flex items-center justify-center p-4">
                <LeaderboardDisplay onPlayAgain={handlePlayAgain} />
            </div>
        </>
    );
  }
  
  return (
    <div className="w-full h-screen flex flex-col text-white">
      {showGameWinOverlay && <GameWinOverlay onAnimationComplete={() => {
        setShowGameWinOverlay(false);
        // This is the final step: show the leaderboard prompt/display
        actions.displayLeaderboard(totalScore);
      }} />}
      <BackgroundManager 
        roundNumber={roundNumber}
        matchId={matchId}
        showLeaderboardDisplay={showLeaderboardDisplay}
      />
      <LeaderboardPromptDialog
        isOpen={states.showLeaderboardPrompt}
        totalScore={states.totalScore}
        onClose={() => {
          setters.setShowLeaderboardPrompt(false);
          setters.setShowLeaderboardDisplay(true);
        }}
      />

      {!states.matchId ? (
         <div className="flex-grow flex flex-col items-center justify-center gap-6 p-6 relative overflow-hidden">
            <img 
              src="/graphics/tex-character.png" 
              alt="Tex the cowboy" 
              className="absolute bottom-56 left-[45%] -translate-x-[100%] w-[45%] max-w-lg z-10 pointer-events-none"
            />
            <div className="relative z-20 flex flex-col items-center justify-center gap-6 text-center">
              <img src="/graphics/guess-off-logo01.png" alt="Guess Off Logo" className="w-full max-w-xl" />
              <p className="text-white/80 max-w-md font-pilcrow text-lg">
                Welcome to The Great Guess-Off, partner.
                <br/>
                Tex is thinkin&apos; of a word — your job is to guess it before he roasts you into next week. Talk fast, think sharp, and don&apos;t let that cowboy outwit ya.
              </p>
              <Button 
                onClick={() => { playSound('buttonClick'); handleStartConversation(); }} 
                disabled={isConnecting} 
                size="lg" 
                className="font-boxing text-2xl uppercase animate-button-pulse bg-amber-500 hover:bg-amber-600 text-stone-900"
              >
                  {isConnecting ? 'Starting...' : 'Start Game'}
              </Button>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center z-20">
              <h3 className="font-pilcrow text-sm uppercase tracking-widest text-white/70 mb-2">Built With</h3>
              <div className="flex justify-center items-center gap-8">
                <img src="/graphics/lovable-logo.svg" alt="Lovable Logo" className="h-4" />
                <img src="/graphics/gemini-logo.svg" alt="Gemini Logo" className="h-8" />
                <img src="/graphics/elevenlabs-logo.svg" alt="ElevenLabs Logo" className="h-4" />
              </div>
            </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
            <img src="/graphics/guess-off-logo01.png" alt="Guess Off Logo" className="fixed top-4 left-4 h-16 w-auto z-20" />
            <GameScore 
                totalScore={totalScore}
                roundNumber={roundNumber}
                attemptsText={attemptsText}
                isLowOnGuesses={isLowOnGuesses}
            />
            <main className="flex-grow overflow-hidden relative">
                 {!isConnected ? (
                    <div className="text-center h-full flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold">Starting game..</p>
                    </div>
                ) : (
                  <GameUI 
                    gameLogic={gameLogic} 
                    lastUserTranscript={lastUserTranscript}
                    handleStopConversation={handleStopConversation}
                    isConnected={isConnected}
                  />
                )}
            </main>
        </div>
      )}
    </div>
  );
};
