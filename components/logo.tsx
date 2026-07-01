import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 36 }: LogoProps) {
  return (
    <div 
      className={`shrink-0 transition-transform duration-300 hover:rotate-12 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/kowon.png"
        alt="KÓ WON Logo"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
