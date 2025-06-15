
import React from 'react';
import Lottie, { LottieComponentProps } from 'lottie-react';

interface LottiePlayerProps extends Omit<LottieComponentProps, 'animationData'> {
  animationDataPath: string;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({ animationDataPath, ...props }) => {
    const [animationData, setAnimationData] = React.useState(null);

    React.useEffect(() => {
        fetch(animationDataPath)
            .then(res => res.json())
            .then(data => setAnimationData(data));
    }, [animationDataPath]);
    
    if (!animationData) return null;

    return <Lottie animationData={animationData} {...props} />;
};
