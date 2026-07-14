import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function TerminalTypewriter({
  words,
  className,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseMs = 1800,
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}) {
  const phrases = words.map((w) => w.trim()).filter(Boolean);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex % phrases.length] ?? '';

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
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentPhrase, displayed, isDeleting, phraseIndex, phrases.length, typingSpeed, deletingSpeed, pauseMs]);

  if (!phrases.length) return null;

  return (
    <span className={cn('text-primary', className)}>
      {displayed}
      <span className="terminal-cursor" aria-hidden>_</span>
    </span>
  );
}
