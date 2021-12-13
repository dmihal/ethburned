import React from 'react';

interface SocialCardProps {
  burned: number;
}

const font = 'SofiaProRegular, Sofia Pro, sofia-pro';

const SocialCard: React.FC<SocialCardProps> = ({ burned }) => {
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
        <text opacity="0.6" fontFamily={font} fontSize="24" fill="#091636" x="27" y="310">
          ETHBurned.info
        </text>
        <text fontFamily={font} fontSize="36" fill="#091636" x="27" y="270">
          $
          {burned.toLocaleString('en-us', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          ETH burned total by EIP-1559
        </text>
      </g>

      <g transform="scale(0.4) translate(-140, 180)">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 128 128"
          xmlSpace="preserve"
        >
          <g>
            <radialGradient
              id="SVGID_1_"
              cx="68.8839"
              cy="124.2963"
              r="70.587"
              gradientTransform="matrix(-1 -4.343011e-03 -7.125917e-03 1.6408 131.9857 -79.3452)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.3144" style={{ stopColor: '#FF9800' }} />
              <stop offset="0.6616" style={{ stopColor: '#FF6D00' }} />
              <stop offset="0.9715" style={{ stopColor: '#F44336' }} />
            </radialGradient>
            <path
              style={{ fill: 'url(#SVGID_1_)' }}
              d="M35.56,40.73c-0.57,6.08-0.97,16.84,2.62,21.42c0,0-1.69-11.82,13.46-26.65
              c6.1-5.97,7.51-14.09,5.38-20.18c-1.21-3.45-3.42-6.3-5.34-8.29C50.56,5.86,51.42,3.93,53.05,4c9.86,0.44,25.84,3.18,32.63,20.22
              c2.98,7.48,3.2,15.21,1.78,23.07c-0.9,5.02-4.1,16.18,3.2,17.55c5.21,0.98,7.73-3.16,8.86-6.14c0.47-1.24,2.1-1.55,2.98-0.56
              c8.8,10.01,9.55,21.8,7.73,31.95c-3.52,19.62-23.39,33.9-43.13,33.9c-24.66,0-44.29-14.11-49.38-39.65
              c-2.05-10.31-1.01-30.71,14.89-45.11C33.79,38.15,35.72,39.11,35.56,40.73z"
            />
            <g>
              <radialGradient
                id="SVGID_2_"
                cx="64.9211"
                cy="54.0621"
                r="73.8599"
                gradientTransform="matrix(-0.0101 0.9999 0.7525 7.603777e-03 26.1538 -11.2668)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.2141" style={{ stopColor: '#FFF176' }} />
                <stop offset="0.3275" style={{ stopColor: '#FFF27D' }} />
                <stop offset="0.4868" style={{ stopColor: '#FFF48F' }} />
                <stop offset="0.6722" style={{ stopColor: '#FFF7AD' }} />
                <stop offset="0.7931" style={{ stopColor: '#FFF9C4' }} />
                <stop offset="0.8221" style={{ stopColor: '#FFF8BD', stopOpacity: 0.804 }} />
                <stop offset="0.8627" style={{ stopColor: '#FFF6AB', stopOpacity: 0.529 }} />
                <stop offset="0.9101" style={{ stopColor: '#FFF38D', stopOpacity: 0.2088 }} />
                <stop offset="0.9409" style={{ stopColor: '#FFF176', stopOpacity: 0 }} />
              </radialGradient>
              <path
                style={{ fill: 'url(#SVGID_2_)' }}
                d="M76.11,77.42c-9.09-11.7-5.02-25.05-2.79-30.37c0.3-0.7-0.5-1.36-1.13-0.93
                c-3.91,2.66-11.92,8.92-15.65,17.73c-5.05,11.91-4.69,17.74-1.7,24.86c1.8,4.29-0.29,5.2-1.34,5.36
                c-1.02,0.16-1.96-0.52-2.71-1.23c-2.15-2.05-3.7-4.72-4.44-7.6c-0.16-0.62-0.97-0.79-1.34-0.28c-2.8,3.87-4.25,10.08-4.32,14.47
                C40.47,113,51.68,124,65.24,124c17.09,0,29.54-18.9,19.72-34.7C82.11,84.7,79.43,81.69,76.11,77.42z"
              />
            </g>
          </g>
        </svg>
      </g>
    </svg>
  );
};

export default SocialCard;
