
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { GameNotification as StandardToastProps } from '@/contexts/GameNotificationContext';

interface Props extends StandardToastProps {
  onDismiss: (id: string) => void;
}

export const StandardToast: React.FC<Props> = ({ id, message, visible, onDismiss }) => {
  const toastRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;
    if (visible) {
      gsap.fromTo(
        toastRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(toastRef.current, {
        opacity: 0,
        y: 100,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onDismiss(id),
      });
    }
  }, [visible, id, onDismiss]);

  return (
    <li
      ref={toastRef}
      className="font-boxing text-2xl text-white text-center"
      style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
      role="alert"
    >
      {message}
    </li>
  );
};
