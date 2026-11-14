import React, { useEffect } from 'react';

export interface ToastMessage {
  text: string;
  kind: 'success' | 'error';
}

interface ToastProps {
  message: ToastMessage | null;
  onClose: () => void;
  /** Auto-hide after this many ms (errors stay until dismissed) */
  duration?: number;
}

/**
 * Feedback for actions, pinned to the bottom of the screen so it's visible
 * wherever the user has scrolled.
 */
export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 6000 }) => {
  useEffect(() => {
    if (!message || message.kind === 'error') return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [message, onClose, duration]);

  if (!message) return null;
  const isError = message.kind === 'error';

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 lg:pl-64 pointer-events-none">
      <div
        role={isError ? 'alert' : 'status'}
        className={`pointer-events-auto w-full max-w-xl rounded-2xl px-4 py-3 flex items-start gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] font-label-md text-label-md ${
          isError ? 'bg-error-container text-on-error-container' : 'bg-primary text-on-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] shrink-0 mt-px">
          {isError ? 'error' : 'check_circle'}
        </span>
        <span className="flex-1 min-w-0">{message.text}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 -mr-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};
