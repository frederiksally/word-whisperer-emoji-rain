import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LeaderboardPromptDialog } from './LeaderboardPromptDialog';
import { LeaderboardDisplay } from './LeaderboardDisplay';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAIAgent } from '@/hooks/useAIAgent';
import { GameUI } from './game/GameUI';

export const ConversationalAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  
  const gameLogic = useGameLogic();
  const { states, actions, setters } = gameLogic;
  const { startSession, endSession, status, clientTools } = useAIAgent(gameLogic, {
    onMessage: (message) => {
      if (message.source === 'user' && message.message) {
        setLastUserTranscript(message.message);
      }
    },
  });

  const handleStartConversation = async () => {
    setIsConnecting(true);
    
    const newWordData = await actions.startNewMatch();
    if (!newWordData) {
      toast.error("Could not start game. Please try again.");
      setIsConnecting(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke('elevenlabs-get-signed-url');
      if (error) throw error;
      if (!data.url) throw new Error('No URL returned from edge function.');

      await startSession({ signedUrl: data.url });

    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error(`Error starting conversation: ${error instanceof Error ? error.message : String(error)}`);
      actions.resetMatchState();
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleStopConversation = () => {
    if (endSession) endSession();
    actions.resetMatchState();
    setLastUserTranscript('');
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
    if (status !== 'connected' && !isConnecting && states.matchId) {
      actions.resetMatchState();
      setLastUserTranscript('');
    }
  }, [status, isConnecting, actions, states.matchId]);

  if (states.showLeaderboardDisplay) {
    return <LeaderboardDisplay onPlayAgain={handlePlayAgain} />;
  }
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <LeaderboardPromptDialog
        isOpen={states.showLeaderboardPrompt}
        totalScore={states.totalScore}
        onClose={() => {
          setters.setShowLeaderboardPrompt(false);
          setters.setShowLeaderboardDisplay(true);
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
        
        {!states.matchId ? (
            <Button onClick={handleStartConversation} disabled={isConnecting}>
                {isConnecting ? 'Starting...' : 'Start Game'}
            </Button>
        ) : (
          <>
            {!isConnected ? (
                <div className="text-center p-8">
                    <p className="text-2xl font-bold">Connecting to agent...</p>
                </div>
            ) : (
              <GameUI 
                gameLogic={gameLogic} 
                lastUserTranscript={lastUserTranscript}
                handleStopConversation={handleStopConversation}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
