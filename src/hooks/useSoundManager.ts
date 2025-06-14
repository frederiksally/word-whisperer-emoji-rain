
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
      // Unload all sounds when the provider is unmounted
      Object.values(soundInstances.current).forEach(sound => sound?.unload());
      soundInstances.current = {};
      currentMusicKey.current = null;
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
    // If different music is playing, fade it out, stop, and unload it.
    if (currentMusicKey.current && currentMusicKey.current !== key) {
      const oldMusicKey = currentMusicKey.current;
      const oldMusic = soundInstances.current[oldMusicKey];
      if (oldMusic) {
        oldMusic.once('fade', () => {
          oldMusic.stop();
          oldMusic.unload();
          delete soundInstances.current[oldMusicKey!];
        });
        oldMusic.fade(oldMusic.volume(), 0, 500); // Fade out over 0.5s
      }
    }
    
    // If the same music is already playing, do nothing.
    if (currentMusicKey.current === key && soundInstances.current[key]?.playing()) {
        return;
    }

    // Get or create the new music instance
    let music = soundInstances.current[key];
    if (!music || music.state() === 'unloaded') {
      music = new Howl({
        src: [soundConfig[key]],
        loop: true,
        volume: 0, // Start at volume 0 to fade in
        html5: true, // Recommended for long audio files like music
      });
      soundInstances.current[key] = music;
    }
    
    music.play();
    music.fade(0, 0.5, 1000); // Fade in to 0.5 volume over 1s
    currentMusicKey.current = key;
  }, []);

  const stopMusic = useCallback(() => {
    if (currentMusicKey.current) {
      const musicKey = currentMusicKey.current;
      const music = soundInstances.current[musicKey];
      currentMusicKey.current = null; // Clear current music immediately
      if (music) {
        music.once('fade', () => {
          music.stop();
          music.unload();
          delete soundInstances.current[musicKey!];
        });
        music.fade(music.volume(), 0, 500);
      }
    }
  }, []);

  return { playSound, playMusic, stopMusic };
};
