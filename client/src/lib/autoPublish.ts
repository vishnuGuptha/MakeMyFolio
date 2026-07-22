import { adminApi } from '@/api';
import { getPublicPortfolioUrl } from '@/lib/utils';

export type LiveShareInfo = {
  profileId: string;
  slug: string;
  publicUrl: string;
  /** Already published before this payment */
  alreadyLive: boolean;
  /** Published as part of this payment flow */
  publishedNow: boolean;
};

/**
 * After a plan unlock, publish the active folio so the user leaves with a live URL.
 * No-ops if there is no profile. Safe if already published.
 */
export async function autoPublishActiveFolio(
  profile: { _id: string; slug: string; isPublished: boolean } | null | undefined
): Promise<LiveShareInfo | null> {
  if (!profile?._id || !profile.slug) return null;

  const publicUrl = getPublicPortfolioUrl(profile.slug);

  if (profile.isPublished) {
    return {
      profileId: profile._id,
      slug: profile.slug,
      publicUrl,
      alreadyLive: true,
      publishedNow: false,
    };
  }

  await adminApi.publishProfile(profile._id, true);
  return {
    profileId: profile._id,
    slug: profile.slug,
    publicUrl,
    alreadyLive: false,
    publishedNow: true,
  };
}

export function whatsappShareUrl(publicUrl: string, name?: string) {
  const label = name?.trim() || 'my portfolio';
  const text = `Check out ${label}: ${publicUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function linkedInShareUrl(publicUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
}
