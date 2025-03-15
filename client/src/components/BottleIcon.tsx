import { motion } from "framer-motion";

export function BottleIcon() {
  return (
    <div className="relative w-full h-full">
      {/* Círculo roxo escuro estático de fundo */}
      <div className="absolute inset-0 rounded-full bg-purple-900/90" />

      {/* Container da seta roxa que vai girar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.img
          src="/api/images/icone-fleche-droite-violet.png"
          alt="Seta"
          className="w-3/4 h-3/4 object-contain"
        />
      </div>
    </div>
  );
}