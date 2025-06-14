
-- Create a new table for the match-based leaderboard
CREATE TABLE public.match_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  email TEXT,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comments to explain the purpose of the table and columns
COMMENT ON TABLE public.match_leaderboard IS 'Stores leaderboard entries for multi-round game matches.';
COMMENT ON COLUMN public.match_leaderboard.player_name IS 'The name of the player.';
COMMENT ON COLUMN public.match_leaderboard.email IS 'The email of the player (optional).';
COMMENT ON COLUMN public.match_leaderboard.total_score IS 'The final score for the entire match.';

-- Enable Row Level Security
ALTER TABLE public.match_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read the leaderboard entries.
CREATE POLICY "Allow public read access to leaderboard"
  ON public.match_leaderboard
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert a new score.
-- The application logic will control *who* gets prompted to insert their score.
CREATE POLICY "Allow anonymous inserts to leaderboard"
  ON public.match_leaderboard
  FOR INSERT
  WITH CHECK (true);
