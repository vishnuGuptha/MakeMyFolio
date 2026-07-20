import { throwIfNotOk } from '@/lib/apiError';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(
  path: string,
  options: RequestInit = {},
  reqOpts?: { skipUnauthorized?: boolean }
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  await throwIfNotOk(res, `HTTP ${res.status}`, reqOpts);

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Public API
export const publicApi = {
  getDefaultSlug: () => request<{ slug: string | null }>('/api/public/default-slug'),
  getPortfolio: (slug: string) => request<import('@/types').PortfolioData>(`/api/public/portfolio/${slug}`),
  getProfiles: () => request<import('@/types').PortfolioProfile[]>('/api/public/profiles'),
  getTryDemo: () => request<import('@/context/GuestDraftContext').GuestDraft>('/api/public/try-demo'),
  sendContact: (slug: string, data: { name: string; email: string; message: string }) =>
    request(`/api/public/contact/${slug}`, { method: 'POST', body: JSON.stringify(data) }),
  getResumeUrl: (slug: string, download = false) =>
    `${API_BASE}/api/public/portfolio/${slug}/resume${download ? '?download=1' : ''}`,
};

export type AuthRole = 'user' | 'platform_admin';

export interface AuthUser {
  email: string;
  name?: string;
  role: AuthRole;
}

// Auth API
export const authApi = {
  userRegister: (name: string, email: string, password: string) =>
    request<AuthUser & { profile?: { id: string; slug: string } }>('/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  userLogin: (email: string, password: string) =>
    request<AuthUser>('/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  platformLogin: (email: string, password: string) =>
    request<AuthUser>('/api/auth/platform/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request<AuthUser>('/api/auth/me', {}, { skipUnauthorized: true }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/api/auth/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean; message: string; resetUrl?: string }>('/api/auth/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: boolean }>('/api/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),
};

// User portfolio API (dashboard)
function userPath(profileId: string, path: string) {
  return `/api/user/profiles/${profileId}${path}`;
}

export const userApi = {
  getProfiles: () => request<import('@/types').PortfolioProfile[]>('/api/user/profiles'),
  getBinnedProfiles: () =>
    request<import('@/types').PortfolioProfile[]>('/api/user/profiles/bin'),
  checkSlug: (slug: string, excludeId?: string) =>
    request<{ available: boolean; valid: boolean; liveTaken?: boolean; reserved?: boolean }>(
      `/api/user/profiles/check-slug/${slug}${excludeId ? `?excludeId=${excludeId}` : ''}`
    ),
  createProfile: (data: { displayName: string; slug?: string; duplicateFromId?: string }) =>
    request<import('@/types').PortfolioProfile>('/api/user/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProfile: (id: string, data: { displayName?: string; slug?: string }) =>
    request<import('@/types').PortfolioProfile>(`/api/user/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getPreview: (profileId: string) =>
    request<import('@/types').PortfolioData>(`/api/user/profiles/${profileId}/preview`),
  /** Soft-delete: move to bin */
  deleteProfile: (id: string) => request(`/api/user/profiles/${id}`, { method: 'DELETE' }),
  restoreProfile: (id: string) =>
    request<import('@/types').PortfolioProfile>(`/api/user/profiles/${id}/restore`, {
      method: 'POST',
    }),
  permanentlyDeleteProfile: (id: string) =>
    request(`/api/user/profiles/${id}/permanent`, { method: 'DELETE' }),
  publishProfile: (id: string, isPublished: boolean) =>
    request(`/api/user/profiles/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),
  duplicateProfile: (id: string) =>
    request<import('@/types').PortfolioProfile>(`/api/user/profiles/${id}/duplicate`, {
      method: 'POST',
    }),

  getDashboard: (profileId: string) =>
    request<import('@/types').DashboardStats>(userPath(profileId, '/dashboard')),
  getContent: (profileId: string) =>
    request<import('@/types').ProfileContent>(userPath(profileId, '/content')),
  updateContent: (profileId: string, data: Partial<import('@/types').ProfileContent>) =>
    request(userPath(profileId, '/content'), { method: 'PUT', body: JSON.stringify(data) }),

  getResumeUrl: (profileId: string, download = false) =>
    `${API_BASE}${userPath(profileId, '/resume')}${download ? '?download=1' : ''}`,
  uploadResume: async (profileId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}${userPath(profileId, '/resume')}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    await throwIfNotOk(res, 'Upload failed');
    return res.json() as Promise<{ resumeUrl: string }>;
  },
  deleteResume: (profileId: string) =>
    request(userPath(profileId, '/resume'), { method: 'DELETE' }),
  importFromResume: async (profileId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}${userPath(profileId, '/resume/import')}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    await throwIfNotOk(res, 'Import failed');
    return res.json() as Promise<{
      content: import('@/types').ProfileContent;
      resumeUrl: string;
      summary: {
        displayName: string;
        skills: number;
        experiences: number;
        projects: number;
        education: number;
        certifications: number;
      };
    }>;
  },

  enhanceWithAi: (
    profileId: string,
    section: import('@/components/admin/GenerateWithAiButton').AiEnhanceSection,
    context: Record<string, unknown>
  ) =>
    request<{ result: string | string[] }>(userPath(profileId, '/ai/enhance'), {
      method: 'POST',
      body: JSON.stringify({ section, context }),
    }),

  getSettings: (profileId: string) =>
    request<import('@/types').SiteSettings>(userPath(profileId, '/settings')),
  updateSettings: (profileId: string, data: Partial<import('@/types').SiteSettings>) =>
    request(userPath(profileId, '/settings'), { method: 'PUT', body: JSON.stringify(data) }),

  getSkills: (profileId: string) =>
    request<import('@/types').SkillCategory[]>(userPath(profileId, '/skills')),
  createSkill: (profileId: string, data: Partial<import('@/types').SkillCategory>) =>
    request(userPath(profileId, '/skills'), { method: 'POST', body: JSON.stringify(data) }),
  updateSkill: (profileId: string, id: string, data: Partial<import('@/types').SkillCategory>) =>
    request(userPath(profileId, `/skills/${id}`), { method: 'PUT', body: JSON.stringify(data) }),
  reorderSkills: (profileId: string, orderedIds: string[]) =>
    request<import('@/types').SkillCategory[]>(userPath(profileId, '/skills/reorder'), {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    }),
  deleteSkill: (profileId: string, id: string) =>
    request(userPath(profileId, `/skills/${id}`), { method: 'DELETE' }),

  getExperience: (profileId: string) =>
    request<import('@/types').Experience[]>(userPath(profileId, '/experience')),
  createExperience: (profileId: string, data: Partial<import('@/types').Experience>) =>
    request(userPath(profileId, '/experience'), { method: 'POST', body: JSON.stringify(data) }),
  updateExperience: (profileId: string, id: string, data: Partial<import('@/types').Experience>) =>
    request(userPath(profileId, `/experience/${id}`), { method: 'PUT', body: JSON.stringify(data) }),
  reorderExperience: (profileId: string, orderedIds: string[]) =>
    request<import('@/types').Experience[]>(userPath(profileId, '/experience/reorder'), {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    }),
  deleteExperience: (profileId: string, id: string) =>
    request(userPath(profileId, `/experience/${id}`), { method: 'DELETE' }),

  getProjects: (profileId: string) =>
    request<import('@/types').Project[]>(userPath(profileId, '/projects')),
  createProject: (profileId: string, data: Partial<import('@/types').Project>) =>
    request(userPath(profileId, '/projects'), { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (profileId: string, id: string, data: Partial<import('@/types').Project>) =>
    request(userPath(profileId, `/projects/${id}`), { method: 'PUT', body: JSON.stringify(data) }),
  reorderProjects: (profileId: string, orderedIds: string[]) =>
    request<import('@/types').Project[]>(userPath(profileId, '/projects/reorder'), {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    }),
  deleteProject: (profileId: string, id: string) =>
    request(userPath(profileId, `/projects/${id}`), { method: 'DELETE' }),

  getEducation: (profileId: string) =>
    request<import('@/types').Education[]>(userPath(profileId, '/education')),
  createEducation: (profileId: string, data: Partial<import('@/types').Education>) =>
    request(userPath(profileId, '/education'), { method: 'POST', body: JSON.stringify(data) }),
  updateEducation: (profileId: string, id: string, data: Partial<import('@/types').Education>) =>
    request(userPath(profileId, `/education/${id}`), { method: 'PUT', body: JSON.stringify(data) }),
  deleteEducation: (profileId: string, id: string) =>
    request(userPath(profileId, `/education/${id}`), { method: 'DELETE' }),

  getCertifications: (profileId: string) =>
    request<import('@/types').Certification[]>(userPath(profileId, '/certifications')),
  createCertification: (profileId: string, data: Partial<import('@/types').Certification>) =>
    request(userPath(profileId, '/certifications'), { method: 'POST', body: JSON.stringify(data) }),
  updateCertification: (profileId: string, id: string, data: Partial<import('@/types').Certification>) =>
    request(userPath(profileId, `/certifications/${id}`), { method: 'PUT', body: JSON.stringify(data) }),
  deleteCertification: (profileId: string, id: string) =>
    request(userPath(profileId, `/certifications/${id}`), { method: 'DELETE' }),

  getContactMessages: (profileId: string) =>
    request<import('@/types').ContactMessage[]>(userPath(profileId, '/contact-messages')),
  updateContactMessage: (profileId: string, id: string, data: Partial<import('@/types').ContactMessage>) =>
    request(userPath(profileId, `/contact-messages/${id}`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getMedia: (profileId: string) =>
    request<import('@/types').MediaAsset[]>(userPath(profileId, '/media')),
  uploadMedia: async (profileId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}${userPath(profileId, '/media/upload')}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    await throwIfNotOk(res, 'Upload failed');
    return res.json() as Promise<import('@/types').MediaAsset>;
  },
  deleteMedia: (profileId: string, id: string) =>
    request(userPath(profileId, `/media/${id}`), { method: 'DELETE' }),
};

/** @deprecated use userApi */
export const adminApi = userApi;

// Platform admin API
export const platformApi = {
  getDashboard: () => request<{
    totalUsers: number;
    totalProfiles: number;
    publishedProfiles: number;
    unreadMessages: number;
    recentUsers: { name: string; email: string; createdAt: string }[];
    recentProfiles: import('@/types').PortfolioProfile[];
  }>('/api/platform/dashboard'),
  getUsers: () => request<{
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    portfolios: { _id: string; slug: string; displayName: string; isPublished: boolean }[];
  }[]>('/api/platform/users'),
  getProfiles: () => request<(import('@/types').PortfolioProfile & { owner?: { name: string; email: string } })[]>('/api/platform/profiles'),
  publishProfile: (id: string, isPublished: boolean) =>
    request(`/api/platform/profiles/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    }),
  deleteUser: (id: string) => request(`/api/platform/users/${id}`, { method: 'DELETE' }),
  getActivity: () => request<{ action: string; entity: string; timestamp: string }[]>('/api/platform/activity'),
  getTryDemo: () =>
    request<import('@/context/GuestDraftContext').GuestDraft>('/api/platform/try-demo'),
  saveTryDemo: (data: import('@/context/GuestDraftContext').GuestDraft) =>
    request<import('@/context/GuestDraftContext').GuestDraft>('/api/platform/try-demo', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  resetTryDemo: () =>
    request<import('@/context/GuestDraftContext').GuestDraft>('/api/platform/try-demo/reset', {
      method: 'POST',
    }),
};
