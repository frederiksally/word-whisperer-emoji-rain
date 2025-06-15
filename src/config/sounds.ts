
export const soundConfig = {
  // Background Music
  roundMusic: '/sounds/background-music.mp3',
  leaderboardMusic: '/sounds/leaderboardmusic.mp3',

  // Sound Effects
  guessCorrect: '/sounds/correct-answer.mp3',
  guessIncorrect: '/sounds/wrong-answer.mp3',
  roundWin: '/sounds/level-win.mp3',
  roundLose: '/sounds/level-lose.mp3',
  gameWin: '/sounds/game-win.mp3',

  // UI Sounds
  buttonClick: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/ui/cursor_select.mp3', // No local file provided for this
  gameStart: '/sounds/game-start.mp3',
};

export type SoundKey = keyof typeof soundConfig;
