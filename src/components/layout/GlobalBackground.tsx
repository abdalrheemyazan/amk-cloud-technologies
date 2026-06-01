"use client";

import { motion } from "framer-motion";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-[#F8FAFC]">
      {/* Precision Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Floating Cinematic Light Meshes */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.45] blur-[130px]">
        {/* Orb 1: Brand Blue */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-[10%] left-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-400/25 to-blue-600/5"
        />

        {/* Orb 2: Royal Indigo */}
        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[35%] -right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-300/20 to-purple-400/5"
        />

        {/* Orb 3: Soft Sapphire */}
        <motion.div
          animate={{
            x: [0, 60, -80, 0],
            y: [0, 90, -40, 0],
            scale: [1, 1.1, 0.85, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-[10%] left-[20%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-blue-300/15 via-indigo-200/10 to-transparent"
        />
      </div>
      
      {/* Light vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/50 via-transparent to-[#F8FAFC]/80 pointer-events-none" />
    </div>
  );
}
