import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AdminProfileProvider } from '@/context/AdminProfileContext';
import { UnsavedChangesProvider } from '@/context/UnsavedChangesContext';
import RequireUser from '@/components/auth/RequireUser';
import RequirePlatformAdmin from '@/components/auth/RequirePlatformAdmin';
import MarketingLayout from '@/pages/marketing/MarketingLayout';
import HomeRedirect from '@/pages/HomeRedirect';
import LegacyPortfolioRedirect from '@/pages/LegacyPortfolioRedirect';
import NotFoundPage from '@/pages/NotFoundPage';
import { isPortfolioSubdomainHost } from '@/lib/domains';
import { PageLoader } from '@/components/ui/PageLoader';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { CartSync } from '@/components/billing/CartSync';

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const PlatformLayout = lazy(() => import('@/components/platform/PlatformLayout'));
const PortfolioShell = lazy(() => import('@/pages/portfolio/PortfolioShell'));
const PortfolioHomePage = lazy(() => import('@/pages/portfolio/PortfolioHomePage'));
const PortfolioSectionPage = lazy(() => import('@/pages/portfolio/PortfolioSectionPage'));
const PublicPortfolioEntry = lazy(() => import('@/pages/portfolio/PublicPortfolioEntry'));
const SubdomainPortfolioRoutes = lazy(() =>
  import('@/pages/portfolio/PublicPortfolioEntry').then((m) => ({ default: m.SubdomainPortfolioRoutes }))
);
const UserLoginPage = lazy(() => import('@/pages/user/UserLoginPage'));
const UserRegisterPage = lazy(() => import('@/pages/user/UserRegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/user/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/user/ResetPasswordPage'));
const PlatformLoginPage = lazy(() => import('@/pages/platform/PlatformLoginPage'));

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
const ThemesPage = lazy(() => import('@/pages/marketing/ThemesPage'));
const PricingPage = lazy(() => import('@/pages/marketing/PricingPage'));
const CartPage = lazy(() => import('@/pages/marketing/CartPage'));
const PricingRoute = lazy(() =>
  import('@/pages/marketing/BillingRoutes').then((m) => ({ default: m.PricingRoute }))
);
const CartRoute = lazy(() =>
  import('@/pages/marketing/BillingRoutes').then((m) => ({ default: m.CartRoute }))
);
const GuestFullPreviewPage = lazy(() => import('@/pages/marketing/GuestFullPreviewPage'));
const ThemeDemoEmbedPage = lazy(() => import('@/pages/marketing/ThemeDemoEmbedPage'));
const PrivacyPage = lazy(() => import('@/pages/marketing/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/marketing/TermsPage'));

function Fallback({ label }: { label?: string }) {
  return <PageLoader variant="page" label={label ? `Loading ${label}` : undefined} immediate />;
}

export default function App() {
  const onPortfolioSubdomain = isPortfolioSubdomainHost();

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartSync />
        <TooltipProvider>
        <UnsavedChangesProvider>
          <AdminProfileProvider>
          <Toaster position="top-right" richColors />
          {onPortfolioSubdomain ? (
            <Suspense fallback={<Fallback label="portfolio" />}>
              <SubdomainPortfolioRoutes />
            </Suspense>
          ) : (
          <Routes>
            <Route path="/try/preview" element={<Suspense fallback={<Fallback label="preview" />}><GuestFullPreviewPage /></Suspense>} />
            <Route path="/theme-demo/:themeId" element={<Suspense fallback={<Fallback label="theme" />}><ThemeDemoEmbedPage /></Suspense>} />

            <Route element={<MarketingLayout />}>
              <Route index element={<HomeRedirect />} />
              <Route
                path="try"
                element={
                  <Suspense fallback={<Fallback label="playground" />}>
                    <TryEditorPage />
                  </Suspense>
                }
              />
              <Route
                path="themes"
                element={
                  <Suspense fallback={<Fallback label="themes" />}>
                    <ThemesPage />
                  </Suspense>
                }
              />
              <Route
                path="pricing"
                element={
                  <Suspense fallback={<Fallback label="pricing" />}>
                    <PricingRoute />
                  </Suspense>
                }
              />
              <Route
                path="cart"
                element={
                  <Suspense fallback={<Fallback label="cart" />}>
                    <CartRoute />
                  </Suspense>
                }
              />
              <Route path="examples" element={<Navigate to="/themes" replace />} />
            </Route>

            <Route path="/p/*" element={<LegacyPortfolioRedirect />} />
            <Route path="/not-found" element={<NotFoundPage />} />

            <Route path="/login" element={<Suspense fallback={<Fallback label="login" />}><UserLoginPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<Fallback label="register" />}><UserRegisterPage /></Suspense>} />
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
            <Route path="/forgot-password" element={<Suspense fallback={<Fallback label="forgot" />}><ForgotPasswordPage /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<Fallback label="reset" />}><ResetPasswordPage /></Suspense>} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route
              path="/preview/:profileId"
              element={
                <RequireUser>
                  <Suspense fallback={<Fallback label="preview" />}>
                    <PortfolioShell mode="preview" />
                  </Suspense>
                </RequireUser>
              }
            >
              <Route index element={<Suspense fallback={<Fallback label="portfolio" />}><PortfolioHomePage /></Suspense>} />
              <Route path=":section" element={<Suspense fallback={<Fallback label="portfolio" />}><PortfolioSectionPage /></Suspense>} />
            </Route>
            <Route
              path="/dashboard"
              element={
                <RequireUser>
                  <Suspense fallback={<Fallback label="dashboard" />}>
                    <AdminLayout />
                  </Suspense>
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
              <Route
                path="pricing"
                element={
                  <Suspense fallback={<Fallback label="pricing" />}>
                    <PricingPage />
                  </Suspense>
                }
              />
              <Route
                path="cart"
                element={
                  <Suspense fallback={<Fallback label="cart" />}>
                    <CartPage />
                  </Suspense>
                }
              />
            </Route>
            <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />

            <Route path="/platform/login" element={<Suspense fallback={<Fallback label="login" />}><PlatformLoginPage /></Suspense>} />
            <Route
              path="/platform"
              element={
                <RequirePlatformAdmin>
                  <Suspense fallback={<Fallback label="platform" />}>
                    <PlatformLayout />
                  </Suspense>
                </RequirePlatformAdmin>
              }
            >
              <Route index element={<Suspense fallback={<Fallback label="platform" />}><PlatformDashboardPage /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<Fallback label="users" />}><PlatformUsersPage /></Suspense>} />
              <Route path="portfolios" element={<Suspense fallback={<Fallback label="portfolios" />}><PlatformPortfoliosPage /></Suspense>} />
              <Route path="try-demo" element={<Suspense fallback={<Fallback label="playground seed" />}><PlatformTryDemoPage /></Suspense>} />
              <Route path="activity" element={<Suspense fallback={<Fallback label="activity" />}><PlatformActivityPage /></Suspense>} />
            </Route>

            <Route
              path="/:slug"
              element={
                <Suspense fallback={<Fallback label="portfolio" />}>
                  <PublicPortfolioEntry />
                </Suspense>
              }
            >
              <Route
                element={
                  <Suspense fallback={<Fallback label="portfolio" />}>
                    <PortfolioShell />
                  </Suspense>
                }
              >
                <Route index element={<Suspense fallback={<Fallback label="portfolio" />}><PortfolioHomePage /></Suspense>} />
                <Route path=":section" element={<Suspense fallback={<Fallback label="portfolio" />}><PortfolioSectionPage /></Suspense>} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          )}
          </AdminProfileProvider>
        </UnsavedChangesProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
