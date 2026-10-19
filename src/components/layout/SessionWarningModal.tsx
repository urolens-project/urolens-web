import { Modal } from '../ui/Modal';

interface SessionWarningModalProps {
  isVisible: boolean;
  onStaySignedIn: () => void;
  accentClassName?: string;
  // Server-driven (session.idleWarningSeconds) — different roles can get a
  // different warning window, so this must never be a hardcoded "2 minutes".
  warningSeconds?: number;
}

function formatWarningDuration(seconds: number): string {
  if (seconds > 0 && seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

export function SessionWarningModal({
  isVisible,
  onStaySignedIn,
  accentClassName = 'bg-emerald-600 hover:bg-emerald-700',
  warningSeconds = 120,
}: SessionWarningModalProps) {
  return (
    <Modal open={isVisible} onClose={onStaySignedIn} title="Session Expiring Soon" maxWidth="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Your session will expire in {formatWarningDuration(warningSeconds)} due to inactivity.
          Move your mouse or press any key to stay signed in.
        </p>
        <button
          onClick={onStaySignedIn}
          className={`w-full h-10 text-white rounded-xl text-sm font-semibold transition cursor-pointer ${accentClassName}`}
        >
          Stay Signed In
        </button>
      </div>
    </Modal>
  );
}
