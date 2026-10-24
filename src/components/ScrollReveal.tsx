import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number; // delay in ms
  duration?: number; // duration in ms
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 800,
  className = "",
  direction = "up",
}: ScrollRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setRevealed(true);
      return;
    }

    const currentEl = ref.current;
    if (!currentEl) return;

    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setRevealed(true);
            }, delay);
          } else {
            setRevealed(true);
          }
          observer.unobserve(currentEl);
        }
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px 60px 0px", // Trigger slightly before the element enters view
      },
    );

    observer.observe(currentEl);

    return () => {
      observer.unobserve(currentEl);
    };
  }, [delay]);

  const directionClasses = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    none: "",
  };

  const baseStyle: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    transitionProperty: "all",
  };

  return (
    <div
      ref={ref}
      style={baseStyle}
      className={`transition-all ${
        revealed
          ? "opacity-100 translate-y-0 translate-x-0"
          : `opacity-0 ${directionClasses[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
