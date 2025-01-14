'use client'

import {FormEvent, ReactNode, useEffect, useState} from "react";
import axios from "axios";
import Link from "next/link";
import {FaDownload} from "react-icons/fa6";
import {FaFile, FaLink, FaTrashAlt} from "react-icons/fa";
import Image from "next/image";
import {Modal} from "@/app/components/Modal";
import {AnchorButton} from "@/app/components/Buttons";
import {AddFile} from "@/app/add/page";
import {useToast} from "@/app/components/ToastController";
import {useModal} from "@/app/components/ModalController";

export default function Home() {
    const [files, setFiles] = useState<{ fileName: string; fileId: string; }[] | null>(null);
    const {showModal, closeModal} = useModal();

    useEffect(() => {
        updateFiles();
    }, []);

    const updateFiles = () => {
        axios.get('/api/share')
            .then((res) => {
                setFiles(res.data.files);
            }).catch((err) => {
            if (err.status === 404) {
                setFiles([]);
                return;
            }
        });
    }

    return (
        <main className={'mt-6'}>
            <ul className={'flex flex-wrap gap-4'}>
                {
                    files ? files.length > 0 ?
                        files.map((file: { fileName: string, fileId: string }, index) => (
                            <li className={'w-[320px] h-[275px] bg-alt-gray-100 flex flex-col justify-between p-4 gap-4'}
                                key={index}>
                            <span
                                className={'overflow-hidden whitespace-nowrap text-ellipsis w-full min-h-6'} title={file.fileName}>{file.fileName}</span>
                                <div className={'text-[70px] w-full overflow-hidden flex justify-center'}>
                                    {
                                        file.fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i) ?
                                            <Image className={'w-full h-full object-cover'} quality={50} width={200} height={200}
                                                   src={`/api/share?id=${file.fileId}`} alt={file.fileName}/>
                                            : <FaFile className={'w-min'}/>
                                    }
                                </div>
                                <div className={'flex justify-end gap-2'}>
                                    <DeleteButton className={'text-xl transition-colors hover:text-red-500'} id={file.fileId} onDelete={updateFiles}><FaTrashAlt/></DeleteButton>
                                    <Link className={'text-white text-xl'} href={`/${file.fileId}`}><FaLink/></Link>
                                    <DownloadButton url={`/api/share?id=${file.fileId}`} name={file.fileName}><FaDownload className={'text-xl'}/></DownloadButton>
                                    {/** TODO: Expiring in */}
                                </div>
                            </li>
                        ))
                        : <span>zadne soubory LLLLLLLLLLLLLL</span> : <span>Načítání...</span>
                }
            </ul>
            <AnchorButton
                className={'fixed bottom-0 right-0 font-heading text-4xl rounded-full font-bold !p-0 m-6 w-12 h-12 grid place-items-center'}
                onClick={() => showModal(false, <AddFile onUpload={() => {
                    updateFiles();
                    closeModal();
                }}/>)}>+</AnchorButton>
        </main>
    );
}

interface BaseProps {
    children?: ReactNode
    className?: string
}

interface DownloadProps extends BaseProps{
    url: string,
    name: string
}

export function DownloadButton({children, url, name}: DownloadProps) {
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

    const showToast = useToast();
    const {showModal, closeModal} = useModal();

    const handleDownload = () => {
        setDownloadProgress(0);

        axios.get(url, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.progress) {
                    setDownloadProgress(progressEvent.progress * 100);
                }
            }
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
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
            })
            .catch((error) => {
                console.error('Download failed', error);
                showToast('Něco se nepovedlo při stahování souboru. ;(');
            });
    }

    return (
        <>

            {
                downloadProgress !== null ?
                    <Modal locked={true} title={'Stahování'}>
                        <div className={'w-full h-4 bg-alt-gray-300 mt-4'}>
                            <div className={'bg-aero-500 transition-all h-full'}
                                 style={{width: downloadProgress + '%'}}></div>
                        </div>
                    </Modal> : null
            }
            <a onClick={handleDownload}>{children}</a>
        </>
    )
}

interface DeleteProps extends BaseProps{
    onDelete?: () => void,
    id: string
}

export function DeleteButton({children, id, onDelete, className}: DeleteProps){
    if (!id) return null;
    const {showModal, closeModal} = useModal();

    const handleDelete = () => {
        axios.delete('/api/share', {
            data: {
                id: id
            }
        }).then(res => {
            onDelete && onDelete();
        });
    }

    return (
        <button className={className}
                onClick={() => showModal(false, 'Opravdu si přejete smazat tento soubor?', 'Opravdu?',
                    <AnchorButton onClick={handleDelete}>Vymáznout</AnchorButton>, <button
                        className={'px-4 w-full h-full'}>Zrušit</button>)}>{children}
        </button>
    )
}
