'use client';

import { HTMLAttributes, useState } from 'react';
import { useToast } from '@/app/components/ToastController';
import { Input, InputInnerLabel } from '@/app/components/Form';
import formatBytes from '@/app/utilities/formatBytes';
import { FaFileUpload } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE: number = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '0');

interface AddFileProps extends HTMLAttributes<HTMLDivElement> {
  onUpload?: () => void;
  className?: string;
  editId?: string;
}

export default function AddFile({ onUpload, className, editId, ...props }: AddFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const showToast = useToast();

  const handleFiles = (file: File) => {
    // setFiles(Array.from(fileList));
    setFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showToast('Přesažena maximální velikost souboru');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    new Promise((resolve) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setUploadProgress((event.loaded / event.total) * 90);
        }
      });
      xhr.addEventListener('loadend', () => {
        if (xhr.status === 413) {
          showToast('Přesažena maximální velikost účtu', 5000);
        }
        setUploadProgress(100);
        if (onUpload) onUpload();
        resolve(xhr.readyState === 4 && xhr.status === 200);
        if (editId) window.location.reload();
      });
      if (editId) {
        xhr.open('PUT', `/api/share?id=${editId}`, true);
        xhr.send(formData);
      } else {
        xhr.open('POST', '/api/share', true);
        xhr.send(formData);
      }
    });
  };

  return (
    // @ts-expect-error I have no clue why onSubmit is not accepting the event handler
    <form className={'flex flex-col gap-4 max-w-[500px] ' + className} onSubmit={handleSubmit} {...props}>
      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <InputInnerLabel
          className={'w-full h-48 text-center flex flex-col justify-center gap-2 border-dashed relative'}
          otherClassName={'w-0 h-0'}
          type={'file'}
          name={'file'}
          onChange={handleInputChange}
        >
          <span className={`text-end absolute top-0 right-0 p-2 text-alt-gray-700 justify-self-start transition-colors ${file && file.size > MAX_FILE_SIZE && 'text-red-500'}`}>
            {formatBytes(file ? file.size : 0)} / {formatBytes(MAX_FILE_SIZE)}
          </span>
          <FaFileUpload className={'text-5xl w-full'} />
          <span>
            Nahrajte soubor kliknutím
            <br />
            nebo přetažením souboru sem.
          </span>
          {file && <span className={'text-alt-gray-700 overflow-hidden text-ellipsis w-full whitespace-nowrap'}>{file.name}</span>}
        </InputInnerLabel>
      </div>
      <Input className={'w-full'} type={'submit'} value={'Nahrát'} disabled={!file || file.size > MAX_FILE_SIZE} />
      <div className={'w-full h-4 bg-alt-gray-300'}>
        <div className={'bg-aero-500 transition-all h-full'} style={{ width: uploadProgress + '%' }}></div>
      </div>
    </form>
  );
}
