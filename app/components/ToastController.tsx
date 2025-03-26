'use client';

import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '@/app/components/Toast';

type ToastType = {
  id: number;
  message: string;
  duration: number;
};

const ToastContext = createContext<(message: string, duration?: number) => void>(() => {});

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = useCallback((message: string, duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={'fixed w-full h-full top-0 left-0 pointer-events-none z-[200] pe-4'}>
        <div className={'absolute bottom-0 right-0 flex flex-col p-4 gap-2'}>
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast key={toast.id} message={toast.message} onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} duration={toast.duration} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
