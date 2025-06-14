
-- Add a column to group game sessions (which represent a single word/round) into a single "match".
ALTER TABLE public.game_sessions ADD COLUMN match_id UUID;

-- Add an index for faster lookups by match_id, which will be useful for calculating total scores.
CREATE INDEX idx_game_sessions_match_id ON public.game_sessions(match_id);
