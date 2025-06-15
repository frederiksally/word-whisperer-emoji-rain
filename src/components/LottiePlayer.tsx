
import React from 'react';
import Lottie, { LottieComponentProps } from 'lottie-react';

interface LottiePlayerProps extends Omit<LottieComponentProps, 'animationData'> {
  animationDataPath: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationDataPath, ...props }) => {
    // The `lottie-react` component can handle fetching from a path directly.
    // This avoids issues with trying to parse compressed .lottie files as JSON,
    // which was causing the error.
    return <Lottie path={animationDataPath} {...props} />;
};
