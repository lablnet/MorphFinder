import React from 'react';

interface WebShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const WebShareDialog: React.FC<WebShareDialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-shell-surface border border-shell-border shadow-2xl p-6 text-current flex flex-col gap-5 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
