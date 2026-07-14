import { BRAND } from '@/brand/constants';

export type PlanId = 'free' | 'pro' | 'team';

export type PlanDef = {
  id: PlanId;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
  ctaTo: string;
};

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceNote: 'forever',
    description: 'One live folio to share with recruiters.',
    features: [
      '1 published portfolio',
      'Core themes',
      `${BRAND.domain}/{slug} URL`,
      'Resume import (fair use)',
      'Contact form & messages',
    ],
    cta: 'Start free',
    ctaTo: '/register?plan=free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    priceNote: '/mo · coming soon',
    description: 'For builders who ship multiple brands and want every theme.',
    highlighted: true,
    features: [
      'Up to 5 portfolios',
      'All themes unlocked',
      'Remove Made-with badge',
      'Higher AI import quota',
      'Custom domain (soon)',
    ],
    cta: 'Join Pro waitlist',
    ctaTo: '/register?plan=pro',
  },
  {
    id: 'team',
    name: 'Team',
    price: 'Custom',
    priceNote: 'for agencies',
    description: 'Shared seats and client folios — on the roadmap.',
    features: [
      'Shared workspace seats',
      'Client portfolio management',
      'Priority support',
      'Bulk theme branding (soon)',
    ],
    cta: 'Talk to us',
    ctaTo: '/register?plan=team',
  },
];

export function getPlan(id: PlanId) {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}
