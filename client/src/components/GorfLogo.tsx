import { motion } from "framer-motion";

export function GorfLogo() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-32 h-32 relative mx-auto"
    >
      {/* Gota principal */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d="M50 5 C80 40 80 70 50 95 C20 70 20 40 50 5"
          fill="white"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        {/* Respingos */}
        <motion.circle cx="30" cy="20" r="5" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        />
        <motion.circle cx="70" cy="30" r="3" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        />
        <motion.circle cx="60" cy="15" r="4" fill="white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.4 }}
        />
      </svg>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="text-4xl font-bold text-white text-center mt-4"
      >
        Gorf
      </motion.h1>
    </motion.div>
  );
}
