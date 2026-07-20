import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { cn } from '@/lib/utils';

const DESKTOP_IMG = '/marketing/hero-desktop.png';
const MOBILE_IMG = '/marketing/hero-mobile.png';

/** Taller Mac viewport (~16:10) — short screenshot fills via object-cover */
const MAC_W = 480;
const MAC_H = 300;
const DESKTOP_PAD = 8;
const DESKTOP_CAMERA = 10;

const PHONE_W = 140;
const PHONE_H = 304;
const MOBILE_BORDER = 3;
const MOBILE_PAD = 3;

function MacFrame({ urlLabel }: { urlLabel: string }) {
  const shellW = MAC_W + DESKTOP_PAD * 2;

  return (
    <div className="relative shrink-0" style={{ width: shellW }}>
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 shadow-[0_36px_72px_-28px_rgba(15,23,42,0.55),0_0_60px_-28px_rgba(0,102,255,0.35)] ring-1 ring-black/5 dark:border-white/10 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800 dark:ring-white/5 dark:shadow-[0_36px_72px_-28px_rgba(0,0,0,0.75),0_0_60px_-24px_rgba(0,102,255,0.4)]">
        <div className="flex items-center gap-2 border-b border-black/5 bg-white/70 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-zinc-800/80">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90 shadow-sm" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 shadow-sm" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
          <span className="ml-2 min-w-0 flex-1 truncate rounded-lg bg-zinc-100/90 px-2.5 py-1 font-mono text-[9px] text-zinc-500 ring-1 ring-black/5 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-white/5">
            {urlLabel}
          </span>
        </div>
        <div className="p-2">
          <div
            className="relative isolate overflow-hidden rounded-lg bg-black ring-1 ring-black/40"
            style={{ width: MAC_W, height: MAC_H + DESKTOP_CAMERA }}
          >
            <div className="absolute left-1/2 top-1.5 z-10 -translate-x-1/2">
              <span className="block h-1.5 w-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
            </div>
            <img
              src={DESKTOP_IMG}
              alt="Portfolio preview on desktop"
              width={1024}
              height={448}
              decoding="async"
              fetchPriority="high"
              className="absolute left-0 object-cover object-top"
              style={{ top: DESKTOP_CAMERA, width: MAC_W, height: MAC_H }}
              draggable={false}
            />
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-auto h-1.5 w-[101%] -translate-x-[0.5%] bg-gradient-to-b from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700" />
      <div className="relative mx-auto h-2.5 w-[110%] -translate-x-[5%] rounded-b-2xl bg-gradient-to-b from-zinc-400 via-zinc-500 to-zinc-700 shadow-lg dark:from-zinc-700 dark:via-zinc-800 dark:to-zinc-950" />
    </div>
  );
}

function PhoneFrame() {
  const shellW = PHONE_W + MOBILE_BORDER * 2 + MOBILE_PAD * 2;

  return (
    <div className="relative shrink-0" style={{ width: shellW }}>
      <div
        className="relative box-border rounded-[1.85rem] border-solid border-zinc-800 bg-zinc-950 shadow-[0_28px_56px_-16px_rgba(0,0,0,0.55),0_0_40px_-18px_rgba(0,102,255,0.35)]"
        style={{ borderWidth: MOBILE_BORDER, padding: MOBILE_PAD }}
      >
        <div
          className="relative isolate overflow-hidden rounded-[1.45rem] bg-black"
          style={{ width: PHONE_W, height: PHONE_H }}
        >
          <img
            src={MOBILE_IMG}
            alt="Portfolio preview on mobile"
            width={473}
            height={1024}
            decoding="async"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute bottom-1.5 left-1/2 z-10 h-1 w-[28%] max-w-[80px] -translate-x-1/2 rounded-full bg-zinc-900/40"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

export function HeroDeviceShowcase({ className }: { className?: string; themeId?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const urlLabel = `https://${getPortfolioUrlPlaceholder()}`;

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start end', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28 });
  const macY = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [24, -32]);
  const macRot = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [3, -2.5]);
  const phoneY = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [40, -16]);
  const phoneRot = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [-4, 3]);

  return (
    <div
      ref={rootRef}
      className={cn('relative mx-auto w-full max-w-[680px] perspective-[1400px]', className)}
    >
      <div className="relative flex min-h-[280px] flex-col items-center justify-end gap-4 pb-2 pt-2 sm:min-h-[380px] sm:pb-3 sm:pt-4 md:min-h-[420px]">
        <motion.div
          className="relative z-10 flex w-full origin-bottom justify-center"
          style={reduceMotion ? undefined : { y: macY, rotateY: macRot, rotateX: 2 }}
          initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={cn('origin-top scale-[0.78] sm:scale-[0.92] lg:scale-100', !reduceMotion && 'home-float-slow')}>
            <MacFrame urlLabel={urlLabel} />
          </div>
        </motion.div>

        <motion.div
          className="relative z-20 origin-bottom sm:absolute sm:bottom-2 sm:right-0 md:right-[-4%] lg:right-[-6%]"
          style={reduceMotion ? undefined : { y: phoneY, rotateY: phoneRot, rotateZ: -2 }}
          initial={reduceMotion ? false : { opacity: 0, y: 48, x: 10 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={cn('scale-[0.92] sm:scale-100', !reduceMotion && 'home-float-med')}>
            <PhoneFrame />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
