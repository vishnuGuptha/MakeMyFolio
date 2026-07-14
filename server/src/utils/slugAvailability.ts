import { Types } from 'mongoose';
import { PortfolioProfile } from '../models/index.js';

type IdLike = string | Types.ObjectId | undefined;

function excludeFilter(excludeId?: IdLike) {
  return excludeId ? { _id: { $ne: excludeId } } : {};
}

/** Another active portfolio owned by this editor already uses the slug. */
export async function ownerSlugTaken(
  ownerId: IdLike,
  slug: string,
  excludeId?: IdLike
): Promise<boolean> {
  if (!ownerId) return false;
  const found = await PortfolioProfile.findOne({
    slug,
    ownerId: new Types.ObjectId(String(ownerId)),
    deletedAt: null,
    ...excludeFilter(excludeId),
  }).select('_id');
  return !!found;
}

/** Another published portfolio already owns this public URL. */
export async function publishedSlugTaken(slug: string, excludeId?: IdLike): Promise<boolean> {
  const found = await PortfolioProfile.findOne({
    slug,
    isPublished: true,
    deletedAt: null,
    ...excludeFilter(excludeId),
  }).select('_id');
  return !!found;
}
