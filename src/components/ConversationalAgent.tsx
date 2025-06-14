import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';

// Define the type for our word object
type Word = {
  word: string;
  category: string | null;
};

export const ConversationalAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [guessedWords, setGuessedWords] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  const [score, setScore] = useState(0);

  const wordToGuess = useMemo(() => currentWord?.word.toLowerCase() ?? '', [currentWord]);

  // Create a ref to hold the latest state, so we can pass stable callbacks
  const gameStateRef = useRef({ guessedWords, gameStatus, score, wordToGuess, currentWord });
  gameStateRef.current = { guessedWords, gameStatus, score, wordToGuess, currentWord };

  const resetGame = () => {
    setGuessedWords([]);
    setGameStatus('playing');
    setLastUserTranscript('');
    setScore(0);
    setCurrentWord(null);
  };

  const fetchNewWord = async () => {
    const { data, error } = await supabase.rpc('get_random_word');
    if (error || !data || data.length === 0) {
      console.error('Failed to fetch new word, using fallback.', error);
      toast.error("Couldn't fetch a word. Using a default one.");
      const fallbackWord = { word: 'lovable', category: 'Adjective' };
      setCurrentWord(fallbackWord);
      return fallbackWord;
    }
    const newWord = data[0];
    const wordData = { word: newWord.word, category: newWord.category };
    toast.info(`The new word is from the category: "${wordData.category}"`);
    setCurrentWord(wordData);
    return wordData;
  };

  // Important: For this to work, you must configure "Client Tools" in your
  // ElevenLabs agent settings. You'll need:
  // - "submitGuess" with one parameter: "word".
  // - "getGameStatus" with no parameters.
  // - "resetGame" with no parameters.
  const clientTools = useMemo(() => ({
    submitGuess: ({ word }: { word: string }) => {
      console.log('--- SUBMIT GUESS TOOL CALLED ---');
      console.log('Word received from agent:', word);
      const currentState = gameStateRef.current;
      console.log('State inside tool:', { 
        wordToGuess: currentState.wordToGuess,
        gameStatus: currentState.gameStatus,
        guessedWords: currentState.guessedWords.join(', '),
        score: currentState.score,
      });

      if (currentState.gameStatus === 'won') {
        return `The game is already over, the user won. The word was "${currentState.wordToGuess}". Instruct the user to say "new game" to play again.`;
      }

      if (!currentState.wordToGuess) {
        return "I'm still thinking of a word. Please give me a moment.";
      }
      const normalizedWord = word.toLowerCase().trim();
      
      if (!normalizedWord) {
          return "The user didn't say a clear word. Ask them to guess again.";
      }

      if (currentState.guessedWords.includes(normalizedWord)) {
        toast.info(`You already guessed "${normalizedWord}"`);
        return `The user already guessed the word ${normalizedWord}. Tell them to guess another word.`;
      }

      setGuessedWords(prevGuessedWords => [...prevGuessedWords, normalizedWord]);

      if (normalizedWord === currentState.wordToGuess) {
        const finalScore = Math.max(0, 100 - currentState.guessedWords.length * 10);
        setScore(finalScore);
        setGameStatus('won');
        toast.success(`You guessed it! The word was "${currentState.wordToGuess}"! You scored ${finalScore} points.`);
        return `The user's guess "${normalizedWord}" was CORRECT. They won. Congratulate them enthusiastically, tell them they scored ${finalScore} points, and instruct them to say "new game" to play again.`;
      } else {
        toast.error(`"${normalizedWord}" is not the word. Try again!`);
        return `The user's guess "${normalizedWord}" was INCORRECT. Encourage them to try again and give them a clever hint for the secret word.`;
      }
    },
    getGameStatus: () => {
      const { wordToGuess, gameStatus, score, guessedWords, currentWord } = gameStateRef.current;

      if (!wordToGuess) {
        return "The game is loading. I'm picking a word.";
      }
      if (gameStatus === 'won') {
        return `The game is already won. The word was "${wordToGuess}". The final score was ${score}. The user can start a new game by asking to reset.`;
      }

      const incorrectGuesses = guessedWords.filter(w => w !== wordToGuess).join(', ');
      
      let statusReport = `The secret word is "${wordToGuess}". The category is "${currentWord?.category}". The word has ${wordToGuess.length} letters. `;

      if (guessedWords.length === 0) {
        statusReport += `The user has not made any guesses yet. Encourage them to make their first guess.`;
      } else {
        statusReport += `The user has made ${guessedWords.length} guesses. The incorrect guesses so far are: ${incorrectGuesses || 'none'}. Encourage them to guess again, and maybe give them a hint.`;
      }
      return statusReport;
    },
    resetGame: async () => {
      resetGame();
      toast.info("New game started!");
      const newWordData = await fetchNewWord();
      if (!newWordData) {
        return "Sorry, I couldn't think of a new word right now. Please try again in a moment.";
      }
      return `The secret word for you to know is "${newWordData.word}". Now, tell the user the game has been reset. The new word is from the category "${newWordData.category}" and has ${newWordData.word.length} letters. Encourage them to make their first guess.`;
    }
  }), []); // Using an empty dependency array to make the tools object stable

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
    resetGame();
    try {
      await fetchNewWord();
      // 1. Prompt for microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted.');

      // 2. Fetch the signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-get-signed-url');
      if (error) throw error;
      if (!data.url) throw new Error('No URL returned from edge function.');

      console.log('Received signed URL. Starting session...');
      // 3. Start the conversation session with the signed URL
      await startSession({ 
        signedUrl: data.url 
      });
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
    resetGame();
  };

  const isConnected = status === 'connected';

  useEffect(() => {
    // Only reset the game if we are not connected AND not in the process of connecting.
    // This prevents clearing the state during the initial connection sequence.
    if (status !== 'connected' && !isConnecting) {
      resetGame();
    }
  }, [status, isConnecting]);

  return (
    <Card className="w-full max-w-lg mx-auto">
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
            <div className="w-full flex justify-around text-center p-4 rounded-lg bg-muted border">
              <div>
                <p className="text-sm font-semibold text-muted-foreground tracking-wider">SCORE</p>
                <p className="text-3xl font-bold">{score}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground tracking-wider">GUESSES</p>
                <p className="text-3xl font-bold">{guessedWords.length}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg">I'm thinking of a word...</p>
              {currentWord?.category && <p className="text-sm text-muted-foreground">Hint: The category is "{currentWord.category}"</p>}
              <p className="text-4xl font-bold tracking-widest p-4">
                {wordToGuess ? (gameStatus === 'won' ? wordToGuess : wordToGuess.split('').map(() => '_').join('')) : '...'}
              </p>
              {gameStatus === 'won' && <p className="text-green-500 font-bold text-lg">You won! The word was "{wordToGuess}"!</p>}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
