'use client';

import Image from 'next/image';
import { FaClock, FaFile, FaTrashAlt } from 'react-icons/fa';
import DeleteButton from '@/app/share/DeleteButton';
import Link from 'next/link';
import DownloadButton from '@/app/share/DownloadButton';
import { FaDownload } from 'react-icons/fa6';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/cs';
import { useEffect, useState } from 'react';

interface FileProps {
  fileId: string;
  fileName: string;
  isImage: boolean;
  expiresAt: Date;
}

export default function File({ fileId, fileName, isImage = false, expiresAt }: FileProps) {
  dayjs.locale('cs');
  dayjs.extend(duration);

  const [timeLeft, setTimeLeft] = useState<string | null>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs();
      const expiration = dayjs(expiresAt);
      const diff = expiration.diff(now);

      if (diff > 0) {
        const durationObj = dayjs.duration(diff);

        // Show days, months, and years if more than 1 day
        if (durationObj.days() > 0 || durationObj.months() > 0 || durationObj.years() > 0) {
          const years = durationObj.years();
          const months = durationObj.months();
          const days = durationObj.days();
          setTimeLeft(
            `${years > 0 ? (years === 1 ? `${years} rok ` : years < 5 ? `${years} roky ` : `${years} let `) : ''}${months > 0 ? (months === 1 ? `${months} měsíc ` : months < 5 ? `${months} měsíce ` : `${months} měsíců `) : ''}${days > 0 ? (days === 1 ? `${days} den ` : days < 5 ? `${days} dny ` : `${days} dnů `) : ''}`
          );
        } else if (durationObj.hours() > 0) {
          // If less than 1 day, use hours, minutes
          setTimeLeft(`${durationObj.hours().toString().padStart(2, '0')}:${durationObj.minutes().toString().padStart(2, '0')}`);
        } else {
          // If less than 1 hour, use minutes, and seconds
          setTimeLeft(`${durationObj.minutes().toString().padStart(2, '0')}:${durationObj.seconds().toString().padStart(2, '0')}`);
        }
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft ? (
    <div className={'text-white transition-colors hover:text-white w-[320px] h-[275px] bg-alt-gray-100 hover:bg-[hsl(0,0%,7%)] flex flex-col justify-between p-4 gap-4'}>
      <span className={'overflow-hidden whitespace-nowrap text-ellipsis w-full min-h-6'} title={fileName}>
        {fileName}
      </span>
      <Link href={`/share/${fileId}`} className={'text-white hover:text-white text-[70px] w-full overflow-hidden flex justify-center'}>
        {isImage ? (
          <Image
            className={'w-full h-full object-cover data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/10'}
            width={200}
            height={200}
            src={`/api/share?id=${fileId}&w=150`}
            alt={fileName}
            unoptimized={true}
            data-loaded={false}
            onLoad={(event) => {
              event.currentTarget.setAttribute('data-loaded', 'true');
            }}
          />
        ) : (
          <FaFile className={'w-min'} />
        )}
      </Link>
      <div className={'flex justify-between gap-2'}>
        <span className={'flex items-center gap-1.5'}>
          <FaClock className={'mb-0.5'} /> {timeLeft}
        </span>
        <div className={'flex justify-end gap-2'}>
          <DeleteButton className={'text-xl transition-colors hover:text-red-500'} id={fileId}>
            <FaTrashAlt />
          </DeleteButton>
          <DownloadButton url={`/api/share?id=${fileId}`} name={fileName}>
            <FaDownload className={'text-xl transition-colors hover:text-aero-600'} />
          </DownloadButton>
        </div>
      </div>
    </div>
  ) : null;
}
