import { motion } from "framer-motion";

export function GorfLogo() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-48 mx-auto"
    >
      <motion.img
        src="/LOGOGORF.png"
        alt="Gorf Logo"
        className="w-full h-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      />
    </motion.div>
  );
}