
export const soundConfig = {
  // Background Music
  roundMusic: '/background-music.mp3',
  leaderboardMusic: '/leaderboardmusic.mp3',

  // Sound Effects
  guessCorrect: '/correct-answer.mp3',
  guessIncorrect: '/wrong-answer.mp3',
  roundWin: '/level-win.mp3',
  roundLose: '/level-lose.mp3',
  gameWin: '/game-win.mp3',

  // UI Sounds
  buttonClick: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/ui/cursor_select.mp3', // No local file provided for this
  gameStart: '/game-start.mp3',
};

export type SoundKey = keyof typeof soundConfig;

