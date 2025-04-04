import { motion } from "framer-motion";

export function GorfLogo({ 
  size = "large", 
  className = "", 
  showText = false,
  text = "" 
}: { 
  size?: "small" | "large", 
  className?: string,
  showText?: boolean,
  text?: string
}) {
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
      {showText && (
        <motion.h1
          className="text-center text-xl text-white mt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {text}
        </motion.h1>
      )}
    </motion.div>
  );
}