import React from 'react';
import Lottie, { LottieRef, AnimationEventCallback } from 'lottie-react';

// By creating a specific interface for our wrapper, we avoid complex type
// inference issues that can arise from lottie-react's union-based prop types.
// We explicitly list the props our wrapper will accept and pass through.
interface LottiePlayerProps {
  animationDataPath: string;
  className?: string;
  loop?: boolean | number;
  autoplay?: boolean;
  onComplete?: AnimationEventCallback;
  lottieRef?: LottieRef;
  // Other props from lottie-react can be added here if needed
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationDataPath, ...props }) => {
    // The `lottie-react` component can handle fetching from a path directly.
    // This avoids issues with trying to parse compressed .lottie files as JSON.
    return <Lottie path={animationDataPath} {...props} />;
};
