import { getStorageItem } from "@/utils/storage";
import React, { useState } from 'react';
import Chat from './Chat';
import { ContactSupport } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';

export default function ChatComp() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const senderId = parseInt(getStorageItem("userId"))

    return (
        <div className="relative">
            <AnimatePresence>
                {isChatOpen ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed bottom-0 right-0 z-[999]"
                    >
                        <Chat setOpen={setIsChatOpen} senderId={senderId ? senderId : null} />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-5 md:bottom-10 z-[99999] right-5 md:right-10 bg-primary w-[60px] cursor-pointer h-[60px] rounded-full flex justify-center items-center text-white hover:scale-110 duration-100 border border-white"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <ContactSupport fontSize="large" className="text-[30px]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
