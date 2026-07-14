import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  /** Strings cycled one at a time — each is typed char-by-char, then deleted char-by-char */
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}

export default function TypewriterText({
  words,
  className,
  typingSpeed = 85,
  deletingSpeed = 40,
  pauseMs = 2000,
}: TypewriterTextProps) {
  const phrases = words.map((w) => w.trim()).filter(Boolean);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex % phrases.length] ?? '';

  // Reset when the word list changes
  useEffect(() => {
    setPhraseIndex(0);
    setDisplayed('');
    setIsDeleting(false);
  }, [phrases.join('|')]);

  useEffect(() => {
    if (!currentPhrase) return;

    if (!isDeleting && displayed.length < currentPhrase.length) {
      const timer = setTimeout(() => {
        setDisplayed(currentPhrase.slice(0, displayed.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && displayed.length === currentPhrase.length) {
      const timer = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(timer);
    }

    if (isDeleting && displayed.length > 0) {
      const timer = setTimeout(() => {
        setDisplayed(currentPhrase.slice(0, displayed.length - 1));
      }, deletingSpeed);
      return () => clearTimeout(timer);
    }

    if (isDeleting && displayed.length === 0) {
      const timer = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    currentPhrase,
    displayed,
    isDeleting,
    phraseIndex,
    phrases.length,
    typingSpeed,
    deletingSpeed,
    pauseMs,
  ]);

  if (!phrases.length) return null;

  return (
    <span className={cn('inline', className)}>
      {displayed}
      <span className="typewriter-cursor" aria-hidden>|</span>
    </span>
  );
}
