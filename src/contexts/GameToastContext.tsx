
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GameToastType = 'success' | 'error' | 'info';

export interface GameToast {
  id: string;
  message: ReactNode;
  type: GameToastType;
  duration?: number;
  visible: boolean;
}

interface GameToastContextType {
  toasts: GameToast[];
  showToast: (message: ReactNode, options?: { type?: GameToastType; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const GameToastContext = createContext<GameToastContextType | undefined>(undefined);

let toastCount = 0;

export const GameToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<GameToast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(currentToasts =>
      currentToasts.map(toast => (toast.id === id ? { ...toast, visible: false } : toast))
    );
  }, []);

  const showToast = useCallback((message: ReactNode, options: { type?: GameToastType; duration?: number } = {}) => {
    const { type = 'info', duration = 4000 } = options;
    const id = `game-toast-${toastCount++}`;
    
    const newToast: GameToast = { id, message, type, duration, visible: true };

    setToasts(currentToasts => [newToast, ...currentToasts]);

    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, [hideToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <GameToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </GameToastContext.Provider>
  );
};

export const useGameToast = () => {
  const context = useContext(GameToastContext);
  if (context === undefined) {
    throw new Error('useGameToast must be used within a GameToastProvider');
  }
  return context;
};
