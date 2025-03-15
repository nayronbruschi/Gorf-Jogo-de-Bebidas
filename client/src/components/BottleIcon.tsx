import { motion } from "framer-motion";

export function BottleIcon() {
  return (
    <motion.div className="relative w-full h-full">
      {/* Círculo roxo escuro de fundo */}
      <div className="absolute inset-0 rounded-full bg-purple-900/90" />

      {/* Seta roxa */}
      <motion.img
        src="/api/images/icone-fleche-droite-violet.png"
        alt="Seta"
        className="absolute inset-0 w-full h-full object-contain p-8"
      />
    </motion.div>
  );
}