'use client';

import { ReactNode, useState } from 'react';
import { useToast } from '@/app/components/ToastController';
import { useModal } from '@/app/components/ModalController';
import { Modal } from '@/app/components/Modal';

interface DownloadProps {
  children?: ReactNode;
  className?: string;
  url: string;
  name: string;
}

export default function DownloadButton({ children, url, name }: DownloadProps) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const showToast = useToast();
  const { showModal, closeModal } = useModal();

  const handleDownload = () => {
    setDownloadProgress(0);

    const xhr = new XMLHttpRequest();

    try {
      new Promise((resolve) => {
        xhr.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setDownloadProgress((event.loaded / event.total) * 100);
          }
        });
        xhr.addEventListener('loadend', () => {
          resolve(xhr.readyState === 4 && xhr.status === 200);
        });
        xhr.responseType = 'blob';
        xhr.open('GET', url, true);
        xhr.send();
      }).then(() => {
        const res = xhr.response;

        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloadProgress(null);
        showToast('Soubor byl úspěšně stažen.');
        closeModal();
      });
    } catch (err: any) {
      console.error('Download failed', err.stack);
      showToast('Něco se nepovedlo při stahování souboru. ;(');
    }
  };

  return (
    <>
      {downloadProgress !== null ? (
        <Modal locked={true} title={'Stahování'}>
          <div className={'w-full h-4 bg-alt-gray-300 mt-4'}>
            <div className={'bg-aero-500 transition-all h-full'} style={{ width: downloadProgress + '%' }}></div>
          </div>
        </Modal>
      ) : null}
      <button className={'cursor-pointer'} onClick={handleDownload}>
        {children}
      </button>
    </>
  );
}
