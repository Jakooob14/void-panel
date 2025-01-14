'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

type ToastProps = {
    message: string;
    onClose: () => void;
    duration?: number;
};

const Toast = ({ message, onClose, duration = 3000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <motion.div
            className={
                'bg-alt-gray-300 border-alt-gray-200 shadow-[rgba(0,0,0,0.4)_0_0_30px_-10px] border-2 px-4 py-2'
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {message}
        </motion.div>
    );
};

export default Toast;
