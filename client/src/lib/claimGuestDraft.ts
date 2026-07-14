import { toast } from 'sonner';
import { userApi } from '@/api';
import { BRAND } from '@/brand/constants';
import {
  clearGuestDraftStorage,
  guestDraftToCertifications,
  guestDraftToContent,
  guestDraftToEducation,
  guestDraftToExperiences,
  guestDraftToProjects,
  guestDraftToSkills,
  peekGuestDraft,
} from '@/context/GuestDraftContext';
import { errorMessage } from '@/lib/apiError';

/** Apply session guest draft to the user's first portfolio (post-signup / gate). */
export async function claimGuestDraftIfAny(): Promise<boolean> {
  const draft = peekGuestDraft();
  if (!draft) return false;

  const profiles = await userApi.getProfiles();
  const profile = profiles[0];
  if (!profile) return false;

  try {
    await userApi.updateContent(profile._id, guestDraftToContent(draft));
    try {
      const settings = await userApi.getSettings(profile._id);
      await userApi.updateSettings(profile._id, {
        ...settings,
        portfolioTheme: draft.themeId,
        siteTitle: draft.content.name
          ? `${draft.content.name} | ${BRAND.name}`
          : settings.siteTitle,
      });
    } catch {
      /* optional */
    }

    for (const skill of guestDraftToSkills(draft)) {
      await userApi.createSkill(profile._id, skill);
    }
    for (const exp of guestDraftToExperiences(draft)) {
      await userApi.createExperience(profile._id, exp);
    }
    for (const proj of guestDraftToProjects(draft)) {
      await userApi.createProject(profile._id, proj);
    }
    for (const edu of guestDraftToEducation(draft)) {
      await userApi.createEducation(profile._id, edu);
    }
    for (const cert of guestDraftToCertifications(draft)) {
      await userApi.createCertification(profile._id, cert);
    }
    clearGuestDraftStorage();
    toast.success('Guest draft saved to your account');
    return true;
  } catch (err) {
    toast.error(errorMessage(err, 'Could not save guest draft — edit from the dashboard'));
    return false;
  }
}
