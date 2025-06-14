
export const soundConfig = {
  // Background Music
  roundMusic: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/background-music.mp3',
  leaderboardMusic: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/leaderboardmusic.mp3',

  // Sound Effects
  guessCorrect: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/correct-answer.mp3',
  guessIncorrect: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/wrong-answer.mp3',
  roundWin: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/level-win.mp3',
  roundLose: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/level-lose.mp3',
  gameWin: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/game-win.mp3',

  // UI Sounds
  buttonClick: 'https://cdn.lovable.dev/sounds/ui/button-click.wav',
  gameStart: 'https://cdn.jsdelivr.net/gh/frederiksally/word-whisperer-emoji-rain@main/game-start.mp3',
};

export type SoundKey = keyof typeof soundConfig;
