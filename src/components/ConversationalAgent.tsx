import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { LeaderboardPromptDialog } from './LeaderboardPromptDialog';
import { LeaderboardDisplay } from './LeaderboardDisplay';

// Define the type for our word object
type Word = {
  id: string;
  word: string;
  category: string | null;
};

// Game constants
const MAX_ROUNDS = 3;
const MAX_GUESSES_PER_ROUND = 10;

export const ConversationalAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [guessedWords, setGuessedWords] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  
  // Round-specific score
  const [score, setScore] = useState(0); 
  
  // Match-specific state
  const [totalScore, setTotalScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Leaderboard state
  const [showLeaderboardPrompt, setShowLeaderboardPrompt] = useState(false);
  const [showLeaderboardDisplay, setShowLeaderboardDisplay] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');

  const wordToGuess = useMemo(() => currentWord?.word.toLowerCase() ?? '', [currentWord]);

  // Create a ref to hold the latest state, so we can pass stable callbacks
  const gameStateRef = useRef({ 
    guessedWords, 
    gameStatus, 
    score, 
    wordToGuess, 
    currentWord,
    totalScore,
    roundNumber,
    matchId,
    currentSessionId,
  });
  gameStateRef.current = { 
    guessedWords, 
    gameStatus, 
    score, 
    wordToGuess, 
    currentWord,
    totalScore,
    roundNumber,
    matchId,
    currentSessionId,
  };

  const resetMatchState = () => {
    setGuessedWords([]);
    setGameStatus('playing');
    setLastUserTranscript('');
    setScore(0);
    setTotalScore(0);
    setCurrentWord(null);
    setRoundNumber(1);
    setMatchId(null);
    setCurrentSessionId(null);
    setShowLeaderboardPrompt(false);
    setShowLeaderboardDisplay(false);
    setFinalMessage('');
  };
  
  const resetRoundState = () => {
    setGuessedWords([]);
    setGameStatus('playing');
    setLastUserTranscript('');
    setScore(0);
    setCurrentWord(null);
  };

  const fetchNewWord = async (): Promise<Word | null> => {
    const { data, error } = await supabase.rpc('get_random_word');
    if (error || !data || data.length === 0) {
      console.error('Failed to fetch new word, using fallback.', error);
      toast.error("Couldn't fetch a word. Using a default one.");
      const fallbackWord = { id: 'fallback-id', word: 'lovable', category: 'Adjective' };
      setCurrentWord(fallbackWord);
      return fallbackWord;
    }
    const newWord = data[0];
    const wordData = { id: newWord.id, word: newWord.word, category: newWord.category };
    toast.info(`Round ${gameStateRef.current.roundNumber}: The new category is "${wordData.category}"`);
    setCurrentWord(wordData);
    return wordData;
  };

  const startNewRoundLogic = async (currentMatchId: string, currentRoundNumber: number) => {
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
              toast.error("Couldn't start the round. Please try again.");
              return null;
          }
          setCurrentSessionId(data.id);
          return newWordData;
      }
      return null;
  };
  
  const endGameAndCheckLeaderboard = async (finalScore: number) => {
    const { data, error } = await supabase
      .from('match_leaderboard')
      .select('total_score')
      .order('total_score', { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Could not fetch leaderboard scores.");
      setShowLeaderboardDisplay(true); // Fallback to just showing the board
      return;
    }

    const lowestTopScore = data.length > 0 ? data[data.length - 1].total_score : 0;

    if (data.length < 20 || finalScore > lowestTopScore) {
      setShowLeaderboardPrompt(true);
    } else {
      setFinalMessage("You didn't make the top 20 this time. Better luck next time!");
      setShowLeaderboardDisplay(true);
    }
  };

  const clientTools = useMemo(() => ({
    submitGuess: async ({ word }: { word: string }) => {
      console.log('--- SUBMIT GUESS TOOL CALLED ---');
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
      setGuessedWords(newGuessedWords);

      const updatePayload = {
          attempts: newGuessedWords.length,
          status: 'completed' as const,
          end_time: new Date().toISOString(),
      };

      if (normalizedWord === wordToGuess) {
        const roundScore = Math.max(0, 100 - guessedWords.length * 10);
        const newTotalScore = totalScore + roundScore;
        setScore(roundScore);
        setTotalScore(newTotalScore);
        setGameStatus('won');
        toast.success(`You guessed it! The word was "${wordToGuess}"! You scored ${roundScore} points.`);

        await supabase.from('game_sessions').update({ ...updatePayload, score: roundScore, correct_guess: wordToGuess }).eq('id', currentSessionId);

        if (roundNumber < MAX_ROUNDS) {
            return `The user's guess "${normalizedWord}" was CORRECT. They won the round and scored ${roundScore} points. Their total score is now ${newTotalScore}. Now, ask them if they are ready for the next round. If they give an affirmative answer, you MUST call the startNextRound tool.`;
        } else {
            endGameAndCheckLeaderboard(newTotalScore);
            return `The user's guess "${normalizedWord}" was CORRECT. They won the final round, scoring ${roundScore} points. This was the last round! Tell them the game is over and their final total score is ${newTotalScore}. The application will now show them the leaderboard results.`;
        }
      } else { // Incorrect guess
        if (newGuessedWords.length >= MAX_GUESSES_PER_ROUND) {
            setGameStatus('lost');
            toast.error(`Too many guesses! The word was "${wordToGuess}".`);
            await supabase.from('game_sessions').update(updatePayload).eq('id', currentSessionId);
            if (roundNumber < MAX_ROUNDS) {
                return `The user ran out of guesses. The round is over. The word was "${wordToGuess}". Tell them not to worry, and ask if they are ready for the next round. If they give an affirmative answer, you MUST call the startNextRound tool.`;
            } else {
                endGameAndCheckLeaderboard(totalScore);
                return `The user ran out of guesses on the final round. The game is over. The word was "${wordToGuess}". Tell them their final score is ${totalScore}, and the application will now show them the leaderboard results.`;
            }
        } else {
            toast.error(`"${normalizedWord}" is not the word. Try again!`);
            const guessesLeft = MAX_GUESSES_PER_ROUND - newGuessedWords.length;
            return `The user's guess "${normalizedWord}" was INCORRECT. They have ${guessesLeft} guesses left for this round. Encourage them to try again and give them a clever hint.`;
        }
      }
    },
    getGameStatus: () => {
      const { wordToGuess, gameStatus, score, guessedWords, currentWord, roundNumber, totalScore } = gameStateRef.current;

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
      
      let statusReport = `The secret word is "${wordToGuess}". We are in round ${roundNumber} of ${MAX_ROUNDS}. The total score is ${totalScore}. The category is "${currentWord?.category}". The word has ${wordToGuess.length} letters. The user has ${guessesLeft} guesses left. `;

      if (guessedWords.length === 0) {
        statusReport += `The user has not made any guesses yet.`;
      } else {
        statusReport += `The incorrect guesses so far are: ${incorrectGuesses || 'none'}.`;
      }
      return statusReport;
    },
    resetGame: async () => {
      const newMatchId = crypto.randomUUID();
      setMatchId(newMatchId);
      resetMatchState(); // Use the full reset
      setMatchId(newMatchId); // re-set matchId after reset
      
      const newWordData = await startNewRoundLogic(newMatchId, 1);
      if (!newWordData) {
        return "Sorry, I couldn't think of a new word right now. Please try again in a moment.";
      }
      
      toast.info("New game started!");
      return `The secret word for you to know is "${newWordData.word}". Now, tell the user a new game has started. This is round 1 of ${MAX_ROUNDS}. The new word is from the category "${newWordData.category}" and has ${newWordData.word.length} letters. Encourage them to make their first guess.`;
    },
    startNextRound: async () => {
      const { roundNumber, matchId, totalScore } = gameStateRef.current;
      if (!matchId) {
        return "The game hasn't started yet. The user needs to say 'start game' first.";
      }
      if (roundNumber >= MAX_ROUNDS) {
          endGameAndCheckLeaderboard(totalScore);
          return `The game is already over. You have completed all ${MAX_ROUNDS} rounds. Tell the user their final score is ${totalScore} and the application will now show them the leaderboard results.`;
      }

      const nextRound = roundNumber + 1;
      const newWordData = await startNewRoundLogic(matchId, nextRound);
      if (!newWordData) {
          return "Sorry, I couldn't get a new word. Please ask the user to try again in a moment.";
      }

      return `The secret word for round ${nextRound} is "${newWordData.word}". Now, tell the user that round ${nextRound} is starting. The category is "${newWordData.category}" and the word has ${newWordData.word.length} letters.`;
    }
  }), [endGameAndCheckLeaderboard]);

  const { startSession, endSession, status } = useConversation({
    onMessage: (message) => {
      if (message.source === 'user' && message.message) {
        setLastUserTranscript(message.message);
      }
    },
    clientTools,
  });

  const handleStartConversation = async () => {
    setIsConnecting(true);
    resetMatchState();
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted.');

      const { data, error } = await supabase.functions.invoke('elevenlabs-get-signed-url');
      if (error) throw error;
      if (!data.url) throw new Error('No URL returned from edge function.');

      console.log('Received signed URL. Starting session...');
      await startSession({ signedUrl: data.url });
      console.log('Session started.');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error(`Error starting conversation: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleStopConversation = () => {
    if (endSession) endSession();
    resetMatchState();
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
    if (status !== 'connected' && !isConnecting) {
      resetMatchState();
    }
  }, [status, isConnecting]);

  const attemptsText = gameStatus === 'playing' 
    ? `${guessedWords.length} / ${MAX_GUESSES_PER_ROUND}` 
    : `${guessedWords.length}`;

  if (showLeaderboardDisplay) {
    return <LeaderboardDisplay onPlayAgain={handlePlayAgain} />;
  }
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <LeaderboardPromptDialog
        isOpen={showLeaderboardPrompt}
        totalScore={totalScore}
        onClose={() => {
          setShowLeaderboardPrompt(false);
          setShowLeaderboardDisplay(true);
        }}
      />
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Word Guessing Game</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Talk to our AI agent to guess the secret word!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="text-sm font-mono p-2 bg-muted rounded">Status: {isConnecting ? 'Connecting...' : status}</div>
        
        {!isConnected ? (
            <Button onClick={handleStartConversation} disabled={isConnecting}>
                {isConnecting ? 'Starting...' : 'Start Game'}
            </Button>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            {!matchId ? (
                <div className="text-center p-8">
                    <p className="text-2xl font-bold">Say "Start Game" to begin!</p>
                </div>
            ) : (
            <>
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
                          guessedWords.map((word, i) => {
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
            </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
