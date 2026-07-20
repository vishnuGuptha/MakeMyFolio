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

/** Mac screen size — matches desktop screenshot aspect (~1024×448) */
const MAC_W = 420;
const MAC_H = 184;
const DESKTOP_PAD = 10;
const DESKTOP_CAMERA = 12;

/** Phone screen — matches mobile screenshot aspect (~473×1024) */
const PHONE_W = 132;
const PHONE_H = 286;
const MOBILE_BORDER = 3;
const MOBILE_PAD = 3;

function MacFrame({ urlLabel }: { urlLabel: string }) {
  const shellW = MAC_W + DESKTOP_PAD * 2;

  return (
    <div className="relative shrink-0" style={{ width: shellW }}>
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.55)] ring-1 ring-black/5 dark:border-white/10 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800 dark:ring-white/5">
        <div className="flex items-center gap-2 border-b border-black/5 bg-white/70 px-3 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-zinc-800/80">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/90 shadow-sm" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90 shadow-sm" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
          <span className="ml-2 min-w-0 flex-1 truncate rounded-lg bg-zinc-100/90 px-2.5 py-1 font-mono text-[9px] text-zinc-500 ring-1 ring-black/5 dark:bg-zinc-900/60 dark:text-zinc-300 dark:ring-white/5">
            {urlLabel}
          </span>
        </div>
        <div className="p-2.5">
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
        className="relative box-border rounded-[1.75rem] border-solid border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50"
        style={{ borderWidth: MOBILE_BORDER, padding: MOBILE_PAD }}
      >
        <div
          className="relative isolate overflow-hidden rounded-[1.4rem] bg-black"
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
  const macY = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [28, -36]);
  const macRot = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [4, -3]);
  const phoneY = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [48, -20]);
  const phoneRot = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [-5, 4]);

  return (
    <div
      ref={rootRef}
      className={cn('relative mx-auto w-full max-w-[640px] perspective-[1400px]', className)}
    >
      <div className="relative flex min-h-[240px] flex-col items-center justify-end gap-6 pb-2 pt-4 sm:min-h-[340px] sm:pb-4 sm:pt-6 md:min-h-[380px]">
        <motion.div
          className="relative z-10 flex w-full origin-bottom justify-center"
          style={reduceMotion ? undefined : { y: macY, rotateY: macRot, rotateX: 2 }}
          initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="origin-top scale-[0.85] sm:scale-100">
            <MacFrame urlLabel={urlLabel} />
          </div>
        </motion.div>

        <motion.div
          className="relative z-20 origin-bottom sm:absolute sm:bottom-0 sm:right-0 md:right-[-2%]"
          style={reduceMotion ? undefined : { y: phoneY, rotateY: phoneRot }}
          initial={reduceMotion ? false : { opacity: 0, y: 60, x: 12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <PhoneFrame />
        </motion.div>
      </div>
    </div>
  );
}
