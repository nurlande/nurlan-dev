import { useRef, useEffect } from "react";

interface UseMagneticButtonOptions {
  distance?: number;
}

export const useMagneticButton = ({ distance = 30 }: UseMagneticButtonOptions = {}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      const moveX = (x / rect.width) * distance;
      const moveY = (y / rect.height) * distance;

      button.style.transform = `translate(${moveX}px, ${moveY}px)`;
      button.style.transition = "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)";
    };

    const handleMouseLeave = () => {
      button.style.transform = "translate(0, 0)";
      button.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
    };

    button.addEventListener("mousemove", handleMouseMove as EventListener);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove as EventListener);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [distance]);

  return buttonRef;
};
