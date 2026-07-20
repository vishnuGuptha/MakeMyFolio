import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AdminProfileProvider } from '@/context/AdminProfileContext';
import { UnsavedChangesProvider } from '@/context/UnsavedChangesContext';
import RequireUser from '@/components/auth/RequireUser';
import RequirePlatformAdmin from '@/components/auth/RequirePlatformAdmin';
import AdminLayout from '@/components/admin/AdminLayout';
import PlatformLayout from '@/components/platform/PlatformLayout';
import MarketingLayout from '@/pages/marketing/MarketingLayout';
import HomeRedirect from '@/pages/HomeRedirect';
import LegacyPortfolioRedirect from '@/pages/LegacyPortfolioRedirect';
import PortfolioShell from '@/pages/portfolio/PortfolioShell';
import PortfolioHomePage from '@/pages/portfolio/PortfolioHomePage';
import PortfolioSectionPage from '@/pages/portfolio/PortfolioSectionPage';
import PublicPortfolioEntry, { SubdomainPortfolioRoutes } from '@/pages/portfolio/PublicPortfolioEntry';
import NotFoundPage from '@/pages/NotFoundPage';
import { isPortfolioSubdomainHost } from '@/lib/domains';
import UserLoginPage from '@/pages/user/UserLoginPage';
import UserRegisterPage from '@/pages/user/UserRegisterPage';
import ForgotPasswordPage from '@/pages/user/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/user/ResetPasswordPage';
import PlatformLoginPage from '@/pages/platform/PlatformLoginPage';

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminProfilesPage = lazy(() => import('@/pages/admin/AdminProfilesPage'));
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage'));
const AdminSkillsPage = lazy(() => import('@/pages/admin/AdminSkillsPage'));
const AdminExperiencePage = lazy(() => import('@/pages/admin/AdminExperiencePage'));
const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'));
const AdminEducationPage = lazy(() => import('@/pages/admin/AdminEducationPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminAddThemePage = lazy(() => import('@/pages/admin/AdminAddThemePage'));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage'));
const AdminMediaPage = lazy(() => import('@/pages/admin/AdminMediaPage'));
const AdminOnboardingPage = lazy(() => import('@/pages/admin/AdminOnboardingPage'));
const AdminAccountPage = lazy(() => import('@/pages/admin/AdminAccountPage'));
const PlatformDashboardPage = lazy(() => import('@/pages/platform/PlatformDashboardPage'));
const PlatformUsersPage = lazy(() => import('@/pages/platform/PlatformUsersPage'));
const PlatformPortfoliosPage = lazy(() => import('@/pages/platform/PlatformPortfoliosPage'));
const PlatformActivityPage = lazy(() => import('@/pages/platform/PlatformActivityPage'));
const PlatformTryDemoPage = lazy(() => import('@/pages/platform/PlatformTryDemoPage'));
const TryEditorPage = lazy(() => import('@/pages/marketing/TryEditorPage'));
const ExamplesPage = lazy(() => import('@/pages/marketing/ExamplesPage'));
const GuestFullPreviewPage = lazy(() => import('@/pages/marketing/GuestFullPreviewPage'));
const ThemeDemoEmbedPage = lazy(() => import('@/pages/marketing/ThemeDemoEmbedPage'));
const PrivacyPage = lazy(() => import('@/pages/marketing/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/marketing/TermsPage'));

function Fallback({ label }: { label: string }) {
  return <div className="text-subtle font-mono text-sm p-6">Loading {label}...</div>;
}

export default function App() {
  const onPortfolioSubdomain = isPortfolioSubdomainHost();

  return (
    <ThemeProvider>
      <AuthProvider>
        <UnsavedChangesProvider>
          <AdminProfileProvider>
          <Toaster position="top-right" richColors />
          {onPortfolioSubdomain ? (
            <SubdomainPortfolioRoutes />
          ) : (
          <Routes>
            <Route path="/try/preview" element={<Suspense fallback={<Fallback label="preview" />}><GuestFullPreviewPage /></Suspense>} />
            <Route path="/theme-demo/:themeId" element={<Suspense fallback={<Fallback label="theme" />}><ThemeDemoEmbedPage /></Suspense>} />

            <Route element={<MarketingLayout />}>
              <Route index element={<HomeRedirect />} />
              <Route
                path="try"
                element={
                  <Suspense fallback={<Fallback label="try" />}>
                    <TryEditorPage />
                  </Suspense>
                }
              />
              <Route
                path="examples"
                element={
                  <Suspense fallback={<Fallback label="examples" />}>
                    <ExamplesPage />
                  </Suspense>
                }
              />
            </Route>

            <Route path="/p/*" element={<LegacyPortfolioRedirect />} />
            <Route path="/not-found" element={<NotFoundPage />} />

            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/register" element={<UserRegisterPage />} />
            <Route
              path="/privacy"
              element={
                <Suspense fallback={<Fallback label="privacy" />}>
                  <PrivacyPage />
                </Suspense>
              }
            />
            <Route
              path="/terms"
              element={
                <Suspense fallback={<Fallback label="terms" />}>
                  <TermsPage />
                </Suspense>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route
              path="/preview/:profileId"
              element={
                <RequireUser>
                  <PortfolioShell mode="preview" />
                </RequireUser>
              }
            >
              <Route index element={<PortfolioHomePage />} />
              <Route path=":section" element={<PortfolioSectionPage />} />
            </Route>
            <Route
              path="/dashboard"
              element={
                <RequireUser>
                  <AdminLayout />
                </RequireUser>
              }
            >
              <Route index element={<Suspense fallback={<Fallback label="dashboard" />}><AdminDashboardPage /></Suspense>} />
              <Route path="onboarding" element={<Suspense fallback={<Fallback label="onboarding" />}><AdminOnboardingPage /></Suspense>} />
              <Route path="account" element={<Suspense fallback={<Fallback label="account" />}><AdminAccountPage /></Suspense>} />
              <Route path="portfolios" element={<Suspense fallback={<Fallback label="portfolios" />}><AdminProfilesPage /></Suspense>} />
              <Route path="content" element={<Suspense fallback={<Fallback label="content" />}><AdminContentPage /></Suspense>} />
              <Route path="skills" element={<Suspense fallback={<Fallback label="skills" />}><AdminSkillsPage /></Suspense>} />
              <Route path="experience" element={<Suspense fallback={<Fallback label="experience" />}><AdminExperiencePage /></Suspense>} />
              <Route path="projects" element={<Suspense fallback={<Fallback label="projects" />}><AdminProjectsPage /></Suspense>} />
              <Route path="education" element={<Suspense fallback={<Fallback label="education" />}><AdminEducationPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<Fallback label="settings" />}><AdminSettingsPage /></Suspense>} />
              <Route path="themes/new" element={<Suspense fallback={<Fallback label="themes" />}><AdminAddThemePage /></Suspense>} />
              <Route path="messages" element={<Suspense fallback={<Fallback label="messages" />}><AdminMessagesPage /></Suspense>} />
              <Route path="media" element={<Suspense fallback={<Fallback label="media" />}><AdminMediaPage /></Suspense>} />
            </Route>
            <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

            <Route path="/platform/login" element={<PlatformLoginPage />} />
            <Route
              path="/platform"
              element={
                <RequirePlatformAdmin>
                  <PlatformLayout />
                </RequirePlatformAdmin>
              }
            >
              <Route index element={<Suspense fallback={<Fallback label="platform" />}><PlatformDashboardPage /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<Fallback label="users" />}><PlatformUsersPage /></Suspense>} />
              <Route path="portfolios" element={<Suspense fallback={<Fallback label="portfolios" />}><PlatformPortfoliosPage /></Suspense>} />
              <Route path="try-demo" element={<Suspense fallback={<Fallback label="try demo" />}><PlatformTryDemoPage /></Suspense>} />
              <Route path="activity" element={<Suspense fallback={<Fallback label="activity" />}><PlatformActivityPage /></Suspense>} />
            </Route>

            <Route path="/:slug" element={<PublicPortfolioEntry />}>
              <Route element={<PortfolioShell />}>
                <Route index element={<PortfolioHomePage />} />
                <Route path=":section" element={<PortfolioSectionPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          )}
          </AdminProfileProvider>
        </UnsavedChangesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
