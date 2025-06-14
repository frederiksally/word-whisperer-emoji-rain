
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { GameToast as GameToastProps } from '@/contexts/GameToastContext';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface Props extends GameToastProps {
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  error: <XCircle className="h-6 w-6 text-red-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
};

export const GameToast: React.FC<Props> = ({ id, message, type, visible, onDismiss }) => {
  const toastRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;
    if (visible) {
      gsap.fromTo(
        toastRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(toastRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onDismiss(id),
      });
    }
  }, [visible, id, onDismiss]);

  return (
    <li
      ref={toastRef}
      className={cn(
        'font-boxing text-lg text-foreground bg-background border-2 rounded-lg shadow-2xl flex items-center gap-4 p-4 w-full max-w-sm',
        {
          'border-green-500': type === 'success',
          'border-red-500': type === 'error',
          'border-blue-500': type === 'info',
        }
      )}
      role="alert"
    >
      {toastIcons[type]}
      <div className="flex-grow">{message}</div>
    </li>
  );
};
