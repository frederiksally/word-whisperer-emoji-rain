
import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { gsap } from 'gsap';
import { useSound } from '@/contexts/SoundContext';

interface GameWinOverlayProps {
  onAnimationComplete: () => void;
}

const GameWinOverlay: React.FC<GameWinOverlayProps> = ({ onAnimationComplete }) => {
    const { playSound } = useSound();

    useEffect(() => {
        playSound('gameWin');

        const tl = gsap.timeline();
        
        tl.fromTo('.game-win-overlay', { opacity: 0 }, { opacity: 1, duration: 0.5 });
        
        tl.fromTo('.trophy-icon', 
            { scale: 0, rotate: -30 }, 
            { scale: 1, rotate: 0, duration: 1, ease: 'elastic.out(1, 0.5)' },
            '>'
        );
        
        tl.fromTo('.win-text', 
            { y: 50, opacity: 0, scale: 0.8 }, 
            { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' },
            '<0.3'
        );

        tl.to('.trophy-icon', {
            filter: 'drop-shadow(0 0 20px #fef08a)', // yellow-200
            yoyo: true,
            repeat: -1,
            duration: 1.5,
            ease: 'power1.inOut'
        });

        // Auto-close after some time
        gsap.to('.game-win-overlay', {
            delay: 4.5,
            opacity: 0,
            duration: 0.5,
            onComplete: onAnimationComplete
        });

    }, [playSound, onAnimationComplete]);

    return (
        <div className="game-win-overlay fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
            <Trophy className="trophy-icon text-amber-400 w-32 h-32 md:w-48 md:h-48" strokeWidth={1.5} />
            <h1 className="win-text text-5xl md:text-7xl font-bold font-boxing text-white mt-4" style={{ textShadow: '0 0 15px #facc15' }}>
                YOU WON!
            </h1>
        </div>
    );
};

export default GameWinOverlay;
