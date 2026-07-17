import React from 'react';

/**
 * Reusable Bell Logo Icon vector matching the brand logo.
 */
export function LogoIcon({ className = 'w-10 h-10', ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Subtle bottom shadow */}
      <ellipse
        cx="50"
        cy="87"
        rx="22"
        ry="3"
        fill="black"
        opacity="0.25"
      />
      
      {/* Bell Clapper (Bottom center) */}
      <path
        d="M 42 72 C 42 81 58 81 58 72 Z"
        fill="currentColor"
      />
      
      {/* Bell Body Outline */}
      <path
        d="M 24 67 C 24 55 30 49 30 37 C 30 22 39 15 50 15 C 61 15 70 22 70 37 C 70 49 76 55 76 67 C 76 72 64 73 50 73 C 36 73 24 72 24 67 Z"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Brand name styled text (lowercase 'remmbr').
 */
export function LogoText({ className = 'text-2xl', ...props }) {
  return (
    <span
      className={`font-logo font-black tracking-[-0.04em] text-[#064e3b] select-none ${className}`}
      {...props}
    >
      remmbr
    </span>
  );
}

/**
 * Full Brand Logo (Icon + Text inline together)
 */
export function LogoFull({ className = 'gap-2', iconSize = 'w-10 h-10', textSize = 'text-2xl', ...props }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} {...props}>
      <LogoIcon className={`${iconSize} text-emerald-600`} />
      <LogoText className={`${textSize} leading-none`} />
    </div>
  );
}
