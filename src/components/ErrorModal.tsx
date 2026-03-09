'use client';

import { Dialog } from 'radix-ui';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type MessageType = 'error' | 'success' | 'info';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: MessageType;
  title?: string;
  message: string;
}

const CONFIG: Record<MessageType, { icon: React.ReactNode; bgColor: string; gradientColor: string; buttonColor: string; titleColor: string }> = {
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    bgColor: 'bg-red-50',
    gradientColor: 'from-red-500 to-red-600',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    titleColor: 'text-red-600',
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    bgColor: 'bg-emerald-50',
    gradientColor: 'from-emerald-500 to-emerald-600',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    titleColor: 'text-emerald-600',
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bgColor: 'bg-blue-50',
    gradientColor: 'from-blue-500 to-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    titleColor: 'text-blue-600',
  },
};

const TITLES: Record<MessageType, string> = {
  error: 'Erreur',
  success: 'Succès',
  info: 'Information',
};

export default function MessageModal({ open, onOpenChange, type = 'info', title, message }: Props) {
  const config = CONFIG[type];
  const displayTitle = title || TITLES[type];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
          <div className={`h-1 w-full bg-gradient-to-r ${config.gradientColor}`} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${config.bgColor} ${config.titleColor}`}>
                  {config.icon}
                </div>
                <Dialog.Title className="text-base font-bold text-gray-900">{displayTitle}</Dialog.Title>
              </div>
              <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <p className="text-sm text-gray-600 mb-6">{message}</p>

            <button
              onClick={() => onOpenChange(false)}
              className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white ${config.buttonColor} transition-colors`}
            >
              Fermer
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
