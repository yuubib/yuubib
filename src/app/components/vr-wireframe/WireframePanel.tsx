import { motion } from "motion/react";

interface WireframePanelProps {
  title: string;
  rows?: number;
  depth?: number;
}

export function WireframePanel({ title, rows = 3, depth = 0 }: WireframePanelProps) {
  return (
    <motion.div
      className="border-2 border-white/60 bg-black p-6 min-w-[300px]"
      style={{
        transform: `perspective(1000px) translateZ(${depth}px)`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Panel header */}
      <div className="border-b border-white/40 pb-3 mb-4">
        <h3 className="text-white font-mono text-sm">{title}</h3>
      </div>
      
      {/* Content rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Icon placeholder */}
            <div className="w-8 h-8 border border-white/50 flex-shrink-0" />
            
            {/* Text placeholder */}
            <div className="flex-1 space-y-2">
              <div className="h-2 bg-white/30 w-3/4" />
              <div className="h-2 bg-white/20 w-1/2" />
            </div>
            
            {/* Action placeholder */}
            <div className="w-16 h-6 border border-white/50" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
