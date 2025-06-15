
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type GameNotificationType = 'success' | 'error' | 'info' | 'round-start';

export interface GameNotification {
  id: string;
  type: GameNotificationType;
  message?: ReactNode;
  payload?: any;
  duration?: number;
  visible: boolean;
}

interface GameNotificationContextType {
  notifications: GameNotification[];
  showNotification: (options: {
    type: GameNotificationType;
    message?: ReactNode;
    payload?: any;
    duration?: number;
  }) => void;
  removeNotification: (id: string) => void;
}

const GameNotificationContext = createContext<GameNotificationContextType | undefined>(undefined);

let notificationCount = 0;

export const GameNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(current => current.filter(n => n.id !== id));
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(current =>
      current.map(n => (n.id === id ? { ...n, visible: false } : n))
    );
  }, []);

  const showNotification = useCallback((options: {
    type: GameNotificationType;
    message?: ReactNode;
    payload?: any;
    duration?: number;
  }) => {
    const id = `game-notification-${notificationCount++}`;
    const newNotification: GameNotification = { 
      ...options,
      id,
      visible: true 
    };

    setNotifications(current => [newNotification, ...current]);

    if (['info', 'success', 'error'].includes(options.type)) {
      const duration = options.duration ?? 4000;
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
  }, [hideNotification]);


  return (
    <GameNotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </GameNotificationContext.Provider>
  );
};

export const useGameNotification = () => {
  const context = useContext(GameNotificationContext);
  if (context === undefined) {
    throw new Error('useGameNotification must be used within a GameNotificationProvider');
  }
  return context;
};
