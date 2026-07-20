import { MarketingChrome } from './MarketingLayout';
import { GuestDraftProvider, useGuestDraft } from '@/context/GuestDraftContext';

function ChromeWithAuthGate() {
  const { authGate, closeAuthGate } = useGuestDraft();
  return <MarketingChrome authGate={authGate} closeAuthGate={closeAuthGate} />;
}

/** Loaded only on /try — keeps GuestDraft + themes out of the home bundle. */
export default function TryGuestShell() {
  return (
    <GuestDraftProvider>
      <ChromeWithAuthGate />
    </GuestDraftProvider>
  );
}
