
import React from 'react';
import Lottie from 'lottie-react';

// We create a wrapper that uses the `path` prop. To ensure type safety with
// lottie-react's complex union types, we use React.ComponentProps to correctly
// infer the underlying props and then Omit the ones we'll handle (`animationData` and `path`).
interface LottiePlayerProps extends Omit<React.ComponentProps<typeof Lottie>, 'animationData' | 'path'> {
  animationDataPath: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationDataPath, ...props }) => {
    // The `lottie-react` component can handle fetching from a path directly.
    // This avoids issues with trying to parse compressed .lottie files as JSON.
    return <Lottie path={animationDataPath} {...props} />;
};
