import React from 'react';
import { motion } from 'motion/react';

export const Quest1StoryAnimation = ({ startAnimation = false }: { startAnimation?: boolean }) => {
    return (
        <div className="w-full h-64 bg-sky-100 rounded-xl overflow-hidden relative border-4 border-deep-blue/20">
            {/* Sky and Sun */}
            <svg className="absolute inset-0 w-full h-full" overflow="hidden">
                <defs>
                    <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#BAE6FD" />
                        <stop offset="100%" stopColor="#E0F2FE" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#skyGradient)" />
                <motion.circle
                    cx="80%" cy="20%" r="30" fill="#FDE047"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </svg>

            {/* Clouds */}
            <motion.div
                className="absolute top-10 left-10 text-white/80"
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <svg width="60" height="40" viewBox="0 0 60 40" fill="currentColor">
                    <path d="M10,30 Q20,10 40,30 T60,30 H10 Z" />
                </svg>
            </motion.div>

            {/* Water Background */}
            <div className="absolute bottom-0 w-full h-24 bg-blue-300"></div>

            {/* Dock */}
            <div className="absolute bottom-16 left-0 w-1/3 h-12 bg-amber-700/80 border-t-4 border-amber-900 rounded-r-lg"></div>

            {/* Scene Container for interacting elements */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">

                <motion.g
                    initial={{ x: 0, y: 0, rotate: 0 }}
                    animate={startAnimation ? {
                        y: [0, -5, 0, 0, -5, 0],
                        rotate: [0, 1, -1, 0, 1, 0],
                        x: [0, 0, 0, 0, 0, 200] // Wait until 0.8 to move
                    } : { y: [0, -5, 0], rotate: [0, 1, -1, 0] }}
                    transition={{
                        duration: startAnimation ? 10 : 3,
                        times: startAnimation ? [0, 0.4, 0.5, 0.6, 0.8, 1] : [0, 0.5, 0.75, 1], // Unified timings
                        repeat: startAnimation ? 0 : Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Boat Body */}
                    <path d="M 350,300 Q 450,380 550,300 L 530,250 H 370 L 350,300 Z" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="3" />
                    <path d="M 450,250 V 150 L 520,200 L 450,250" fill="#F472B6" stroke="#DB2777" strokeWidth="2" /> {/* Sail */}
                    <rect x="445" y="150" width="10" height="100" fill="#4B5563" /> {/* Mast */}
                    {/* Steering Wheel/Tiller Area */}
                    <path d="M 520,250 L 540,230" stroke="#78350F" strokeWidth="4" /> {/* Tiller handle */}
                    <circle cx="540" cy="230" r="5" fill="#92400E" />
                </motion.g>

                {/* Waves Foreground */}
                <motion.path
                    d="M0,320 Q200,350 400,320 T800,320 V400 H0 Z"
                    fill="#60A5FA"
                    fillOpacity="0.6"
                    animate={{
                        d: [
                            "M0,320 Q200,350 400,320 T800,320 V400 H0 Z",
                            "M0,330 Q200,300 400,330 T800,330 V400 H0 Z",
                            "M0,320 Q200,350 400,320 T800,320 V400 H0 Z"
                        ]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Ameer Character */}
                <motion.g
                    initial={{ x: 100, y: 190 }} // Start on dock
                    animate={startAnimation ? {
                        x: [100, 380, 400, 400, 400, 600], // Walk to edge, jump in, sit, stay, sail
                        y: [190, 190, 230, 250, 250, 250], // Walk, drop, sit lower (250)
                        opacity: [1, 1, 1, 1, 1, 1]
                    } : {}}
                    transition={{
                        duration: 10,
                        times: [0, 0.4, 0.5, 0.6, 0.8, 1], // Matches boat times
                        ease: "easeInOut",
                        delay: 0
                    }}
                >
                    {/* Head */}
                    <circle cx="20" cy="20" r="15" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                    {/* Body */}
                    <rect x="5" y="35" width="30" height="40" rx="5" fill="#3B82F6" />
                    {/* Legs */}
                    <line x1="12" y1="75" x2="12" y2="100" stroke="#1E3A8A" strokeWidth="4" />
                    <line x1="28" y1="75" x2="28" y2="100" stroke="#1E3A8A" strokeWidth="4" />
                </motion.g>

                {/* Ameerah Character */}
                <motion.g
                    initial={{ x: 50, y: 195, rotate: 0 }} // Start behind Ameer
                    animate={startAnimation ? {
                        x: [50, 250, 350, 430, 510, 710], // Walk, closer, jump in, tiller, sail
                        y: [195, 195, 195, 230, 220, 220],
                        rotate: [0, 0, 0, 0, 10, 10] // Lean forward at tiller
                    } : {}}
                    transition={{
                        duration: 10,
                        times: [0, 0.4, 0.5, 0.6, 0.8, 1], // Matches boat times
                        ease: "easeInOut",
                        delay: 0
                    }}
                >
                    {/* Hair */}
                    <circle cx="20" cy="20" r="18" fill="#1F2937" />
                    {/* Head */}
                    <circle cx="20" cy="20" r="14" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                    {/* Body (Dress) */}
                    <path d="M 5,40 L 35,40 L 40,80 L 0,80 Z" fill="#EC4899" />
                    {/* Legs */}
                    <line x1="15" y1="80" x2="15" y2="100" stroke="#831843" strokeWidth="4" />
                    <line x1="25" y1="80" x2="25" y2="100" stroke="#831843" strokeWidth="4" />
                </motion.g>

            </svg>
        </div>
    );
};
