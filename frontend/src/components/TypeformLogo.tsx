import React from "react";

interface TypeformLogoProps {
  className?: string;
  size?: number;
}

export default function TypeformLogo({ className = "w-6 h-6", size }: TypeformLogoProps) {
  return (
    <svg
      viewBox="0 0 34 24"
      fill="currentColor"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left capsule pill */}
      <rect x="0" y="0" width="7.5" height="24" rx="3.75" />
      {/* Right squircle */}
      <rect x="11.5" y="0" width="22.5" height="24" rx="6" />
    </svg>
  );
}
