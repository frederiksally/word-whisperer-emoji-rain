
export const soundConfig = {
  // Background Music
  roundMusic: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/background-music.mp3',
  leaderboardMusic: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/leaderboardmusic.mp3',

  // Sound Effects
  guessCorrect: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/correct-answer.mp3',
  guessIncorrect: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/wrong-answer.mp3',
  roundWin: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/level-win.mp3',
  roundLose: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/level-lose.mp3',
  gameWin: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/game-win.mp3',

  // UI Sounds
  buttonClick: 'https://cdn.lovable.dev/sounds/ui/button-click.wav',
  gameStart: 'https://cdn.jsdelivr.net/gh/lovable-demos/word-guessing-game/game-start.mp3',
};

export type SoundKey = keyof typeof soundConfig;
