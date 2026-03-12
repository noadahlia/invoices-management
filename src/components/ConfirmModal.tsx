'use client';

import { useTranslations } from 'next-intl';
import { Dialog } from 'radix-ui';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  onConfirm,
  confirmText,
  cancelText,
  isDangerous = false,
}: Props) {
  const t = useTranslations('components.confirm_modal');
  const defaultConfirmText = confirmText ?? t('default_confirm');
  const defaultCancelText = cancelText ?? t('default_cancel');
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <div className={`h-1 w-full bg-gradient-to-r ${isDangerous ? 'from-red-500 to-red-600' : 'from-amber-500 to-amber-600'}`} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDangerous ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <Dialog.Title className="text-base font-bold text-gray-900">{title}</Dialog.Title>
              </div>
              <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <p className="text-sm text-gray-600 mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {defaultCancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${
                  isDangerous
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {defaultConfirmText}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
