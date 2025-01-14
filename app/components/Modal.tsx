import { MouseEventHandler, ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heading1 } from "@/app/components/Headings";
import { motion } from "motion/react";
import {on} from "next/dist/client/components/react-dev-overlay/pages/bus";

interface ModalProps {
    children?: ReactNode,
    isOpen?: boolean,
    onClose?: MouseEventHandler<HTMLElement>,
    title?: string,
    locked: boolean
    primaryButton?: ReactNode,
    exitButton?: ReactNode,
}

export function Modal({
                          children,
                          isOpen = true,
                          locked = false,
                          onClose,
                          title,
                          primaryButton,
                          exitButton,
                      }: ModalProps) {
    const [opacity, setOpacity] = useState(1);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setOpacity(1);
            setShouldRender(true);
        } else {
            setOpacity(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (opacity === 0) {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 200); // Match the fade-out duration
            return () => clearTimeout(timer);
        }
    }, [opacity]);

    if (!shouldRender || typeof document === "undefined") return null;

    const handleClose = (e: React.MouseEvent<HTMLElement>) => {
        if (!onClose) return;

        setOpacity(0);
        setTimeout(() => {
            onClose(e);
        }, 200); // Delay the onClose after the fade-out
    };

    return createPortal(
        <motion.div
            className={"fixed z-[100] top-0 left-0 w-screen h-screen overflow-hidden"}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity }}
            transition={{ duration: 0.2 }}
        >
            <div
                className={"absolute w-full h-full bg-alt-gray-100 opacity-70"}
                onClick={(e) => !locked && handleClose(e)}
            ></div>
            <div
                className={
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[500px] min-h-[200px] bg-alt-gray-200 shadow-lg p-6 flex flex-col justify-between"
                }
            >
                <div>
                    <Heading1 className={"!text-5xl"}>{title}</Heading1>
                    <span className={"my-4"}>{children}</span>
                </div>
                <div className={"flex flex-end gap-2"}>
                    {primaryButton && <div onClick={(e) => !locked && handleClose(e)}>{primaryButton}</div>}
                    {exitButton && <div onClick={(e) => !locked && handleClose(e)}>{exitButton}</div>}
                </div>
            </div>
        </motion.div>,
        document.body
    );
}
