
CREATE OR REPLACE FUNCTION get_random_word()
RETURNS TABLE (
    id uuid,
    word text,
    difficulty public.difficulty_level,
    category text,
    emoji text
) AS $$
BEGIN
    RETURN QUERY
    SELECT w.id, w.word, w.difficulty, w.category, w.emoji
    FROM public.words AS w
    ORDER BY random()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
