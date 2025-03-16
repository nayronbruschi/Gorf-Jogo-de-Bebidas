import { motion } from "framer-motion";

export function BottleIcon() {
  return (
    <div className="relative w-full h-full">
      {/* Círculo roxo escuro estático de fundo */}
      <div className="absolute inset-0 rounded-full bg-purple-900/90" />

      {/* Container da garrafa que vai girar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.img
          src="https://firebasestorage.googleapis.com/v0/b/gorf-jogo-de-bebidas.firebasestorage.app/o/Garrafa-2.png?alt=media&token=fb17efb1-9110-4f2e-9875-2ba87f63f25e"
          alt="Garrafa"
          className="w-3/4 h-3/4 object-contain"
        />
      </div>
    </div>
  );
}