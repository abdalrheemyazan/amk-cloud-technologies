"use client";

import { Cloud, Database, Activity, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroVisual() {
  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center pointer-events-none">
      {/* Base Grid / Plane */}
      <div className="absolute bottom-10 w-[120%] h-[200px] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_rotateZ(-45deg)] opacity-40 blur-[1px]" />

      {/* Main Cloud */}
      <motion.div 
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-20 z-20"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-200 blur-3xl opacity-50 rounded-full" />
          <div className="relative bg-white border border-slate-100 rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05),inset_0_-10px_20px_rgba(0,0,0,0.02)] flex items-center justify-center">
            <Cloud className="w-24 h-24 text-blue-500" />
          </div>
        </div>
      </motion.div>

      {/* Server Stack */}
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 left-10 z-30"
      >
        <div className="relative flex flex-col gap-4 [transform:rotateX(20deg)_rotateY(30deg)]">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20" />
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="relative bg-slate-900 border border-slate-700 rounded-xl w-64 h-20 shadow-[20px_20px_40px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.1)] flex items-center px-6 gap-4">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <div className="flex-1" />
              <div className="w-16 h-2 bg-slate-700 rounded-full" />
              <div className="w-8 h-2 bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 left-10 z-10 bg-white border border-slate-100 p-4 rounded-2xl shadow-xl flex items-center justify-center"
      >
        <Activity className="w-8 h-8 text-blue-500" />
      </motion.div>

      <motion.div 
        animate={{ y: [-15, 15, -15], x: [-5, 5, -5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-40 right-10 z-10 bg-white border border-slate-100 p-5 rounded-2xl shadow-xl flex items-center justify-center"
      >
        <Shield className="w-10 h-10 text-emerald-500" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-10 left-1/3 z-10 bg-white border border-slate-100 p-3 rounded-xl shadow-lg flex items-center justify-center"
      >
        <Database className="w-6 h-6 text-indigo-500" />
      </motion.div>

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none">
        <path d="M 200 300 Q 300 200 400 300 T 600 200" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
        <path d="M 100 400 Q 250 300 300 450 T 500 350" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_15s_linear_infinite]" />
      </svg>
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}
