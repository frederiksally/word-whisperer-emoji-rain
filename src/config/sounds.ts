
export const soundConfig = {
  // Background Music - using local files
  roundMusic: '/background-music.mp3',
  leaderboardMusic: '/leaderboardmusic.mp3',

  // Sound Effects - using local files
  guessCorrect: '/correct-answer.mp3',
  guessIncorrect: '/wrong-answer.mp3',
  roundWin: '/level-win.mp3',
  roundLose: '/level-lose.mp3',
  gameWin: '/game-win.mp3',

  // UI Sounds - using local files
  buttonClick: '/game-start.mp3', // Re-using game-start for button click
  gameStart: '/game-start.mp3',
};

export type SoundKey = keyof typeof soundConfig;
