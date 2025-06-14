
export const soundConfig = {
  // Background Music
  roundMusic: 'https://cdn.lovable.dev/sounds/music/puzzle-game-music.mp3',
  leaderboardMusic: 'https://cdn.lovable.dev/sounds/music/upbeat-corporate-music.mp3',

  // Sound Effects
  guessCorrect: 'https://cdn.lovable.dev/sounds/sfx/correct-answer.wav',
  guessIncorrect: 'https://cdn.lovable.dev/sounds/sfx/wrong-answer.wav',
  roundWin: 'https://cdn.lovable.dev/sounds/sfx/level-win.mp3',
  roundLose: 'https://cdn.lovable.dev/sounds/sfx/level-lose.mp3',
  gameWin: 'https://cdn.lovable.dev/sounds/sfx/game-win.mp3',

  // UI Sounds
  buttonClick: 'https://cdn.lovable.dev/sounds/ui/button-click.wav',
  gameStart: 'https://cdn.lovable.dev/sounds/sfx/game-start.wav',
};

export type SoundKey = keyof typeof soundConfig;
