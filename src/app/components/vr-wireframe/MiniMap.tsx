import { motion } from "motion/react";

export function MiniMap() {
  return (
    <motion.div
      className="fixed bottom-8 right-8 w-48 h-48 border-2 border-white/60 bg-black/90 backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      {/* Map title */}
      <div className="absolute -top-6 left-0 text-white/80 text-xs font-mono">
        MINI-MAP
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <g key={i}>
              <line
                x1={(i + 1) * 20}
                y1="0"
                x2={(i + 1) * 20}
                y2="100"
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1={(i + 1) * 20}
                x2="100"
                y2={(i + 1) * 20}
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="0.5"
              />
            </g>
          ))}
          
          {/* Player position (center) */}
          <motion.circle
            cx="50"
            cy="50"
            r="3"
            fill="white"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Other objects */}
          <rect x="30" y="25" width="4" height="4" fill="white" fillOpacity="0.6" />
          <rect x="65" y="40" width="4" height="4" fill="white" fillOpacity="0.6" />
          <rect x="45" y="70" width="4" height="4" fill="white" fillOpacity="0.6" />
          <rect x="20" y="60" width="4" height="4" fill="white" fillOpacity="0.6" />
          <rect x="75" y="80" width="4" height="4" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
      
      {/* Compass */}
      <div className="absolute top-2 right-2 w-8 h-8 border border-white/40 flex items-center justify-center">
        <span className="text-white/60 text-xs font-mono">N</span>
      </div>
      
      {/* Coordinates */}
      <div className="absolute bottom-2 left-2 text-white/60 text-[10px] font-mono">
        X: 0.0 Y: 0.0 Z: 0.0
      </div>
    </motion.div>
  );
}
