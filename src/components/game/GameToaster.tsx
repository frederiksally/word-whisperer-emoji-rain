
import React from 'react';
import { useGameToast } from '@/contexts/GameToastContext';
import { GameToast } from './GameToast';

export const GameToaster = () => {
  const { toasts, removeToast } = useGameToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg px-4 pointer-events-none">
      <ul className="space-y-2">
        {toasts.map((toast) => (
          <GameToast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </ul>
    </div>
  );
};
