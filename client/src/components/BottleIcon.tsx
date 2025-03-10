import { motion } from "framer-motion";

export function BottleIcon() {
  return (
    <motion.svg
      viewBox="0 0 100 300"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gargalo */}
      <path
        d="M40 20 L40 0 L60 0 L60 20 L55 30 L45 30 Z"
        fill="#9333ea"
        opacity="0.9"
      />
      
      {/* Corpo da garrafa */}
      <path
        d="M45 30 L30 50 L30 280 C30 290 40 300 50 300 C60 300 70 290 70 280 L70 50 L55 30 Z"
        fill="#9333ea"
        opacity="0.8"
      />
      
      {/* Reflexo */}
      <path
        d="M35 50 L35 270 C35 280 42 290 50 290 L50 50 Z"
        fill="white"
        opacity="0.2"
      />
      
      {/* Rótulo */}
      <rect
        x="35"
        y="120"
        width="30"
        height="60"
        rx="5"
        fill="white"
        opacity="0.3"
      />
    </motion.svg>
  );
}
