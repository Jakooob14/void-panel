'use client';

import { useEffect, useState } from 'react';
import { getIsOnline, startComputer } from '@/app/actions/remoteComputer';
import { AnchorButton } from '@/app/components/Buttons';
import { useToast } from '@/app/components/ToastController';

export default function RemoteComputerStart() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const showToast = useToast();

  useEffect(() => {
    setInterval(async () => {
      setIsOnline(await getIsOnline());
    }, 1000);
  }, []);

  const handleStartComputer = async () => {
    const isResolved = await startComputer();

    showToast(isResolved ? 'started' : 'error');
  };

  return (
    <div>
      <span>Online: {isOnline === null ? 'pinging...' : isOnline ? 'yes' : 'no'}</span>
      <AnchorButton onClick={handleStartComputer}>{isStarting ? 'Spouští se' : 'Spustit'}</AnchorButton>
    </div>
  );
}
