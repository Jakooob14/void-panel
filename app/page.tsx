'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/login';
  }, []);

  return <span>Zde zatím nic není :D</span>;
}
