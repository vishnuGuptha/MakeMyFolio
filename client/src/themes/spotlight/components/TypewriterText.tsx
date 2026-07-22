import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  /** Strings cycled one at a time — each is typed char-by-char, then deleted char-by-char */
  words: string[];
  className?: string;
  /** Applied only to the typed characters (not the caret) */
  textClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function TypewriterText({
  words,
  className,
  textClassName,
  typingSpeed = 85,
  deletingSpeed = 40,
  pauseMs = 2400,
}: TypewriterTextProps) {
  const phrases = words.map((w) => w.trim()).filter(Boolean);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [announced, setAnnounced] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);

  const currentPhrase = phrases[phraseIndex % phrases.length] ?? '';

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Reset when the word list changes
  useEffect(() => {
    setPhraseIndex(0);
    setDisplayed('');
    setIsDeleting(false);
    setAnnounced('');
  }, [phrases.join('|')]);

  // Static first phrase under reduced motion
  useEffect(() => {
    if (!reduceMotion || !phrases.length) return;
    const first = phrases[0];
    setDisplayed(first);
    setAnnounced(first);
  }, [reduceMotion, phrases.join('|')]);

  useEffect(() => {
    if (reduceMotion || !currentPhrase) return;

    if (!isDeleting && displayed.length < currentPhrase.length) {
      const timer = setTimeout(() => {
        setDisplayed(currentPhrase.slice(0, displayed.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && displayed.length === currentPhrase.length) {
      setAnnounced(currentPhrase);
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
    reduceMotion,
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
    <span className={cn('inline-flex items-baseline', className)}>
      <span className={cn(textClassName)} aria-hidden>
        {displayed}
      </span>
      {!reduceMotion ? (
        <span className="typewriter-cursor" aria-hidden>
          {'\u200b'}
        </span>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {announced}
      </span>
    </span>
  );
}
