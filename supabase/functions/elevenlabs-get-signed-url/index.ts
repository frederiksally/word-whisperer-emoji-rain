
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_AGENT_ID = Deno.env.get('VITE_ELEVENLABS_AGENT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not set in environment variables.");
    }
    if (!ELEVENLABS_AGENT_ID) {
        throw new Error("VITE_ELEVENLABS_AGENT_ID is not set in environment variables.");
    }
    
    console.log(`Requesting signed URL for agent ID: ${ELEVENLABS_AGENT_ID}`);

    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("xi-api-key", ELEVENLABS_API_KEY);

    const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: requestHeaders,
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`ElevenLabs API error: ${response.status} ${errorBody}`);
        throw new Error(`Failed to get signed URL from ElevenLabs: ${errorBody}`);
    }

    const body = await response.json();
    const url = body.signed_url;

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in elevenlabs-get-signed-url function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
