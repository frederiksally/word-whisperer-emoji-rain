import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useSound } from '@/contexts/SoundContext';

interface RoundAnnouncementProps {
  roundNumber: number;
  onComplete: () => void;
}

export const RoundAnnouncement: React.FC<RoundAnnouncementProps> = ({ roundNumber, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const { playSound } = useSound();

  useEffect(() => {
    playSound('roundIntroduction');

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.to(containerRef.current, { 
                opacity: 0, 
                duration: 0.3,
                onComplete: onComplete
            });
        }
    });
    gsap.set(containerRef.current, { opacity: 1 });
    
    tl.from(textRef.current, { scale: 3, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .to(textRef.current, { opacity: 0, duration: 0.5, ease: 'power2.in', delay: 1.2 });
  }, [onComplete, playSound]);

  return (
    <div ref={containerRef} className="fixed inset-0 flex items-center justify-center bg-black/50 z-[200] pointer-events-auto">
      <h1 ref={textRef} className="text-9xl font-boxing text-white" style={{ textShadow: '4px 4px 10px rgba(0,0,0,0.8)' }}>
        Round {roundNumber}
      </h1>
    </div>
  );
};
