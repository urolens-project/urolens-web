import { useState } from 'react';

const MESSAGES: Record<string, string> = {
  timeout: 'You were signed out due to inactivity. Please sign in again to continue.',
  expired: 'Your session has expired. Please sign in again to continue.',
};

/** Dismissible banner for /login?reason=timeout|expired. Renders nothing for other reasons. */
export default function SessionReasonBanner({ reason }: { reason: string | null }) {
  const [dismissed, setDismissed] = useState(false);
  const message = reason ? MESSAGES[reason] : undefined;
  if (!message || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50/95 backdrop-blur-sm px-6 py-2.5">
      <p className="text-xs font-medium text-amber-800">{message}</p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
}
