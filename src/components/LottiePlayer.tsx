
import React from 'react';
import Lottie, { LottieComponentProps } from 'lottie-react';

// We create a wrapper that uses the `path` prop. To ensure type safety with
// lottie-react's complex union types, we explicitly Omit both `animationData`
// and `path` from the props we pass through. Our component will then supply the `path`.
interface LottiePlayerProps extends Omit<LottieComponentProps, 'animationData' | 'path'> {
  animationDataPath: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationDataPath, ...props }) => {
    // The `lottie-react` component can handle fetching from a path directly.
    // This avoids issues with trying to parse compressed .lottie files as JSON.
    return <Lottie path={animationDataPath} {...props} />;
};
