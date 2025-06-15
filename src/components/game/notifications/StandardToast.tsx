
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { GameNotification as StandardToastProps } from '@/contexts/GameNotificationContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props extends StandardToastProps {
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    containerClasses: 'border-green-800/50 bg-green-100/90',
    iconClasses: 'text-green-700',
    textClasses: 'text-green-900',
  },
  error: {
    icon: XCircle,
    containerClasses: 'border-red-800/50 bg-red-100/90',
    iconClasses: 'text-red-700',
    textClasses: 'text-red-900',
  },
  info: {
    icon: Info,
    containerClasses: 'border-amber-800/50 bg-[#fefae0]/90',
    iconClasses: 'text-amber-800',
    textClasses: 'text-stone-800',
  },
};

export const StandardToast: React.FC<Props> = ({ id, message, type, visible, onDismiss }) => {
  const toastRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;
    if (visible) {
      gsap.fromTo(
        toastRef.current,
        { y: -100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(toastRef.current, {
        opacity: 0,
        y: -100,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onDismiss(id),
      });
    }
  }, [visible, id, onDismiss]);

  const config = toastConfig[type as keyof typeof toastConfig] || toastConfig.info;
  const IconComponent = config.icon;

  return (
    <li
      ref={toastRef}
      className={cn(
        'flex items-center justify-center gap-3 rounded-lg border-2 p-3 shadow-lg backdrop-blur-sm',
        config.containerClasses
      )}
      role="alert"
    >
      <IconComponent className={cn('h-7 w-7 flex-shrink-0', config.iconClasses)} />
      <span className={cn('font-boxing text-2xl text-center', config.textClasses)}>
        {message}
      </span>
    </li>
  );
};
