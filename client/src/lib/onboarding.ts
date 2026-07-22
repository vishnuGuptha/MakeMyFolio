const KEY = 'portfolio-onboarding';

export type OnboardingStepId = 'theme' | 'content' | 'resume' | 'preview' | 'publish';

export const ONBOARDING_STEPS: {
  id: OnboardingStepId;
  title: string;
  description: string;
  to: string;
}[] = [
  {
    id: 'theme',
    title: 'Pick a theme',
    description: 'Choose a visual style for your portfolio.',
    to: '/dashboard/themes/new',
  },
  {
    id: 'content',
    title: 'Add your profile',
    description: 'Name, title, bio, and photo on Profile & Hero.',
    to: '/dashboard/content',
  },
  {
    id: 'resume',
    title: 'Upload a resume',
    description: 'Add a PDF visitors can download (same Profile & Hero page).',
    to: '/dashboard/content',
  },
  {
    id: 'preview',
    title: 'Preview your site',
    description: 'Open a private draft preview before going live.',
    to: '/dashboard',
  },
  {
    id: 'publish',
    title: 'Go live',
    description: 'Upgrade to publish, or open your dashboard when you’re ready.',
    to: '/dashboard/pricing',
  },
];

type OnboardingState = {
  active: boolean;
  completed: boolean;
  done: OnboardingStepId[];
};

function read(): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { active: false, completed: true, done: [] };
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return { active: false, completed: true, done: [] };
  }
}

function write(state: OnboardingState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

/** Call right after successful registration. */
export function startOnboarding() {
  write({ active: true, completed: false, done: [] });
}

export function isOnboardingActive() {
  const s = read();
  return s.active && !s.completed;
}

export function isOnboardingComplete() {
  return read().completed;
}

export function getOnboardingDone(): OnboardingStepId[] {
  return read().done;
}

export function markOnboardingStep(id: OnboardingStepId) {
  const state = read();
  if (!state.done.includes(id)) state.done = [...state.done, id];
  write(state);
}

export function completeOnboarding() {
  write({ active: false, completed: true, done: ONBOARDING_STEPS.map((s) => s.id) });
}

export function skipOnboarding() {
  completeOnboarding();
}
