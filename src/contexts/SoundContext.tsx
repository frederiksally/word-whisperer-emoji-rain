
import React, { createContext, useContext } from 'react';
import { useSoundManager } from '@/hooks/useSoundManager';
import { SoundKey } from '@/config/sounds';

interface SoundContextType {
  playSound: (key: SoundKey) => void;
  playMusic: (key: SoundKey) => void;
  stopMusic: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const soundManager = useSoundManager();
  return (
    <SoundContext.Provider value={soundManager}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
