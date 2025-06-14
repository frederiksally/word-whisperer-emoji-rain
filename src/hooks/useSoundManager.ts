import { useRef, useCallback, useEffect } from 'react';
import { Howl, Howler } from 'howler';
import { soundConfig, SoundKey } from '@/config/sounds';

// Ensure the master volume is enabled.
Howler.volume(1.0);

type SoundMap = {
  [key in SoundKey]?: Howl;
};

// Preload sounds for instant feedback
const soundsToPreload: SoundKey[] = ['buttonClick', 'gameStart', 'guessCorrect', 'guessIncorrect'];

export const useSoundManager = () => {
  const soundInstances = useRef<SoundMap>({});
  const currentMusicKey = useRef<SoundKey | null>(null);

  // Preload essential sounds and cleanup on unmount
  useEffect(() => {
    soundsToPreload.forEach(key => {
      if (!soundInstances.current[key]) {
        soundInstances.current[key] = new Howl({
          src: [soundConfig[key]],
        });
      }
    });

    return () => {
      Object.values(soundInstances.current).forEach(sound => sound?.unload());
      soundInstances.current = {};
    };
  }, []);

  const playSound = useCallback((key: SoundKey) => {
    if (!soundInstances.current[key]) {
      soundInstances.current[key] = new Howl({
        src: [soundConfig[key]],
      });
    }
    soundInstances.current[key]?.play();
  }, []);

  const playMusic = useCallback((key: SoundKey) => {
    if (currentMusicKey.current && currentMusicKey.current !== key) {
        soundInstances.current[currentMusicKey.current]?.stop();
    }
    
    if (currentMusicKey.current === key && soundInstances.current[key]?.playing()) {
        return; // Avoid restarting the same music
    }

    if (!soundInstances.current[key]) {
      soundInstances.current[key] = new Howl({
        src: [soundConfig[key]],
        loop: true,
        volume: 0.5,
      });
    }
    
    const music = soundInstances.current[key];
    if (music) {
        music.play();
        currentMusicKey.current = key;
    }
  }, []);

  const stopMusic = useCallback(() => {
    if (currentMusicKey.current) {
      soundInstances.current[currentMusicKey.current]?.stop();
      currentMusicKey.current = null;
    }
  }, []);

  return { playSound, playMusic, stopMusic };
};
