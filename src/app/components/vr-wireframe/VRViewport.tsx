import { motion } from "motion/react";
import { WireframeCard } from "./WireframeCard";
import { WireframePanel } from "./WireframePanel";

export function VRViewport() {
  return (
    <div className="flex-1 flex items-center justify-center px-32 py-16">
      {/* Main viewport with perspective */}
      <div className="relative w-full max-w-6xl">
        {/* Crosshair/Focus indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="relative w-12 h-12">
            <div className="absolute top-1/2 left-0 w-4 h-[2px] bg-white/40" />
            <div className="absolute top-1/2 right-0 w-4 h-[2px] bg-white/40" />
            <div className="absolute left-1/2 top-0 h-4 w-[2px] bg-white/40" />
            <div className="absolute left-1/2 bottom-0 h-4 w-[2px] bg-white/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-white/60" />
          </div>
        </div>

        {/* Curved viewport frame */}
        <div className="border-2 border-white/30 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          {/* Content area with 3D perspective */}
          <div className="p-12" style={{ perspective: "1200px" }}>
            <div className="grid grid-cols-3 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <WireframeCard label="CARD-01" height="h-40">
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <div className="h-2 bg-white/30 w-full mb-2" />
                      <div className="h-2 bg-white/20 w-2/3" />
                    </div>
                  </WireframeCard>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <WireframeCard label="CARD-02" height="h-56">
                    <div className="absolute inset-0 p-4">
                      <div className="border border-white/40 w-full h-24 mb-3" />
                      <div className="h-2 bg-white/30 w-full mb-2" />
                      <div className="h-2 bg-white/20 w-3/4" />
                    </div>
                  </WireframeCard>
                </motion.div>
              </div>
              
              {/* Center column - Featured content */}
              <div className="col-span-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <WireframePanel title="MAIN VIEWPORT" rows={4} depth={20} />
                </motion.div>
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <WireframeCard label="CARD-03" height="h-40">
                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-white/50" />
                    </div>
                  </WireframeCard>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <WireframeCard label="CARD-04" height="h-56">
                    <div className="absolute inset-0 p-4 flex flex-col gap-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-8 h-8 border border-white/40" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-white/30 w-full" />
                            <div className="h-2 bg-white/20 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </WireframeCard>
                </motion.div>
              </div>
            </div>
            
            {/* Bottom action bar */}
            <motion.div
              className="mt-8 border-t-2 border-white/30 pt-6 flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-20 h-12 border-2 border-white/60 bg-black flex items-center justify-center">
                  <div className="w-6 h-6 border border-white/50" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* VR HUD indicators */}
        <div className="absolute top-4 left-4 font-mono text-xs text-white/60">
          <div>FPS: 90</div>
          <div>LATENCY: 12ms</div>
        </div>
        
        <div className="absolute top-4 right-4 font-mono text-xs text-white/60 text-right">
          <div>HEADSET: CONNECTED</div>
          <div>TRACKING: ACTIVE</div>
        </div>
      </div>
    </div>
  );
}
