
export const soundConfig = {
  // Background Music - using assets from https://github.com/ask-j/game-assets
  roundMusic: 'https://cdn.jsdelivr.net/gh/ask-j/game-assets@master/assets/audio/music/overworld.mp3',
  leaderboardMusic: 'https://cdn.jsdelivr.net/gh/ask-j/game-assets@master/assets/audio/music/battle.mp3',

  // Sound Effects - using assets from https://github.com/sfbg/kor-sfx-rpg
  guessCorrect: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/battle/critical_hit.mp3',
  guessIncorrect: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/battle/hero_magic_miss.mp3',
  roundWin: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/ui/reward.mp3',
  roundLose: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/battle/enemy_hit.mp3',
  gameWin: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/items/fanfare.mp3',

  // UI Sounds - using assets from https://github.com/sfbg/kor-sfx-rpg
  buttonClick: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/ui/cursor_select.mp3',
  gameStart: 'https://raw.githubusercontent.com/sfbg/kor-sfx-rpg/master/mp3/ui/menu_open.mp3',
};

export type SoundKey = keyof typeof soundConfig;
