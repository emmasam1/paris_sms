import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiDownloadLine } from "react-icons/ri";

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = async (evt) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    if (outcome === 'accepted') setSupportsPWA(false);
  };

  return (
    <AnimatePresence>
      {supportsPWA && (
        <motion.div 
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-8 right-8 z-[100]"
        >
          {/* Outer Pulsing Glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
          />

          <motion.button
            onClick={onClick}
            whileHover={{ width: "180px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative group flex items-center justify-start bg-blue-600 text-white h-14 w-14 rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden cursor-pointer border border-blue-400/30"
          >
            {/* Pulsing Icon Container */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="min-w-[56px] h-full flex items-center justify-center"
            >
              <RiDownloadLine className="text-2xl" />
            </motion.div>

            {/* Hidden Text */}
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-6 text-sm">
              Install App
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;