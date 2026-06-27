"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fade" | "slide-up" | "slide-down" | "fade-scale";
  delay?: number;
  duration?: number;
}

export default function ScrollAnimate({
  children,
  className = "",
  variant = "slide-up",
  delay = 0,
  duration = 750
}: ScrollAnimateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.05, // Trigger as soon as 5% of element is in view
        rootMargin: "0px 0px -40px 0px" // Mature trigger offset
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case "fade":
        return isVisible ? "opacity-100" : "opacity-0";
      case "slide-up":
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";
      case "slide-down":
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6";
      case "fade-scale":
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]";
      default:
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-out ${getVariantStyles()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
