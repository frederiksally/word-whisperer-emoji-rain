
export const soundConfig = {
  // Background Music - using assets from https://github.com/ask-j/game-assets
  roundMusic: 'https://cdn.jsdelivr.net/gh/ask-j/game-assets@master/assets/audio/music/overworld.mp3',
  leaderboardMusic: 'https://cdn.jsdelivr.net/gh/ask-j/game-assets@master/assets/audio/music/battle.mp3',

  // Sound Effects - using assets from https://github.com/sfbg/kor-sfx-rpg
  guessCorrect: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/battle/critical-hit.mp3',
  guessIncorrect: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/battle/hero-magic-miss.mp3',
  roundWin: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/ui/reward.mp3',
  roundLose: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/battle/enemy-hit.mp3',
  gameWin: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/items/fanfare.mp3',

  // UI Sounds - using assets from https://github.com/sfbg/kor-sfx-rpg
  buttonClick: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/ui/cursor-select.mp3',
  gameStart: 'https://cdn.jsdelivr.net/gh/sfbg/kor-sfx-rpg@master/mp3/ui/menu-open.mp3',
};

export type SoundKey = keyof typeof soundConfig;
