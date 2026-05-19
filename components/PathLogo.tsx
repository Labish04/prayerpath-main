import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

export const PathLogo = ({ size = 120 }: { size?: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle 
        cx="50" 
        cy="50" 
        r="45" 
        stroke="#3A5244" 
        strokeWidth="2" 
        fill="none" 
      />
      
      <Path
        d="M30 80 Q50 80 50 65 T70 50"
        stroke="#C5B18D"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      
      <Path
        d="M20 70 Q50 60 80 70"
        stroke="#3A5244"
        strokeWidth="1"
        fill="none"
      />

      <Path
        d="M50 45 V65 M43 52 H57"
        stroke="#3A5244"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <G transform="translate(65, 60) scale(0.5)">
        <Path
          d="M0 0 Q10 -10 20 0 Q10 10 0 0"
          fill="#3A5244"
        />
        <Path
          d="M-5 -10 Q5 -20 15 -10 Q5 0 -5 -10"
          fill="#3A5244"
          transform="rotate(-30)"
        />
      </G>
    </Svg>
  );
};
