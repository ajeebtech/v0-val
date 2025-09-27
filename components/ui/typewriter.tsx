'use client';

import { useEffect, useState } from 'react';

type TypewriterProps = {
  text: string | string[];
  speed?: number;
  className?: string;
};

export function Typewriter({ text, speed = 50, className = '' }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(speed);

  const pauseDuration = 2000; // 2 seconds
  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[currentIndex % textArray.length];

  useEffect(() => {
    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % textArray.length);
        setTypingSpeed(speed);
      } else {
        const timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
          setTypingSpeed(speed / 2);
        }, typingSpeed);
        return () => clearTimeout(timer);
      }
    } else if (!isPaused) {
      if (displayText === currentText) {
        setIsPaused(true);
        setLoopNum(loopNum + 1);
      } else {
        const timer = setTimeout(() => {
          setDisplayText((prev) => prev + currentText.charAt(displayText.length));
          setTypingSpeed(speed);
        }, typingSpeed);
        return () => clearTimeout(timer);
      }
    }
  }, [displayText, isDeleting, isPaused, currentIndex, loopNum, text, speed, typingSpeed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
