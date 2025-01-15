'use client'

import {FormEvent, HTMLAttributes, useEffect, useState} from "react";
import axios from "axios";
import {Input, InputInnerLabel} from "@/app/components/Form";
import {FaFileUpload} from "react-icons/fa";
import {useToast} from "@/app/components/ToastController";
import formatBytes from "@/app/utilities/formatBytes";
import {className} from "postcss-selector-parser";

// const MAX_FILE_SIZE: number = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '100000000');
const MAX_FILE_SIZE: number = 1073741824;

export default function Add() {
    return (
        <main className={'flex justify-center items-center h-screen'}>
            <AddFile className={'w-full h-full justify-center'}/>
        </main>
    )
}

interface AddFileProps extends HTMLAttributes<HTMLDivElement> {
    onUpload?: () => void,
    className?: string
}

export function AddFile({onUpload, className, ...props}: AddFileProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const showToast = useToast();

    const handleFiles = (file: File) => {
        // setFiles(Array.from(fileList));
        setFile(file)
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            showToast('Přesažena maximální velikost souboru');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);


        axios.post('/api/share', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                console.log(progressEvent)
                if (progressEvent.progress) {
                    setUploadProgress(progressEvent.progress * 80);
                }
            }
        })
            .then((res) => {
                setUploadProgress(100);
                onUpload && onUpload();
                showToast('Soubor byl úspěšně nahrán.');

            })
            .catch((err) => {
                console.log(err);
                showToast('Nastal problém při nahrávání souboru.');
            });
    }

    return (
        <form className={'flex flex-col gap-4 max-w-[500px] ' + className} onSubmit={handleSubmit} {...props}>
            <div onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}>
                <InputInnerLabel
                    className={'w-full h-48 text-center flex flex-col justify-center gap-2 border-dashed relative'}
                    otherClassName={'w-0 h-0'} type={'file'} name={'file'}
                    onChange={handleInputChange}>
                    <span className={`text-end absolute top-0 right-0 p-2 text-alt-gray-700 justify-self-start transition-colors ${file && file.size > MAX_FILE_SIZE && 'text-red-500'}`}>{formatBytes(file ? file.size : 0)} / {formatBytes(MAX_FILE_SIZE)}</span>
                    <FaFileUpload className={'text-5xl w-full'}/>
                    <span>Nahrajte soubor kliknutím<br/>nebo přetažením souboru sem.</span>
                    {file && <span className={'text-alt-gray-700 overflow-hidden text-ellipsis w-full whitespace-nowrap'}>{file.name}</span>}
                </InputInnerLabel>
            </div>
            <Input className={'w-full'} type={'submit'} value={'Nahrát'} disabled={!file || file.size > MAX_FILE_SIZE}/>
            <div className={'w-full h-4 bg-alt-gray-300'}>
                <div className={'bg-aero-500 transition-all h-full'} style={{width: uploadProgress + '%'}}></div>
            </div>
        </form>
    )
}
