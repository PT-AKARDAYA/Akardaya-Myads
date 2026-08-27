import React from 'react';

interface AkarDayaLogoProps {
  className?: string;
  variant?: 'icon' | 'full';
  showText?: boolean;
}

export const AkarDayaLogo: React.FC<AkarDayaLogoProps> = ({
  className = 'w-9 h-9',
  variant = 'icon',
  showText = false,
}) => {
  if (variant === 'full' || showText) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radio / Broadcast Waves (Top Right) */}
          <circle cx="310" cy="55" r="7" fill="#0067B1" />
          <path
            d="M310 38C326.5 38 340 51.5 340 68"
            stroke="#0067B1"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M310 21C341 21 366 46 366 77"
            stroke="#0067B1"
            strokeWidth="7.5"
            strokeLinecap="round"
          />

          {/* Main Red Section of the 'A' */}
          <path
            d="M255 12L12 400H132L255 185L348 345L405 248L255 12Z"
            fill="#E52329"
          />

          {/* Blue Corner Section of the 'A' (Bottom Right) */}
          <path
            d="M405 248L348 345L379 400H498L405 248Z"
            fill="#0067B1"
          />

          {/* PT AKAR DAYA Text */}
          <text
            x="250"
            y="472"
            textAnchor="middle"
            fill="#E52329"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="48"
            letterSpacing="2"
          >
            PT AKAR DAYA
          </text>
        </svg>
      </div>
    );
  }

  // Icon emblem only (tight bounding box for neat navbar / badge display)
  return (
    <svg
      viewBox="0 0 510 430"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Radio / Broadcast Waves (Top Right) */}
      <circle cx="318" cy="52" r="8" fill="#0067B1" />
      <path
        d="M318 34C336 34 350 48 350 66"
        stroke="#0067B1"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M318 16C351 16 378 43 378 76"
        stroke="#0067B1"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Main Red Section of the 'A' */}
      <path
        d="M260 12L12 405H135L260 188L354 350L412 250L260 12Z"
        fill="#E52329"
      />

      {/* Blue Corner Section of the 'A' (Bottom Right) */}
      <path
        d="M412 250L354 350L386 405H508L412 250Z"
        fill="#0067B1"
      />
    </svg>
  );
};
