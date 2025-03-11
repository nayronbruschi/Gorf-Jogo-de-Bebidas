import { motion } from "framer-motion";

export function GorfLogo({ size = "large" }: { size?: "small" | "large" }) {
  const logoSize = size === "small" ? "h-8" : "h-32";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.img
        src="/images/LOGOGORF.png"
        alt="Gorf Logo"
        className={`${logoSize} object-contain`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {size === "large" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Bora jogar?
          </h1>
        </motion.div>
      )}
    </motion.div>
  );
}