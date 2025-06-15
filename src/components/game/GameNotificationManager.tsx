
import React from 'react';
import { useGameNotification } from '@/contexts/GameNotificationContext';
import { StandardToast } from './notifications/StandardToast';
import { RoundAnnouncement } from './notifications/RoundAnnouncement';

export const GameNotificationManager = () => {
  const { notifications, removeNotification } = useGameNotification();

  const standardToasts = notifications.filter(n => ['success', 'error', 'info'].includes(n.type));
  const specialNotifications = notifications.filter(n => !standardToasts.some(st => st.id === n.id));

  return (
    <>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg px-4 pointer-events-none">
        <ul className="space-y-2">
          {standardToasts.map((toast) => (
            <StandardToast key={toast.id} {...toast} onDismiss={removeNotification} />
          ))}
        </ul>
      </div>

      {specialNotifications.map((notification) => {
        if (!notification.visible) return null;
        switch (notification.type) {
          case 'round-start':
            return (
              <RoundAnnouncement
                key={notification.id}
                roundNumber={notification.payload.roundNumber}
                onComplete={() => removeNotification(notification.id)}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};
