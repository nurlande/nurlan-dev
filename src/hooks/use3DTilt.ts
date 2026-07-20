import { useRef, useEffect } from "react";

interface Use3DTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
}

export const use3DTilt = ({
  maxTilt = 15,
  perspective = 1000,
  scale = 1.05,
}: Use3DTiltOptions = {}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    };

    const handleMouseLeave = () => {
      card.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0) scale(1)`;
    };

    const handleMouseEnter = () => {
      card.style.transition = "transform 0.1s ease-out";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [maxTilt, perspective, scale]);

  return cardRef;
};
