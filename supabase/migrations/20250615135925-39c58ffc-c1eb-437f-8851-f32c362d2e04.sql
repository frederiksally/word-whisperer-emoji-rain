
-- Step 1: Reset the columns on the 'words' table to ensure a clean state.
ALTER TABLE public.words DROP COLUMN IF EXISTS category;
ALTER TABLE public.words DROP COLUMN IF EXISTS theme;
ALTER TABLE public.words ADD COLUMN theme TEXT;
ALTER TABLE public.words DROP COLUMN IF EXISTS clue;
ALTER TABLE public.words ADD COLUMN clue TEXT;

-- Step 2: Clear all existing words and any linked game session data.
TRUNCATE TABLE public.words RESTART IDENTITY CASCADE;

-- Step 3: Insert the curated 'Western' themed words.
INSERT INTO public.words (word, theme, clue, difficulty, emoji) VALUES
('cactus', 'Western', 'It''s prickly and lives in the desert.', 'easy', '🌵'),
('cowboy', 'Western', 'He rides a horse and says "howdy".', 'easy', '🤠'),
('saloon', 'Western', 'A place to get a drink in an old western movie.', 'medium', '🍺'),
('revolver', 'Western', 'A type of handgun favored by cowboys.', 'medium', '🔫'),
('desert', 'Western', 'A very, very dry place.', 'easy', '🏜️'),
('sheriff', 'Western', 'The lawman in a western town.', 'medium', '⭐'),
('wanted', 'Western', 'You might see this on a poster for a criminal.', 'medium', '📜'),
('tumbleweed', 'Western', 'It rolls through a dusty, deserted street.', 'hard', '🌿'),
('lasso', 'Western', 'A rope used to catch cattle.', 'medium', ' रस्सी'),
('canyon', 'Western', 'A big, deep valley carved by a river.', 'easy', '🏞️');

-- Step 4: Insert new 'Wild Frontier' themed words.
INSERT INTO public.words (word, theme, clue, difficulty, emoji) VALUES
('river', 'Wild Frontier', 'It flows through the land, and a cowboy might cross it on his horse.', 'easy', '🏞️'),
('mountain', 'Wild Frontier', 'A very large hill, often with a snowy peak. Prospectors searched them for gold.', 'easy', '⛰️'),
('forest', 'Wild Frontier', 'A large area covered chiefly with trees and undergrowth. Outlaws might hide here.', 'easy', '🌲'),
('star', 'Wild Frontier', 'Cowboys used these to navigate at night.', 'easy', '⭐'),
('wolf', 'Wild Frontier', 'It howls at the moon and travels in a pack.', 'medium', '🐺'),
('eagle', 'Wild Frontier', 'A large bird of prey with keen eyesight, soaring high above the canyons.', 'medium', '🦅'),
('bison', 'Wild Frontier', 'A large, shaggy-haired wild ox, once roaming the plains in huge herds.', 'hard', '🦬'),
('horse', 'Wild Frontier', 'A cowboy''s most trusted companion.', 'easy', '🐴'),
('moon', 'Wild Frontier', 'It lights up the prairie at night.', 'easy', '🌕'),
('bear', 'Wild Frontier', 'A large, heavy mammal that lives in forests and mountains. You wouldn''t want to surprise one.', 'medium', '🐻');

-- Step 5: Insert new 'Campfire' themed words.
INSERT INTO public.words (word, theme, clue, difficulty, emoji) VALUES
('fire', 'Campfire', 'Cowboys gather around this at night to keep warm and cook their grub.', 'easy', '🔥'),
('story', 'Campfire', 'Something you tell around the campfire, maybe a tall tale.', 'easy', '📖'),
('guitar', 'Campfire', 'A musical instrument for singing lonesome cowboy songs.', 'medium', '🎸'),
('coffee', 'Campfire', 'A hot, black drink cowboys brew over the fire in the morning.', 'medium', '☕'),
('lantern', 'Campfire', 'A lamp with a transparent case protecting the flame, used for light in the dark.', 'medium', '🏮'),
('whisper', 'Campfire', 'What the wind does through the pines at night.', 'hard', '🤫'),
('dream', 'Campfire', 'What a cowboy has when he''s asleep under the stars.', 'medium', '💭'),
('shadow', 'Campfire', 'The dark shapes that dance in the flickering firelight.', 'easy', '👥'),
('silence', 'Campfire', 'The sound of the vast, open prairie at midnight.', 'hard', '🤫'),
('night', 'Campfire', 'When the sun goes down and the stars come out.', 'easy', '🌃');

-- Step 6: Drop the old function definition before creating the new one.
DROP FUNCTION IF EXISTS public.get_random_word();

-- Step 7: Create the new 'get_random_word' function with the correct return type.
CREATE FUNCTION public.get_random_word()
RETURNS TABLE(id uuid, word text, theme text, clue text)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT w.id, w.word, w.theme, w.clue
    FROM public.words AS w
    WHERE w.theme IS NOT NULL AND w.clue IS NOT NULL
    ORDER BY random()
    LIMIT 1;
END;
$function$
