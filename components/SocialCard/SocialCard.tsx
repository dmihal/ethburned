import React from 'react';

interface SocialCardProps {
  block: number;
}

const font = 'SofiaProRegular, Sofia Pro, sofia-pro';

const LONDON_BLOCK = 12965000;

const SocialCard: React.FC<SocialCardProps> = ({ block }) => {
  return (
    <svg
      viewBox="0 0 688 344"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          d="M3,0 L625,0 C626.656854,-3.04359188e-16 628,1.34314575 628,3 L628,238 L628,238 L0,238 L0,3 C-2.02906125e-16,1.34314575 1.34314575,3.04359188e-16 3,0 Z"
          id="path-1"
        ></path>
      </defs>
      <g>
        <rect fill="#F9FAFC" x="0" y="0" width="688" height="344"></rect>
        <text fontFamily={font} fontSize="24" fill="#091636" x="27" y="44">
          ETHBurned.info
        </text>
        <text
          opacity="0.4"
          fontFamily={font}
          fontSize="18"
          fill="#091636"
          x="650"
          y="44"
          textAnchor="end"
        >
          {(LONDON_BLOCK - block).toLocaleString()} Blocks Remaining
        </text>
      </g>
    </svg>
  );
};

export default SocialCard;
