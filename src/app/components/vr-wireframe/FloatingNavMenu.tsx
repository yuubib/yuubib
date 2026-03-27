import { motion } from "motion/react";
import { Home, Users, Map, Settings, Box, Grid3x3 } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home", angle: -40 },
  { icon: Grid3x3, label: "Apps", angle: -24 },
  { icon: Users, label: "Social", angle: -8 },
  { icon: Map, label: "Explore", angle: 8 },
  { icon: Box, label: "Inventory", angle: 24 },
  { icon: Settings, label: "Settings", angle: 40 },
];

export function FloatingNavMenu() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2">
      <div className="relative w-20 h-96">
        {/* Arc background */}
        <div className="absolute inset-0 border-l-2 border-white/30 rounded-l-full" />
        
        {/* Nav items */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;
          
          return (
            <motion.button
              key={item.label}
              onClick={() => setActiveIndex(index)}
              className={`absolute left-0 w-16 h-16 flex items-center justify-center border-2 ${
                isActive ? "border-white bg-white/10" : "border-white/60 bg-black"
              } transition-colors`}
              style={{
                top: "50%",
                transform: `translateY(-50%) rotate(${item.angle}deg) translateX(${Math.abs(item.angle) * 1.5}px)`,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-white/80"}`} style={{ transform: `rotate(-${item.angle}deg)` }} />
            </motion.button>
          );
        })}
        
        {/* Active label */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 ml-4">
          <div className="text-white font-mono text-sm border-2 border-white/60 bg-black px-3 py-2 whitespace-nowrap">
            {navItems[activeIndex].label}
          </div>
        </div>
      </div>
    </div>
  );
}
