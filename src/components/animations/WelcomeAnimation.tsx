
import React from 'react';
import LottieAnimation from './LottieAnimation';
import toolboxAnimation from './animationData/toolboxAnimation';

const WelcomeAnimation: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <LottieAnimation 
        animationData={toolboxAnimation}
        className="w-24 h-24 md:w-32 md:h-32"
        loop={true}
      />
    </div>
  );
};

export default WelcomeAnimation;
