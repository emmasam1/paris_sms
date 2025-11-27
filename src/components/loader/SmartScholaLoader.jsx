import React from "react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png"; // <-- update path if different

const SmartScholaLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      {/* Heartbeat logo */}
      <motion.img
        src={logo}
        alt="SmartSchola Logo"
        className="w-50"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Loading Text */}
      <motion.p
        className=" text-gray-700 text-lg font-semibold tracking-wide"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Loading result...
      </motion.p>
    </div>
  );
};

export default SmartScholaLoader;
