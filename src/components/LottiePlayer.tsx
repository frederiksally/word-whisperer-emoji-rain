
import React from 'react';
import Lottie, { LottieProps } from 'lottie-react';

// To create a robust wrapper, we base our component's props on the
// LottieProps type exported by the 'lottie-react' library.
// We then Omit the original 'path' and 'animationData' props to prevent
// ambiguity and introduce our own required 'animationDataPath' prop.
// This ensures our wrapper has a clear and type-safe interface.
interface LottiePlayerProps extends Omit<LottieProps, 'path' | 'animationData'> {
  animationDataPath: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationDataPath, ...rest }) => {
    // We map our 'animationDataPath' prop to the 'path' prop expected by the Lottie component.
    // The rest of the props (...rest) are passed through directly. This is type-safe
    // because our LottiePlayerProps is derived from the library's own LottieProps.
    return <Lottie path={animationDataPath} {...rest} />;
};
