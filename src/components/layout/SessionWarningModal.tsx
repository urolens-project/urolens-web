import { Modal } from '../ui/Modal';

interface SessionWarningModalProps {
  isVisible: boolean;
  onStaySignedIn: () => void;
  accentClassName?: string;
}

export function SessionWarningModal({
  isVisible,
  onStaySignedIn,
  accentClassName = 'bg-emerald-600 hover:bg-emerald-700',
}: SessionWarningModalProps) {
  return (
    <Modal open={isVisible} onClose={onStaySignedIn} title="Session Expiring Soon" maxWidth="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Your session will expire in 2 minutes due to inactivity. Move your mouse or press any key
          to stay signed in.
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
