import { motion } from "framer-motion";

export function GorfLogo({ size = "large", className = "" }: { size?: "small" | "large", className?: string }) {
  const logoSize = size === "small" ? "h-8" : "h-16";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center gap-2 ${className}`}
    >
      <motion.img
        src="/api/images/LOGOGORF.png"
        alt="Gorf Logo"
        className={`${logoSize} object-contain`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Removido o texto "Bora jogar?" conforme solicitado */}
    </motion.div>
  );
}