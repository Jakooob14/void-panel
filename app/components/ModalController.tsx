'use client';

import React, {createContext, useContext, useState, useCallback, ReactNode, MouseEventHandler} from 'react';
import { AnimatePresence } from 'framer-motion';
import {Modal} from "@/app/components/Modal";

type ModalType = {
    id: number,
    children?: ReactNode,
    isOpen?: boolean,
    title?: string,
    locked: boolean,
    primaryButton?: ReactNode,
    exitButton?: ReactNode,
};

type ModalContextType = {
    showModal: (locked: boolean, children?: ReactNode, title?: string, primaryButton?: ReactNode, exitButton?: ReactNode) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modals, setModals] = useState<ModalType[]>([]);

    const showModal = useCallback((locked: boolean = false, children?: ReactNode, title?: string, primaryButton?: ReactNode, exitButton?: ReactNode) => {
        const id = Date.now();
        setModals((prev) => [...prev, { id, title, primaryButton, exitButton, children, locked }]);
    }, []);

    const closeModal = useCallback(() => {
        setModals((prev) => prev.slice(0, -1)); // Remove the most recent modal
    }, []);

    return (
        <ModalContext.Provider value={{showModal, closeModal}}>
            {children}
            <div className={''}>
                <AnimatePresence>
                    {modals.map((modal) => (
                        <Modal
                            key={modal.id}
                            title={modal.title}
                            primaryButton={modal.primaryButton}
                            exitButton={modal.exitButton}
                            locked={modal.locked}
                            onClose={() => !modal.locked && setModals((prev) => prev.filter((_modal) => _modal.id !== modal.id))}
                        >{modal.children}</Modal>
                    ))}
                </AnimatePresence>
            </div>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
