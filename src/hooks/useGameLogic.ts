import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the type for our word object
type Word = {
  id: string;
  word: string;
  category: string | null;
};

// Game constants
export const MAX_ROUNDS = 3;
export const MAX_GUESSES_PER_ROUND = 10;

export const useGameLogic = () => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [guessedWords, setGuessedWords] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0); 
  const [totalScore, setTotalScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showLeaderboardPrompt, setShowLeaderboardPrompt] = useState(false);
  const [showLeaderboardDisplay, setShowLeaderboardDisplay] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const [isAwaitingLeaderboard, setIsAwaitingLeaderboard] = useState(false);

  const wordToGuess = currentWord?.word.toLowerCase() ?? '';

  const resetMatchState = useCallback(() => {
    setGuessedWords([]);
    setGameStatus('playing');
    setScore(0);
    setTotalScore(0);
    setCurrentWord(null);
    setRoundNumber(1);
    setMatchId(null);
    setCurrentSessionId(null);
    setShowLeaderboardPrompt(false);
    setShowLeaderboardDisplay(false);
    setFinalMessage('');
    setIsAwaitingLeaderboard(false);
  }, []);
  
  const resetRoundState = () => {
    setGuessedWords([]);
    setGameStatus('playing');
    setScore(0);
    setCurrentWord(null);
  };

  const fetchNewWord = useCallback(async (): Promise<Word | null> => {
    const { data, error } = await supabase.rpc('get_random_word');
    if (error || !data || data.length === 0) {
      console.error('Failed to fetch new word, using fallback.', error);
      const fallbackWord = { id: 'fallback-id', word: 'lovable', category: 'Adjective' };
      setCurrentWord(fallbackWord);
      return fallbackWord;
    }
    const newWord = data[0];
    const wordData = { id: newWord.id, word: newWord.word, category: newWord.category };
    setCurrentWord(wordData);
    return wordData;
  }, []);

  const startNewRoundLogic = useCallback(async (currentMatchId: string, currentRoundNumber: number) => {
    resetRoundState();
    setRoundNumber(currentRoundNumber);

    const newWordData = await fetchNewWord();
    if (newWordData) {
        const { data, error } = await supabase
            .from('game_sessions')
            .insert({ word_id: newWordData.id, match_id: currentMatchId, status: 'active' })
            .select('id')
            .single();
        if (error || !data) {
            console.error('Failed to create game session', error);
            return null;
        }
        setCurrentSessionId(data.id);
        return newWordData;
    }
    return null;
  }, [fetchNewWord]);
  
  const prepareNewMatch = useCallback(() => {
    resetMatchState();
    const newMatchId = crypto.randomUUID();
    setMatchId(newMatchId);
  }, [resetMatchState]);
  
  const startNewMatch = useCallback(async () => {
    const newMatchId = crypto.randomUUID();
    resetMatchState();
    setMatchId(newMatchId);
    
    const newWordData = await startNewRoundLogic(newMatchId, 1);
    
    if (!newWordData) {
        setMatchId(null);
        return null;
    }
    return newWordData;
  }, [resetMatchState, startNewRoundLogic]);

  const displayLeaderboard = useCallback(async (finalScore: number) => {
    const { data, error } = await supabase
      .from('match_leaderboard')
      .select('total_score')
      .order('total_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Could not fetch leaderboard scores.", error);
      setShowLeaderboardDisplay(true);
      return;
    }

    const lowestTopScore = data.length > 0 ? data[data.length - 1].total_score : 0;
    if (data.length < 20 || finalScore > lowestTopScore) {
      setShowLeaderboardPrompt(true);
    } else {
      setFinalMessage("You didn't make the top 20 this time. Better luck next time!");
      setShowLeaderboardDisplay(true);
    }
  }, []);

  // This function is what the AI will call. It just kicks off the frontend sequence.
  const endGameAndCheckLeaderboard = useCallback(async (finalScore: number) => {
    setIsAwaitingLeaderboard(true);
  }, []);

  return {
    states: {
      currentWord,
      guessedWords,
      gameStatus,
      score,
      totalScore,
      roundNumber,
      matchId,
      currentSessionId,
      showLeaderboardPrompt,
      showLeaderboardDisplay,
      finalMessage,
      wordToGuess,
      isAwaitingLeaderboard,
    },
    setters: {
      setCurrentWord,
      setGuessedWords,
      setGameStatus,
      setScore,
      setTotalScore,
      setRoundNumber,
      setMatchId,
      setCurrentSessionId,
      setShowLeaderboardPrompt,
      setShowLeaderboardDisplay,
      setFinalMessage,
      setIsAwaitingLeaderboard,
    },
    actions: {
      prepareNewMatch,
      resetMatchState,
      resetRoundState,
      fetchNewWord,
      startNewRoundLogic,
      endGameAndCheckLeaderboard,
      startNewMatch,
      displayLeaderboard,
    },
  };
};
