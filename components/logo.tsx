import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:rotate-12 ${className}`}
    >
      <defs>
        {/* Rich metallic gold gradient representing value and currency */}
        <linearGradient id="goldGradient" x1="15%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#FEF08A" /> {/* Soft light gold */}
          <stop offset="25%" stopColor="#EAB308" /> {/* Main gold */}
          <stop offset="65%" stopColor="#CA8A04" /> {/* Dark gold */}
          <stop offset="100%" stopColor="#854D0E" /> {/* Coin edge bronze shadow */}
        </linearGradient>
        
        {/* Coin shadow for minted 3D relief */}
        <filter id="coinShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Coin Rim */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="url(#goldGradient)"
        stroke="#854D0E"
        strokeWidth="1.5"
        filter="url(#coinShadow)"
      />

      {/* Inner Minted Ring (Representing Nigerian coin designs) */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="#0a0a0a" {/* obsidian coin face */}
        stroke="url(#goldGradient)"
        strokeWidth="3.5"
      />

      {/* Dotted border detail (Old currency feel) */}
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke="#CA8A04"
        strokeWidth="1"
        strokeDasharray="3 3"
        fill="none"
      />

      {/* Center Golden Letter K */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fill="url(#goldGradient)"
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 900,
          fontSize: "40px",
        }}
      >
        K
      </text>

      {/* Small design accent dots */}
      <circle cx="50" cy="18" r="1.5" fill="#EAB308" />
      <circle cx="50" cy="82" r="1.5" fill="#EAB308" />
      <circle cx="18" cy="50" r="1.5" fill="#EAB308" />
      <circle cx="82" cy="50" r="1.5" fill="#EAB308" />
    </svg>
  );
}
