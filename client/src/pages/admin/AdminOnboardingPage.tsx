import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import {
  completeOnboarding,
  getOnboardingDone,
  markOnboardingStep,
  ONBOARDING_STEPS,
  skipOnboarding,
  type OnboardingStepId,
} from '@/lib/onboarding';
import { getPortfolioViewUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AdminOnboardingPage() {
  const { activeProfile, refreshProfiles } = useAdminProfile();
  const navigate = useNavigate();
  const [done, setDone] = useState<OnboardingStepId[]>(() => getOnboardingDone());

  const current = useMemo(
    () => ONBOARDING_STEPS.find((s) => !done.includes(s.id)) || null,
    [done]
  );

  const markAndGo = (id: OnboardingStepId, to: string) => {
    markOnboardingStep(id);
    setDone(getOnboardingDone());
    navigate(to);
  };

  const finish = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  const previewHref = activeProfile
    ? getPortfolioViewUrl(activeProfile)
    : '#';

  return (
    <RequireActiveProfile>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Welcome to MakeMyFolio</h1>
          <p className="text-sm text-subtle mt-1">
            Five quick steps for{' '}
            <span className="text-accent">{activeProfile?.displayName}</span>
          </p>
        </div>

        <Card className="space-y-1 p-2">
          {ONBOARDING_STEPS.map((step, i) => {
            const isDone = done.includes(step.id);
            const isCurrent = current?.id === step.id;
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 rounded-lg px-3 py-3 ${
                  isCurrent ? 'bg-accent/10' : ''
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-subtle shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary">
                    {i + 1}. {step.title}
                  </p>
                  <p className="text-xs text-subtle mt-0.5">{step.description}</p>
                  {isCurrent && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.id === 'preview' ? (
                        <>
                          <Button size="sm" asChild>
                            <a href={previewHref} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open preview
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              markOnboardingStep('preview');
                              setDone(getOnboardingDone());
                            }}
                          >
                            Mark done
                          </Button>
                        </>
                      ) : step.id === 'publish' ? (
                        <>
                          <Button size="sm" asChild>
                            <Link to="/dashboard">Go to Publish</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              markOnboardingStep('publish');
                              await refreshProfiles();
                              finish();
                            }}
                          >
                            Finish setup
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => markAndGo(step.id, step.to)}>
                          Continue
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Card>

        <div className="flex flex-wrap gap-2">
          {!current && (
            <Button onClick={finish}>Go to dashboard</Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              skipOnboarding();
              navigate('/dashboard');
            }}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </RequireActiveProfile>
  );
}
