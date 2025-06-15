import { useMemo, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MAX_ROUNDS, MAX_GUESSES_PER_ROUND } from './useGameLogic';

// Since the options type is not exported from @11labs/react, we define it here based on usage.
type AIAgentConversationOptions = {
  onMessage?: (message: { source: string; message?: string; [key: string]: any }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (message: string, context?: any) => void;
  overrides?: any;
};

// This hook requires the return value of useGameLogic as an argument
export const useAIAgent = (gameLogic: any, options?: AIAgentConversationOptions) => {
  const { states, setters, actions } = gameLogic;
  const {
    currentWord, guessedWords, gameStatus, score, totalScore, roundNumber,
    matchId, currentSessionId, wordToGuess,
  } = states;

  const gameStateRef = useRef(states);
  gameStateRef.current = states;

  const clientTools = useMemo(() => ({
    submitGuess: async ({ word }: { word: string }) => {
      const currentState = gameStateRef.current;
      const { wordToGuess, gameStatus, guessedWords, currentSessionId, roundNumber, totalScore } = currentState;

      if (gameStatus === 'won' || gameStatus === 'lost') {
        return `The round is already over. The word was "${wordToGuess}". Ask the user if they are ready for the next round. If they give an affirmative answer, call the startNextRound tool.`;
      }
      if (!wordToGuess || !currentSessionId) {
        return "I'm still thinking of a word. Please give me a moment.";
      }
      
      const normalizedWord = word.toLowerCase().trim();
      if (!normalizedWord) {
          return "The user didn't say a clear word. Ask them to guess again.";
      }
      if (guessedWords.includes(normalizedWord)) {
        toast.info(`You already guessed "${normalizedWord}"`);
        return `The user already guessed the word ${normalizedWord}. Tell them to guess another word.`;
      }

      const newGuessedWords = [...guessedWords, normalizedWord];
      setters.setGuessedWords(newGuessedWords);

      const updatePayload = {
          attempts: newGuessedWords.length,
          status: 'completed' as const,
          end_time: new Date().toISOString(),
      };

      if (normalizedWord === wordToGuess) {
        // The score is 100 for the first guess, 90 for the second, and so on.
        const roundScore = Math.max(0, 110 - newGuessedWords.length * 10);
        const newTotalScore = totalScore + roundScore;
        setters.setScore(roundScore);
        setters.setTotalScore(newTotalScore);
        setters.setGameStatus('won');
        toast.success(`You guessed it! The word was "${wordToGuess}"! You scored ${roundScore} points.`);

        await supabase.from('game_sessions').update({ ...updatePayload, score: roundScore, correct_guess: wordToGuess }).eq('id', currentSessionId);

        if (roundNumber < MAX_ROUNDS) {
            return `The user's guess "${normalizedWord}" was CORRECT. They won the round and scored ${roundScore} points. Their total score is now ${newTotalScore}. Now, ask them if they are ready for the next round. If they give an affirmative answer, you MUST call the startNextRound tool.`;
        } else {
            actions.endGameAndCheckLeaderboard(newTotalScore);
            return `The user's guess "${normalizedWord}" was CORRECT. They won the final round, scoring ${roundScore} points. This was the last round! Their final total score is ${newTotalScore}. Thanks for playin', and have yourself a mighty fine day! [system: end_call]`;
        }
      } else {
        if (newGuessedWords.length >= MAX_GUESSES_PER_ROUND) {
            setters.setGameStatus('lost');
            toast.error(`Too many guesses! The word was "${wordToGuess}".`);
            await supabase.from('game_sessions').update(updatePayload).eq('id', currentSessionId);
            if (roundNumber < MAX_ROUNDS) {
                return `The user ran out of guesses. The round is over. The word was "${wordToGuess}". Tell them not to worry, and ask if they are ready for the next round. If they give an affirmative answer, you MUST call the startNextRound tool.`;
            } else {
                actions.endGameAndCheckLeaderboard(totalScore);
                return `The user ran out of guesses on the final round. The game is over. The word was "${wordToGuess}". Their final score is ${totalScore}. Thanks for playin', and have yourself a mighty fine day! [system: end_call]`;
            }
        } else {
            toast.error(`"${normalizedWord}" is not the word. Try again!`);
            const guessesLeft = MAX_GUESSES_PER_ROUND - newGuessedWords.length;
            return `The user's guess "${normalizedWord}" was INCORRECT. They have ${guessesLeft} guesses left for this round. Encourage them to try again. Use the secret clue to give them a clever hint.`;
        }
      }
    },
    getGameStatus: () => {
      const { wordToGuess, gameStatus, guessedWords, currentWord, roundNumber, totalScore, matchId } = gameStateRef.current;

      if (!matchId) {
        return "The game hasn't started yet. The user needs to say 'start game'.";
      }
      if (gameStatus === 'won' || gameStatus === 'lost') {
        return `The round is over. The word was "${wordToGuess}". The user's total score is ${totalScore}. The user can start the next round by saying "next word" or see the leaderboard if the game is over.`;
      }
      if (!wordToGuess) {
        return "The game is loading. I'm picking a word.";
      }
      
      const incorrectGuesses = guessedWords.filter(w => w !== wordToGuess).join(', ');
      const guessesLeft = MAX_GUESSES_PER_ROUND - guessedWords.length;
      
      let statusReport = `The secret word is "${wordToGuess}". The secret clue for you to use is "${currentWord?.clue}". We are in round ${roundNumber} of ${MAX_ROUNDS}. The total score is ${totalScore}. The theme is "${currentWord?.theme}". The word has ${wordToGuess.length} letters. The user has ${guessesLeft} guesses left. `;

      if (guessedWords.length === 0) {
        statusReport += `The user has not made any guesses yet.`;
      } else {
        statusReport += `The incorrect guesses so far are: ${incorrectGuesses || 'none'}.`;
      }
      return statusReport;
    },
    resetGame: async () => {
      const newWordData = await actions.startNewMatch();
      if (!newWordData) {
        return "Sorry, I couldn't think of a new word right now. Please try again in a moment.";
      }
      
      toast.info("New game started!");
      return `The secret word for you to know is "${newWordData.word}" and the secret clue is "${newWordData.clue}". Now, tell the user a new game has started. This is round 1 of ${MAX_ROUNDS}. The new word is from the theme "${newWordData.theme}" and has ${newWordData.word.length} letters. Encourage them to make their first guess.`;
    },
    startNextRound: async () => {
      const { roundNumber, matchId, totalScore } = gameStateRef.current;
      if (!matchId) {
        return "The game hasn't started yet. The user needs to say 'start game' first.";
      }
      if (roundNumber >= MAX_ROUNDS) {
          actions.endGameAndCheckLeaderboard(totalScore);
          return `The game is already over. You have completed all ${MAX_ROUNDS} rounds. Their final score is ${totalScore}. Thanks for playin', and have yourself a mighty fine day! [system: end_call]`;
      }

      const nextRound = roundNumber + 1;
      const newWordData = await actions.startNewRoundLogic(matchId, nextRound);
      if (!newWordData) {
          return "Sorry, I couldn't get a new word. Please ask the user to try again in a moment.";
      }

      return `The secret word for round ${nextRound} is "${newWordData.word}" and the secret clue is "${newWordData.clue}". Now, tell the user that round ${nextRound} is starting. The theme is "${newWordData.theme}" and the word has ${newWordData.word.length} letters.`;
    }
  }), [gameLogic]);

  const { startSession, endSession, status, isSpeaking } = useConversation({
    ...options,
    clientTools,
  });

  return {
    startSession,
    endSession,
    status,
    clientTools,
    isSpeaking,
  };
};
