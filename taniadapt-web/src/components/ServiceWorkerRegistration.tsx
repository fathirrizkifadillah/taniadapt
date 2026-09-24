'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('TaniAdapt SW registered:', reg.scope);
          })
          .catch((err) => {
            console.log('TaniAdapt SW registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
