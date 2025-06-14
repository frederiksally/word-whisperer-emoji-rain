import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const ConversationalAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { startSession, status } = useConversation();

  const handleStartConversation = async () => {
    setIsConnecting(true);
    try {
      // 1. Prompt for microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted.');

      // 2. Fetch the signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-get-signed-url');
      if (error) throw error;
      if (!data.url) throw new Error('No URL returned from edge function.');
      
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error("VITE_ELEVENLABS_AGENT_ID is not set in the frontend environment variables.");
      }

      console.log('Received signed URL. Starting session...');
      // 3. Start the conversation session
      await startSession({ url: data.url });
      console.log('Session started.');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert(`Error starting conversation: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const isConnected = status === 'connected';

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-card text-card-foreground shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold">Conversational AI</h2>
        <p className="text-muted-foreground text-center">
            Click the button to start a conversation with our voice agent.
        </p>
        <div className="text-sm font-mono p-2 bg-muted rounded">Status: {isConnecting ? 'Connecting...' : status}</div>
        
        {!isConnected ? (
            <Button onClick={handleStartConversation} disabled={isConnecting}>
                {isConnecting ? 'Starting...' : 'Start Conversation'}
            </Button>
        ) : (
            <div className="flex items-center gap-4">
                {/* FIX: Removed mute button since isMuted/toggleMute are not available on the hook. */}
                <p className="text-green-500 font-semibold">Connected!</p>
            </div>
        )}
    </div>
  );
};
